import assert from 'node:assert/strict';
import { moduleUrl } from './load-typescript.mjs';

const { fetchPhotoAlbums, fetchPhotoAlbum, GalleryApiError } = await import(await moduleUrl('../src/services/wordpress/gallery.ts', {
  'import.meta.env.VITE_WP_SITE_URL': JSON.stringify('https://wordpress.example/'),
  "'../http'": JSON.stringify(await moduleUrl('../src/services/http.ts')),
}));
const originalFetch = globalThis.fetch;
try {
  const controller = new AbortController();
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: new URL(url, 'https://portal.example'), signal: options.signal };
    return Response.json({ albums: [], total: 0, totalPages: 0 });
  };
  assert.equal((await fetchPhotoAlbums(3, controller.signal)).total, 0);
  assert.equal(request.url.origin, 'https://portal.example');
  assert.equal(request.url.pathname, '/api/gallery');
  assert.equal(request.url.searchParams.get('page'), '3');
  assert.equal(request.url.searchParams.get('per_page'), '12');

  // Cancelamento do chamador durante a requisição chega ao fetch.
  globalThis.fetch = (url, options) => {
    request = { url: new URL(url, 'https://portal.example'), signal: options.signal };
    return new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
    });
  };
  const pending = fetchPhotoAlbums(1, controller.signal);
  controller.abort();
  await assert.rejects(pending, error => error.name === 'AbortError');
  assert.equal(request.signal.aborted, true, 'Caller cancellation propagates to the request');

  globalThis.fetch = async (url) => {
    request = { url: new URL(url, 'https://portal.example') };
    return Response.json({ id: 16492, photos: [{ id: 16497 }, { id: 16493 }] });
  };
  const album = await fetchPhotoAlbum('entrega-de-carteiras-arapiraca');
  assert.equal(request.url.searchParams.get('slug'), 'entrega-de-carteiras-arapiraca');
  assert.deepEqual(album.photos.map(photo => photo.id), [16497, 16493], 'Preserve server photo selection and order');
  globalThis.fetch = async () => new Response('', { status: 404 });
  await assert.rejects(fetchPhotoAlbum('inexistente'), error => error instanceof GalleryApiError && error.status === 404);
  globalThis.fetch = async () => new Response('', { status: 503 });
  await assert.rejects(fetchPhotoAlbums(), error => error.status === 503);
  globalThis.fetch = async () => { throw new TypeError('Network unavailable'); };
  await assert.rejects(fetchPhotoAlbums(), /Network unavailable/);
  console.log('Galeria: URLs, paginação, seleção/ordem, cancelamento, 404, 503 e falha de rede validados.');
} finally {
  globalThis.fetch = originalFetch;
}
