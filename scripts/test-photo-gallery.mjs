import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = (await readFile(new URL('../src/services/wordpress/gallery.ts', import.meta.url), 'utf8'))
  .replace('import.meta.env.VITE_WP_SITE_URL', JSON.stringify('https://wordpress.example/'));
const js = ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 });
const { fetchPhotoAlbums, fetchPhotoAlbum, GalleryApiError } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const originalFetch = globalThis.fetch;
try {
  const controller = new AbortController();
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: new URL(url), signal: options.signal };
    return Response.json({ albums: [], total: 0, totalPages: 0 });
  };
  assert.equal((await fetchPhotoAlbums(3, controller.signal)).total, 0);
  assert.equal(request.url.origin, 'https://wordpress.example');
  assert.equal(request.url.pathname, '/index.php');
  assert.equal(request.url.searchParams.get('rest_route'), '/crfal/v1/photo-albums');
  assert.equal(request.url.searchParams.get('page'), '3');
  assert.equal(request.url.searchParams.get('per_page'), '12');
  controller.abort();
  assert.equal(request.signal.aborted, true, 'Caller cancellation propagates to the request');

  globalThis.fetch = async (url) => {
    request = { url: new URL(url) };
    return Response.json({ id: 16492, photos: [{ id: 16497 }, { id: 16493 }] });
  };
  const album = await fetchPhotoAlbum('entrega-de-carteiras-arapiraca');
  assert.equal(request.url.searchParams.get('rest_route'), '/crfal/v1/photo-albums/entrega-de-carteiras-arapiraca');
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
