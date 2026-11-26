#!/usr/bin/env node
/**
 * Gera a base de conhecimento da IA de atendimento (widget do Chatwoot):
 * um markdown com os textos do site (requerimentos, tutoriais, manual do CRF AL
 * em Casa, contatos) e o `docs/ia/faq-ia.md`. O n8n lê o arquivo publicado em
 * `/ia/base.md` e manda inteiro no prompt (com cache do provedor), sem RAG.
 *
 * Uso: node scripts/generate-ia-base.mjs [pasta-de-saida]  (padrão: dist)
 * Saída: <pasta>/ia/base.md e <pasta>/ia/base.json ({ versao, gerado_em, caracteres }).
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, process.argv[2] ?? 'dist');

const vite = await createServer({
  root,
  configFile: join(root, 'vite.config.ts'),
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
});

try {
  const load = (p) => vite.ssrLoadModule(p);
  const [site, contato, req, serv, guias, manual] = await Promise.all([
    load('/src/config/site.ts'),
    load('/src/config/contact.ts'),
    load('/src/data/requerimentos.ts'),
    load('/src/data/servicos.ts'),
    load('/src/data/tutoriais-guias.ts'),
    load('/src/data/manual-crf-em-casa.ts'),
  ]);
  const URL_BASE = site.SITE_URL;
  const link = (p) => (p.startsWith('http') ? p : `${URL_BASE}${p}`);
  const lista = (itens) => itens.map((i) => `- ${i}`).join('\n');
  const L = [];

  L.push('# Base de conhecimento do atendimento do CRF-AL');
  L.push('Fonte: site oficial do CRF-AL. Use só o que está aqui. Sempre que citar um serviço, mande o link da página.');

  // Contatos e locais
  const at = contato.ATENDIMENTO;
  const sc = contato.SETOR_CONTATOS;
  L.push('\n## Contatos e atendimento presencial');
  L.push(lista([
    `Horário de atendimento: ${contato.HORARIO_ATENDIMENTO}`,
    `Atendimento geral: telefone e WhatsApp ${at.whatsapp}, e-mail ${at.email}`,
    `Fiscalização: e-mail ${sc.fiscalizacao.email}, WhatsApp ${sc.fiscalizacao.whatsapp}`,
    `Ouvidoria: e-mail ${sc.ouvidoria.email}, portal ${site.OUVIDORIA_URL}`,
    `Suporte do CRF AL em Casa (acesso, senha, erro no sistema): e-mail ${sc.tecnologia.email}`,
    ...contato.LOCAIS.map((l) => `${l.nome} (${l.cidade}): ${l.endereco}`),
    `Página de contato: ${link('/contato')}`,
  ]));
  L.push('\n## Links úteis');
  L.push(lista([
    `CRF AL em Casa (login): ${site.CRF_EM_CASA_URL}`,
    `Pré-inscrição de profissional (sem login): ${site.PRE_INSCRICAO_PF_URL}`,
    `Pré-inscrição de estabelecimento (sem login): ${site.PRE_INSCRICAO_PJ_URL}`,
    `Boletos de anuidade do ano (sem login): ${site.BOLETOS_URL}`,
    `Portal da transparência: ${site.TRANSPARENCIA_URL}`,
    `Pedido de informação (e-SIC): ${site.ESIC_URL}`,
    `Requerimentos: ${link('/servicos/requerimentos')}`,
    `Tutoriais: ${link('/servicos/tutoriais')}`,
    `Manual do CRF AL em Casa: ${link('/servicos/manual-crf-em-casa')}`,
    `Legislação: ${link('/legislacao')}`,
    `Fiscalização: ${link('/fiscalizacao')}`,
    `Notícias: ${link('/imprensa/noticias')}`,
    `Política de privacidade: ${link('/politica-de-privacidade')}`,
  ]));

  // Manual
  L.push('\n## Manual do CRF AL em Casa');
  L.push(`Página: ${link('/servicos/manual-crf-em-casa')}`);
  for (const s of manual.MANUAL_CRF_EM_CASA) {
    L.push(`\n### ${s.title}`);
    L.push(`Link: ${link(`/servicos/manual-crf-em-casa#${s.id}`)}`);
    L.push(s.text.join('\n'));
    if (s.steps?.length) L.push(lista(s.steps));
  }

  // Requerimentos
  const menus = [
    ['Pessoa física (profissional)', req.individualMenu],
    ['Pessoa jurídica (estabelecimento)', req.corporateMenu],
  ];
  L.push('\n## Requerimentos');
  for (const [perfil, cats] of menus) {
    for (const cat of cats) {
      for (const it of cat.items) {
        L.push(`\n### ${it.title} — ${perfil}, ${cat.title}`);
        L.push(`Link: ${link(req.caminhoDoRequerimento(it.id))}`);
        if (it.sinonimos?.length) L.push(`Também chamado de: ${it.sinonimos.join(', ')}`);
        L.push(it.description);
        if (it.paraQueServe?.length) L.push(`Para que serve: ${it.paraQueServe.join(' ')}`);
        if (it.quemPodeSolicitar) L.push(`Quem pode solicitar: ${it.quemPodeSolicitar}`);
        if (it.documentos?.length) L.push(`Documentos:\n${lista(it.documentos)}`);
        if (it.instrucoes?.length) L.push(`Como solicitar:\n${lista(it.instrucoes)}`);
        L.push(`Observações:\n${lista(req.observacoesDoRequerimento(it))}`);
        if (it.taxaAplicavel) L.push(`Taxa: ${it.taxaAplicavel}`);
        if (it.prazo) L.push(`Prazo: ${it.prazo}`);
        if (it.acesso) L.push(`Começar por: ${it.acesso.label} (${it.acesso.url})`);
        if (it.downloadUrl) L.push(`Formulário: ${link(it.downloadUrl)}`);
        if (it.baseLegal) L.push(`Base legal: ${it.baseLegal.label} (${it.baseLegal.url})`);
      }
    }
  }

  // Tutoriais (os vinculados a requerimento repetem os passos: só o resumo e o guia)
  L.push('\n## Tutoriais');
  for (const t of serv.tutoriais) {
    const g = guias.GUIAS[t.id];
    L.push(`\n### ${t.titulo} (${t.category})`);
    L.push(`Link: ${link(`/servicos/tutoriais/${t.id}`)}`);
    if (t.sinonimos?.length) L.push(`Também chamado de: ${t.sinonimos.join(', ')}`);
    L.push(t.description);
    if (t.requerimentoId) L.push(`Passos e documentos: ver o requerimento ${link(req.caminhoDoRequerimento(t.requerimentoId))}`);
    else if (t.steps?.length) L.push(`Passos:\n${lista(t.steps)}`);
    if (t.prazo && !t.requerimentoId) L.push(`Prazo: ${t.prazo}`);
    if (t.acesso && !t.requerimentoId) L.push(`Começar por: ${t.acesso.label} (${t.acesso.url})`);
    if (g) {
      if (g.antes?.length) L.push(`Antes de começar: ${g.antes.join('; ')}`);
      if (g.depois?.length) L.push(`Depois do envio:\n${lista(g.depois)}`);
      if (g.problemas?.length) L.push(`Problemas comuns:\n${lista(g.problemas.map((p) => `${p.sintoma}: ${p.solucao}`))}`);
    }
  }

  // FAQ escrito à mão a partir das dúvidas reais do widget
  const faq = await readFile(join(root, 'docs/ia/faq-ia.md'), 'utf8').catch(() => '');
  if (faq.trim()) L.push(`\n${faq.trim().replace(/^# .*\n/, '## Perguntas frequentes\n')}`);

  const texto = `${L.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
  const versao = createHash('sha256').update(texto).digest('hex').slice(0, 12);
  await mkdir(join(outDir, 'ia'), { recursive: true });
  await writeFile(join(outDir, 'ia/base.md'), texto);
  await writeFile(join(outDir, 'ia/base.json'), `${JSON.stringify({ versao, gerado_em: new Date().toISOString(), caracteres: texto.length })}\n`);
  console.log(`base da IA: ${join(outDir, 'ia/base.md')} (${texto.length} caracteres, versão ${versao})`);
} finally {
  await vite.close();
}
