import { TRANSPARENCIA_URL } from '@/config/site';

export interface SectionNavLink {
  label: string;
  href: string;
  external?: boolean;
  /** Também fica ativo em subpáginas (ex.: álbuns dentro da galeria). */
  matchPrefix?: boolean;
}

export interface SectionNav {
  label: string;
  href: string;
  links: SectionNavLink[];
}

/** Abas exibidas na base do cabeçalho das páginas internas, por seção do site. */
export const SECTION_NAV = {
  instituicao: {
    label: 'Instituição',
    href: '/instituicao',
    links: [
      { label: 'Sobre o Conselho', href: '/instituicao/sobre-conselho' },
      { label: 'Diretoria', href: '/instituicao/diretoria' },
    ],
  },
  servicos: {
    label: 'Serviços',
    href: '/servicos/requerimentos',
    links: [
      { label: 'Requerimentos', href: '/servicos/requerimentos' },
      { label: 'Tutoriais', href: '/servicos/tutoriais' },
      { label: 'Ouvidoria', href: '/servicos/ouvidoria' },
    ],
  },
  fiscalizacao: {
    label: 'Fiscalização',
    href: '/fiscalizacao',
    links: [
      { label: 'Visão geral', href: '/fiscalizacao' },
      { label: 'Papel', href: '/fiscalizacao/papel-da-fiscalizacao' },
      { label: 'Instrumentos', href: '/fiscalizacao/instrumentos-da-fiscalizacao' },
      { label: 'Plano anual', href: '/fiscalizacao/plano-de-fiscalizacao-anual' },
      { label: 'Relatórios', href: '/fiscalizacao/relatorios' },
      { label: 'Processo fiscal', href: '/fiscalizacao/processo-administrativo-fiscal' },
      { label: 'Afastamento provisório', href: '/fiscalizacao/afastamento-provisorio' },
      { label: 'Legislação', href: '/legislacao' },
      { label: 'Custos', href: TRANSPARENCIA_URL, external: true },
    ],
  },
  imprensa: {
    label: 'Imprensa',
    href: '/imprensa/noticias',
    links: [
      { label: 'Notícias', href: '/imprensa/noticias', matchPrefix: true },
      { label: 'Notícias do CFF', href: '/imprensa/noticias-cff' },
      { label: 'Galeria de Fotos', href: '/imprensa/galeria-de-fotos', matchPrefix: true },
      { label: 'Eventos', href: '/eventos', matchPrefix: true },
    ],
  },
} satisfies Record<string, SectionNav>;

export type SectionKey = keyof typeof SECTION_NAV;
