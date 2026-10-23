/**
 * Parceiros exibidos na faixa de logos da home.
 *
 * COMO ADICIONAR/ALTERAR (sem mexer em mais nada):
 *  1. Coloque a logo em `public/images/parceiros/` (SVG ou PNG transparente, mín. 600 px de largura).
 *  2. Adicione um objeto abaixo com `logo: '/images/parceiros/nome.svg'`.
 *  3. Commit/push — o deploy cuida do resto.
 *
 * Sem `logo`, o site mostra o nome do parceiro em texto, na cor informada em `color`.
 * `exemplo: true` marca parceiros fictícios da prévia; com algum deles na lista,
 * a faixa mostra o aviso "Prévia com logos ilustrativas".
 */

export interface Parceiro {
  /** Nome do parceiro (também usado como texto alternativo da logo). */
  nome: string;
  /** Linha curta abaixo do nome quando não há logo (ex.: "Pós-graduação"). */
  categoria?: string;
  /** Logo em /public. Opcional: sem ela, o nome aparece em texto. */
  logo?: string;
  /** Cor do nome em texto (quando não há logo). */
  color?: string;
  /** Site do parceiro (abre em nova aba). */
  href?: string;
  /** Parceiro fictício, só para a prévia. */
  exemplo?: boolean;
}

export const parceiros: Parceiro[] = [
  { nome: 'Pague Menos', categoria: 'Rede de farmácias', color: '#D52B1E', href: 'https://www.paguemenos.com.br', exemplo: true },
  { nome: 'Permanente', categoria: 'Pós-graduação', color: '#0B4A8B', exemplo: true },
  { nome: 'Pós Navigare', categoria: 'Pós-graduação', color: '#0E7C86', exemplo: true },
  { nome: 'IPOG', categoria: 'Pós-graduação', color: '#E4572E', href: 'https://www.ipog.edu.br', exemplo: true },
  { nome: 'Ensino Einstein', categoria: 'Educação em saúde', color: '#1D3C78', href: 'https://ensino.einstein.br', exemplo: true },
  { nome: 'ICTQ', categoria: 'Pós em farmácia', color: '#6B2C91', href: 'https://www.ictq.com.br', exemplo: true },
  { nome: 'Racine', categoria: 'Cursos para farmacêuticos', color: '#00875A', href: 'https://www.racine.com.br', exemplo: true },
  { nome: 'Extrafarma', categoria: 'Rede de farmácias', color: '#005CA9', href: 'https://www.extrafarma.com.br', exemplo: true },
];
