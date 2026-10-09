import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync('src/config/page-metadata.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {PAGE_METADATA}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const base=process.argv[2] || 'http://localhost:8790';
const canonical='https://institucional.crf-al.org.br';
const htmlDecode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
function meta(html,key){const tags=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>m[0]).filter(t=>t.includes(`property="${key}"`)||t.includes(`name="${key}"`));assert.equal(tags.length,1,`${key}: exactly one tag`);return htmlDecode(tags[0].match(/content="([^"]*)"/)[1]);}
const routes=fs.readFileSync('src/router/app-router.tsx','utf8');
for(const match of routes.matchAll(/\{ path: '([^':*]+)', element:/g)){const path='/'+match[1];if(path==='/instituicao/missao-visao')continue;assert.ok(PAGE_METADATA[path],`route coverage ${path}`);}
for(const [path,expected] of Object.entries(PAGE_METADATA)){
 const response=await fetch(base+path+'?utm_source=test');assert.equal(response.status,200,path);const html=await response.text();assert.equal(meta(html,'og:title'),expected.title+' | CRFAL',path);assert.equal(meta(html,'description'),expected.description,path);assert.equal(meta(html,'og:url'),canonical+(path==='/'?'':path));assert.equal(meta(html,'og:image'),canonical+'/images/og-image.jpg');assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert.ok(html.includes('data-page-metadata="true"'));
}
const albumPath='/imprensa/galeria-de-fotos/entrega-de-carteiras-arapiraca';
for(const ua of ['Mozilla/5.0','WhatsApp/2.0','facebookexternalhit/1.1']){
 const response=await fetch(base+albumPath,{headers:{'user-agent':ua}});const html=await response.text();assert.equal(response.status,200);assert.equal(meta(html,'og:title'),'ENTREGA DE CARTEIRAS - ARAPIRACA | CRFAL');assert.ok(meta(html,'og:image').includes('/wp-content/uploads/'));assert.equal(meta(html,'og:url'),canonical+albumPath);
}
const missing=await fetch(base+'/imprensa/galeria-de-fotos/album-inexistente-metadata-test');assert.equal(missing.status,404);assert.equal(meta(await missing.text(),'robots'),'noindex, nofollow');
const redirect=await fetch(base+'/instituicao/missao-visao',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),canonical+'/instituicao/sobre-conselho');
const asset=await fetch(base+'/images/logo-crf-azul.png');assert.equal(asset.status,200);assert.ok(asset.headers.get('content-type').includes('image/'));
const wpNews=await fetch('https://www.crf-al.org.br/wp-json/wp/v2/posts?per_page=1&_embed=wp:featuredmedia');const [news]=await wpNews.json();const newsHtml=await (await fetch(base+'/imprensa/noticias/'+news.slug)).text();assert.equal(meta(newsHtml,'og:type'),'article');assert.equal(meta(newsHtml,'og:url'),canonical+'/imprensa/noticias/'+news.slug);assert.ok(meta(newsHtml,'og:title').length>12);
const events=await (await fetch('https://wordpress.crf-al.org.br/index.php?rest_route=%2Fcrfal%2Fv1%2Fevents')).json();if(events.length){const event=events[0];const response=await fetch(base+'/eventos/'+event.slug);assert.equal(response.status,200);const html=await response.text();assert.equal(meta(html,'og:type'),'article');if(event.banner)assert.equal(meta(html,'og:image'),event.banner);}
console.log(`OK: ${Object.keys(PAGE_METADATA).length} static pages, albums, news, events, browsers/crawlers, canonical URLs, missing content and assets (${base}).`);
