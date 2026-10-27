import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { moduleUrl } from './load-typescript.mjs';

const dom = new JSDOM('', { url: 'https://institucional.crf-al.org.br' });
globalThis.window = dom.window;
const realPurify = `data:text/javascript;base64,${Buffer.from(
  `import createDOMPurify from ${JSON.stringify(import.meta.resolve('dompurify'))}; export default createDOMPurify(globalThis.window);`
).toString('base64')}`;
const { sanitizeWP, SANITIZE_CONFIG, filterIframe, secureLink } = await import(await moduleUrl('../src/services/wordpress/sanitize.ts', {
  "'dompurify'": JSON.stringify(realPurify),
  "'@/config/site'": JSON.stringify(await moduleUrl('../src/config/site.ts')),
}));
const element = (tagName, attributes = {}) => {
  const attrs = new Map(Object.entries(attributes)); let removed = false;
  return {
    tagName, attrs, get removed() { return removed; },
    getAttribute: name => attrs.get(name) ?? null, setAttribute: (name, value) => attrs.set(name, value), hasAttribute: name => attrs.has(name),
    parentNode: { removeChild() { removed = true; } },
  };
};
for (const tag of ['style', 'form', 'input', 'button', 'textarea', 'select']) assert.ok(SANITIZE_CONFIG.FORBID_TAGS.includes(tag), tag);
assert.ok(SANITIZE_CONFIG.ADD_TAGS.includes('iframe'));
assert.equal(SANITIZE_CONFIG.SANITIZE_NAMED_PROPS, true);
assert.ok(!SANITIZE_CONFIG.FORBID_ATTR.includes('style'), 'Atributo style (alinhamento dos posts) continua aceito');

let frame = element('IFRAME', { src: 'https://www.youtube-nocookie.com/embed/abc_D-1?start=10' });
assert.equal(filterIframe(frame), true); assert.equal(frame.attrs.get('loading'), 'lazy');
assert.equal(frame.attrs.get('referrerpolicy'), 'strict-origin-when-cross-origin');
frame = element('IFRAME', { src: 'https://www.youtube.com/embed/abc123' });
assert.equal(filterIframe(frame), true, 'Embed antigo é convertido');
assert.equal(frame.attrs.get('src'), 'https://www.youtube-nocookie.com/embed/abc123');
for (const src of ['https://evil.example/embed/x', 'https://www.youtube-nocookie.com.evil.example/embed/x', 'javascript:alert(1)', 'https://www.youtube-nocookie.com/watch?v=x', '']) {
  frame = element('IFRAME', { src });
  assert.equal(filterIframe(frame), false, src); assert.equal(frame.removed, true, src);
}

const origins = ['https://institucional.crf-al.org.br'];
let link = element('A', { href: 'https://www.cff.org.br/x' }); secureLink(link, origins);
assert.equal(link.attrs.get('rel'), 'noopener noreferrer');
link = element('A', { href: '/imprensa/noticias' }); secureLink(link, origins);
assert.equal(link.attrs.get('rel'), undefined, 'Link interno sem rel');
link = element('A', { href: 'https://institucional.crf-al.org.br/contato' }); secureLink(link, origins);
assert.equal(link.attrs.get('rel'), undefined);
link = element('A', { href: 'mailto:contato@example.org' }); secureLink(link, origins);
assert.equal(link.attrs.get('rel'), undefined);
link = element('A', { href: '#secao' }); secureLink(link, origins);
assert.equal(link.attrs.get('href'), '#user-content-secao', 'Âncora acompanha o id prefixado');
link = element('A', { href: '#' }); secureLink(link, origins);
assert.equal(link.attrs.get('href'), '#');
console.log('Sanitização: tags proibidas, iframes youtube-nocookie, links externos e âncoras validados.');

const dirty = `
  <form id="location"><input name="cookie"></form>
  <p id="secao">Texto</p><a href="#secao">Ir</a>
  <a href="javascript:alert(1)">Perigo</a>
  <svg onload="alert(1)"><a xlink:href="javascript:alert(1)">X</a></svg>
  <img src="x" onerror="alert(1)">
  <iframe src="https://evil.example/embed/x"></iframe>
  <iframe SRC="HTTPS://WWW.YOUTUBE.COM/embed/abc123" srcdoc="<script>alert(1)</script>"></iframe>
  <style>body{display:none}</style><script>alert(1)</script>
`;
const clean = sanitizeWP(dirty);
const document = new JSDOM(clean).window.document;
assert.equal(document.querySelectorAll('script,form,input,style').length, 0);
assert.ok(document.querySelector('#user-content-secao'));
assert.equal(document.querySelector('a').getAttribute('href'), '#user-content-secao');
assert.equal(document.querySelectorAll('iframe').length, 1);
assert.equal(document.querySelector('iframe').getAttribute('src'), 'https://www.youtube-nocookie.com/embed/abc123');
for (const node of document.querySelectorAll('*')) {
  for (const attr of node.attributes) {
    assert.ok(!/^on/i.test(attr.name), attr.name);
    assert.notEqual(attr.name, 'srcdoc');
    assert.ok(!/^javascript:/i.test(attr.value), attr.value);
  }
}
const links = new JSDOM(sanitizeWP(`
  <a href="https://www.crf-al.org.br/publicacao/noticia?x=1#secao" target="_blank" rel="opener">Legado</a>
  <a href="https://institucional.crf-al.org.br/pagina#secao">Atual</a>
  <a href="https://external.example/#secao" target="_blank">Externo</a>
  <a href="#user-content-secao" target="janela">Local</a>
  <a href="https://www.crf-al.org.br/app/uploads/2024/08/edital.pdf#page=2">Upload legado</a>
  <a href="https://crf-al.org.br/servicos/">Página legada</a>
`)).window.document.querySelectorAll('a');
assert.equal(links[0].getAttribute('href'), '/publicacao/noticia?x=1#user-content-secao');
assert.equal(links[0].getAttribute('target'), '_blank');
assert.equal(links[0].getAttribute('rel'), 'noopener noreferrer');
assert.equal(links[1].getAttribute('href'), 'https://institucional.crf-al.org.br/pagina#user-content-secao');
assert.equal(links[2].getAttribute('href'), 'https://external.example/#secao');
assert.equal(links[2].getAttribute('rel'), 'noopener noreferrer');
assert.equal(links[3].getAttribute('href'), '#user-content-secao');
assert.equal(links[3].getAttribute('target'), '_self');
assert.equal(links[4].getAttribute('href'), 'https://www.crf-al.org.br/app/uploads/2024/08/edital.pdf#page=2', 'Upload legado não vira caminho do portal');
assert.equal(links[4].getAttribute('rel'), 'noopener noreferrer');
assert.equal(links[5].getAttribute('href'), 'https://crf-al.org.br/servicos/', 'Página legada sem rota no portal');
dom.window.close();
delete globalThis.window;
console.log('DOMPurify real: XSS, srcdoc, SVG, iframe e DOM clobbering validados em jsdom.');
