import type { ElementType } from 'react';
import {
  BarChart3,
  BookOpenText,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Compass,
  CreditCard,
  ExternalLink,
  FileText,
  Gavel,
  HeadphonesIcon,
  Images,
  Landmark,
  Newspaper,
  PlayCircle,
  Receipt,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { CRF_EM_CASA_URL, TRANSPARENCIA_URL } from '@/config/site';

export interface NavSubItem {
  label: string;
  href: string;
  icon: ElementType;
  /** Uma linha curta explicando o destino (exibida no menu desktop). */
  description?: string;
  external?: boolean;
}

export interface NavColumn {
  title: string;
  items: NavSubItem[];
}

/** Card de destaque exibido à direita do menu desktop. */
export interface NavFeature {
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string; external?: boolean };
  /** Contato secundário opcional (e-mail, telefone). */
  secondary?: { label: string; href: string };
}

export interface NavItem {
  label: string;
  href: string;
  columns?: NavColumn[];
  feature?: NavFeature;
  directIcon?: ElementType;
  /** Rotas que pertencem à seção além dos próprios links (ex.: subpáginas). */
  matchPrefixes?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Instituição',
    href: '/instituicao',
    matchPrefixes: ['/instituicao'],
    columns: [
      {
        title: 'O CRF-AL',
        items: [
          { label: 'Sobre o Conselho', href: '/instituicao/sobre-conselho', icon: Landmark, description: 'História, missão e atribuições' },
          { label: 'Diretoria', href: '/instituicao/diretoria', icon: Users, description: 'Diretoria e conselheiros da gestão' },
          { label: 'Plenárias', href: '/instituicao/plenarias', icon: CalendarDays, description: 'Sessões plenárias do Conselho' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Acesso à informação',
      title: 'Portal da Transparência',
      text: 'Receitas, despesas, contratos, licitações e custos do Conselho.',
      cta: { label: 'Acessar o portal', href: TRANSPARENCIA_URL, external: true },
    },
  },
  {
    label: 'Serviços',
    href: '/servicos/requerimentos',
    matchPrefixes: ['/servicos'],
    columns: [
      {
        title: 'Atendimento digital',
        items: [
          { label: 'Requerimentos', href: '/servicos/requerimentos', icon: FileText, description: 'Documentos e formulários por serviço' },
          { label: 'Tutoriais', href: '/servicos/tutoriais', icon: PlayCircle, description: 'Guias passo a passo do CRF AL em Casa' },
          { label: 'Ouvidoria', href: '/servicos/ouvidoria', icon: HeadphonesIcon, description: 'Reclamações, sugestões e denúncias' },
        ],
      },
      {
        title: 'Financeiro',
        items: [
          { label: 'Boletos e Anuidades', href: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/consulta/boletos/inicial.jsf', icon: CreditCard, description: 'Segunda via e consulta de débitos', external: true },
        ],
      },
    ],
    feature: {
      eyebrow: 'Atendimento online',
      title: 'CRF AL em Casa',
      text: 'Envie requerimentos, emita certidões e acompanhe seus processos sem sair de casa.',
      cta: { label: 'Acessar o sistema', href: CRF_EM_CASA_URL, external: true },
    },
  },
  {
    label: 'Fiscalização',
    href: '/fiscalizacao',
    matchPrefixes: ['/fiscalizacao', '/legislacao'],
    columns: [
      {
        title: 'Atuação',
        items: [
          { label: 'Visão geral', href: '/fiscalizacao', icon: ShieldCheck, description: 'Como o CRF-AL fiscaliza' },
          { label: 'Papel da Fiscalização', href: '/fiscalizacao/papel-da-fiscalizacao', icon: Compass, description: 'Objetivos e base normativa' },
          { label: 'Instrumentos', href: '/fiscalizacao/instrumentos-da-fiscalizacao', icon: ClipboardCheck, description: 'Termos, autos e notificações' },
          { label: 'Plano Anual', href: '/fiscalizacao/plano-de-fiscalizacao-anual', icon: Target, description: 'Planejamento das ações do ano' },
        ],
      },
      {
        title: 'Processos e normas',
        items: [
          { label: 'Relatórios', href: '/fiscalizacao/relatorios', icon: BarChart3, description: 'Resultados publicados por ano' },
          { label: 'Processo Administrativo', href: '/fiscalizacao/processo-administrativo-fiscal', icon: Gavel, description: 'Defesa, recursos e penalidades' },
          { label: 'Afastamento Provisório', href: '/fiscalizacao/afastamento-provisorio', icon: CalendarClock, description: 'Como comunicar o afastamento' },
          { label: 'Legislação', href: '/legislacao', icon: BookOpenText, description: 'Leis, resoluções e normas' },
          { label: 'Custos da Fiscalização', href: TRANSPARENCIA_URL, icon: Receipt, description: 'No Portal da Transparência', external: true },
        ],
      },
    ],
    feature: {
      eyebrow: 'Fale com o setor',
      title: 'Departamento de Fiscalização',
      text: 'Para comunicações formais, envio de documentos e dúvidas sobre fiscalização.',
      cta: { label: 'fiscalizacao@crf-al.org.br', href: 'mailto:fiscalizacao@crf-al.org.br', external: true },
      secondary: { label: 'WhatsApp do setor', href: 'https://wa.me/5582999998624' },
    },
  },
  {
    label: 'Imprensa',
    href: '/imprensa/noticias',
    matchPrefixes: ['/imprensa', '/eventos', '/publicacao'],
    columns: [
      {
        title: 'Comunicação',
        items: [
          { label: 'Notícias', href: '/imprensa/noticias', icon: Newspaper, description: 'Comunicados, alertas e notícias' },
          { label: 'Notícias do CFF', href: '/imprensa/noticias-cff', icon: Landmark, description: 'Do Conselho Federal de Farmácia' },
          { label: 'Galeria de Fotos', href: '/imprensa/galeria-de-fotos', icon: Images, description: 'Álbuns de eventos e ações' },
          { label: 'Eventos', href: '/eventos', icon: CalendarDays, description: 'Agenda de capacitações e encontros' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Para a imprensa',
      title: 'Assessoria de Comunicação',
      text: 'Pedidos de entrevista, informações institucionais e material de imprensa.',
      cta: { label: 'ascom@crf-al.org.br', href: 'mailto:ascom@crf-al.org.br', external: true },
    },
  },
  {
    label: 'Transparência',
    href: TRANSPARENCIA_URL,
    directIcon: ExternalLink,
  },
  {
    label: 'Fale Conosco',
    href: '/contato',
    matchPrefixes: ['/contato'],
  },
];

function matchesPath(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Indica se a rota atual pertence a um item do menu principal. */
export function isNavItemActive(item: NavItem, pathname: string) {
  if (item.matchPrefixes?.some((prefix) => matchesPath(prefix, pathname))) return true;
  return Boolean(item.columns?.some((column) => column.items.some((sub) => !sub.external && sub.href === pathname)));
}

/** Página exata do submenu (para marcar a página atual). */
export function isNavSubItemActive(sub: NavSubItem, pathname: string) {
  return !sub.external && pathname === sub.href;
}
