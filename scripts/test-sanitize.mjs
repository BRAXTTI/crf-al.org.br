import assert from 'node:assert/strict';
import { moduleUrl } from './load-typescript.mjs';

// Sem DOM no Node: valida a configuração e os hooks com elementos mínimos.
const fakePurify = `data:text/javascript;base64,${Buffer.from('export default { addHook() {}, sanitize: (html) => html };').toString('base64')}`;
const { SANITIZE_CONFIG, filterIframe, secureLink } = await import(await moduleUrl('../src/services/wordpress/sanitize.ts', {
  "'dompurify'": JSON.stringify(fakePurify),
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
