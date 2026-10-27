import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { siteConfig } from './load-config.mjs';
const code=ts.transpileModule(fs.readFileSync('src/config/page-metadata.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {PAGE_METADATA}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const base=process.argv[2] || 'http://localhost:8790';
const { SITE_URL: canonical } = await siteConfig();
const htmlDecode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
function meta(html,key){const tags=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>m[0]).filter(t=>t.includes(`property="${key}"`)||t.includes(`name="${key}"`));assert.equal(tags.length,1,`${key}: exactly one tag`);return htmlDecode(tags[0].match(/content="([^"]*)"/)[1]);}
const routes=fs.readFileSync('src/router/app-router.tsx','utf8');
for(const match of routes.matchAll(/\{ path: '([^':*]+)', (?:element: (?!<Navigate)|lazy: )/g)){const path='/'+match[1];if(['/instituicao/missao-visao','/instituicao/estatuto'].includes(path))continue;assert.ok(PAGE_METADATA[path],`route coverage ${path}`);}
for(const [path,expected] of Object.entries(PAGE_METADATA)){
 const response=await fetch(base+path+'?utm_source=test');assert.equal(response.status,200,path);const html=await response.text();assert.equal(meta(html,'og:title'),expected.title+' | CRFAL',path);assert.equal(meta(html,'description'),expected.description,path);assert.equal(meta(html,'og:url'),canonical+(path==='/'?'':path));assert.equal(meta(html,'og:image'),canonical+'/images/og-image.jpg');assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert.ok(html.includes('data-page-metadata="true"'));
}
const albumsResponse = await fetch(base+'/api/gallery');
assert.equal(albumsResponse.status, 200, 'Origem da galeria disponível');
const { albums } = await albumsResponse.json();
assert.ok(albums?.length, 'Smoke test requer ao menos um álbum publicado');
const album = albums[0];
const albumPath = '/imprensa/galeria-de-fotos/' + album.slug;
for(const ua of ['Mozilla/5.0','WhatsApp/2.0','facebookexternalhit/1.1']){
 const response=await fetch(base+albumPath,{headers:{'user-agent':ua}});const html=await response.text();assert.equal(response.status,200);assert.equal(meta(html,'og:title'),album.title + ' | CRFAL');if(album.cover)assert.equal(meta(html,'og:image'),album.cover.src);assert.equal(meta(html,'og:url'),canonical+albumPath);
}
const statute = await fetch(base+'/instituicao/estatuto'); assert.equal(statute.status,404); assert.equal(statute.headers.get('X-Robots-Tag'),'noindex');
const missing=await fetch(base+'/imprensa/galeria-de-fotos/album-inexistente-metadata-test');assert.equal(missing.status,404);assert.equal(meta(await missing.text(),'robots'),'noindex, nofollow');
const redirect=await fetch(base+'/instituicao/missao-visao',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),canonical+'/instituicao/sobre-conselho');
const asset=await fetch(base+'/images/logo-crf-azul.png');assert.equal(asset.status,200);assert.ok(asset.headers.get('content-type').includes('image/'));
const wpNews=await fetch(base+'/api/news?per_page=1');const {posts:[news]}=await wpNews.json();const newsHtml=await (await fetch(base+'/imprensa/noticias/'+news.slug)).text();assert.equal(meta(newsHtml,'og:type'),'article');assert.equal(meta(newsHtml,'og:url'),canonical+'/imprensa/noticias/'+news.slug);assert.ok(meta(newsHtml,'og:title').length>12);
const events=await (await fetch(base+'/api/events')).json();if(events.length){const event=events[0];const response=await fetch(base+'/eventos/'+event.slug);assert.equal(response.status,200);const html=await response.text();assert.equal(meta(html,'og:type'),'article');if(event.banner)assert.equal(meta(html,'og:image'),event.banner);}
console.log(`OK: ${Object.keys(PAGE_METADATA).length} static pages, albums, news, events, browsers/crawlers, canonical URLs, missing content and assets (${base}).`);
