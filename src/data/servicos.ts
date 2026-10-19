import type { ElementType } from 'react';
import {
  BadgeCheck,
  CalendarOff,
  Edit3,
  FileClock,
  FileSearch,
  Gavel,
  MessageSquareText,
  ReceiptText,
  Stamp,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { getRequerimento, perfilDoRequerimento } from '@/data/requerimentos';
import { BOLETOS_URL } from '@/config/site';

export type TutorialPerfil = 'pessoa-fisica' | 'pessoa-juridica';

/** Vídeo vertical (9:16) em motion, servido de `public/images/tutoriais/`. */
export interface TutorialMotion {
  src: string;
  poster: string;
  /** Duração exibida no botão, ex.: `0:30`. */
  duracao: string;
}

interface TutorialBase {
  /** Slug usado no link direto (`?tutorial=<id>`). */
  id: string;
  icon: ElementType;
  title: string;
  description: string;
  category: string;
  motion?: TutorialMotion;
}

/**
 * Tutorial espelho de um requerimento: passos, vídeo, prazo e perfil vêm de
 * `src/data/requerimentos.ts`. Para mudar o texto, edite o requerimento.
 */
interface TutorialVinculado extends TutorialBase {
  requerimentoId: string;
}

/** Serviço de autoatendimento do CRF AL em Casa que não é um requerimento. */
interface TutorialAutoatendimento extends TutorialBase {
  /** `ambos` aparece nos dois filtros de perfil. */
  perfil: TutorialPerfil | 'ambos';
  prazo?: string;
  steps: string[];
  videoUrl?: string;
  /** Página do CRF AL em Casa que inicia o serviço; sem ela, o botão leva ao login. */
  acesso?: { url: string; label: string };
}

type TutorialSource = TutorialVinculado | TutorialAutoatendimento;

export interface Tutorial extends TutorialBase {
  perfil: TutorialPerfil | 'ambos';
  prazo?: string;
  steps: string[];
  videoUrl?: string;
  /** Presente quando o tutorial espelha um requerimento. */
  requerimentoId?: string;
  /** Página do CRF AL em Casa que inicia o serviço (vem do requerimento). */
  acesso?: { url: string; label: string };
}

const fontes: TutorialSource[] = [
  // Inscrição
  {
    id: 'primeira-inscricao',
    icon: UserPlus,
    title: 'Primeira Inscrição (Provisória)',
    description: 'Para farmacêuticos que nunca estiveram inscritos em um Conselho Regional de Farmácia.',
    category: 'Inscrição',
    requerimentoId: 'primeira-inscricao-profissional-provisoria',
  },
  {
    id: 'inscricao-definitiva',
    icon: BadgeCheck,
    title: 'Inscrição Definitiva',
    description: 'Solicite a inscrição definitiva e a carteira profissional com o diploma.',
    category: 'Inscrição',
    requerimentoId: 'inscricao-profissional-definitiva',
  },
  // Cadastro
  {
    id: 'alteracao-de-dados',
    icon: Edit3,
    title: 'Alteração de Dados',
    description: 'Atualize os dados do seu cadastro profissional pelo CRF AL em Casa.',
    category: 'Cadastro',
    perfil: 'pessoa-fisica',
    prazo: 'Imediato',
    steps: [
      'Faça login no CRF AL em Casa como Pessoa Física.',
      'Acesse "Meus Dados".',
      'Clique no campo correspondente ao dado que deseja alterar.',
      'Altere as informações necessárias.',
      'Anexe documentos comprobatórios, se necessário.',
      'Confirme as alterações clicando em "Salvar Protocolo".',
    ],
  },
  // Responsabilidade técnica
  {
    id: 'contratacao-rt',
    icon: Stamp,
    title: 'Contratação de Responsável Técnico',
    description: 'Vincule um farmacêutico como responsável técnico do estabelecimento.',
    category: 'Responsabilidade Técnica',
    requerimentoId: 'contratacao-rt-pj',
  },
  {
    id: 'baixa-rt',
    icon: UserMinus,
    title: 'Baixa de Responsabilidade Técnica',
    description: 'Encerre o vínculo de responsabilidade técnica sem precisar anexar requerimento.',
    category: 'Responsabilidade Técnica',
    perfil: 'pessoa-fisica',
    prazo: 'Imediato',
    videoUrl: 'https://www.youtube.com/watch?v=1EfNUxgilW0',
    motion: { src: '/images/tutoriais/baixa-rt.mp4', poster: '/images/tutoriais/baixa-rt-poster.webp', duracao: '0:19' },
    steps: [
      'Faça login no CRF AL em Casa como Pessoa Física.',
      'Clique em "Baixa de Contrato de Trabalho".',
      'Em "Responsabilidades Técnicas", selecione a empresa do vínculo a ser encerrado.',
      'Selecione o motivo da baixa.',
      'Informe a data do contrato e a data de desligamento.',
      'Se houver problemas no desligamento, anexe uma declaração expondo os motivos e, se existir, a cópia da ação na Justiça do Trabalho.',
      'Clique em "Salvar Protocolo".',
    ],
  },
  {
    id: 'consulta-rt',
    icon: FileSearch,
    title: 'Consulta de Responsabilidade Técnica',
    description: 'Consulte seus vínculos de responsabilidade técnica ativos.',
    category: 'Responsabilidade Técnica',
    perfil: 'pessoa-fisica',
    prazo: 'Imediato',
    steps: [
      'Faça login no CRF AL em Casa como Pessoa Física.',
      'Clique em "Resp. Técnicas Ativas/Perfil".',
      'As empresas com as quais você tem vínculo serão exibidas.',
      'Confira o tipo de vínculo, a situação e os perfis.',
    ],
  },
  // Fiscalização
  {
    id: 'afastamento-provisorio',
    icon: CalendarOff,
    title: 'Comunicado de Afastamento Provisório',
    description: 'Comunique o afastamento provisório pelo CRF AL em Casa e evite ser autuado durante a ausência.',
    category: 'Fiscalização',
    perfil: 'pessoa-fisica',
    videoUrl: 'https://www.youtube.com/watch?v=nd6smKz0R78',
    steps: [
      'Faça login no CRF AL em Casa como Pessoa Física.',
      'Clique em "Comunicado de Afastamento Provisório".',
      'Selecione a responsabilidade técnica (RT).',
      'Selecione o motivo da ausência.',
      'Informe a data de início e de término do afastamento.',
      'Informe o horário de início e de término, quando o motivo permitir.',
      'Anexe um comprovante do motivo da ausência. Atestado médico deve ser apresentado presencialmente no CRF-AL em até 10 dias.',
      'Clique em "Salvar Protocolo".',
      'Se necessário, acompanhe o processo em "Protocolos Web".',
    ],
  },
  {
    id: 'justificativa-de-ausencia',
    icon: MessageSquareText,
    title: 'Justificativa de Ausência',
    description: 'Justifique uma ausência identificada em inspeção da fiscalização.',
    category: 'Fiscalização',
    perfil: 'pessoa-fisica',
    steps: [
      'Faça login no CRF AL em Casa como Pessoa Física.',
      'Abra o menu "Justificativa de Ausência".',
      'Selecione a inspeção com ausência identificada.',
      'Preencha o formulário exibido.',
      'Clique em "Salvar Justificativa".',
    ],
  },
  {
    id: 'defesa-auto-infracao',
    icon: Gavel,
    title: 'Defesa de Auto de Infração',
    description: 'Apresente a defesa do estabelecimento contra um auto de infração, pelo CRF AL em Casa.',
    category: 'Fiscalização',
    requerimentoId: 'defesa-auto-infracao',
  },
  // Protocolos e boletos
  {
    id: 'situacao-protocolos',
    icon: FileClock,
    title: 'Situação dos Protocolos',
    description: 'Acompanhe o andamento das suas solicitações pelo número de protocolo.',
    category: 'Protocolos e Boletos',
    perfil: 'ambos',
    prazo: 'Imediato',
    motion: { src: '/images/tutoriais/protocolos.mp4', poster: '/images/tutoriais/protocolos-poster.webp', duracao: '0:30' },
    steps: [
      'Faça login no CRF AL em Casa.',
      'Na página inicial, clique em "Protocolos Web".',
      'Localize a solicitação pelo número de protocolo.',
      'Confira a situação e, se houver pendência, envie o que foi pedido.',
    ],
  },
  {
    id: 'emitir-boletos',
    icon: ReceiptText,
    title: 'Emitir Boletos e Anuidades',
    description: 'Emita o boleto da anuidade do ano, sem precisar fazer login. Parcelamentos e acordos têm um caminho próprio.',
    category: 'Protocolos e Boletos',
    perfil: 'ambos',
    prazo: 'Imediato',
    motion: { src: '/images/tutoriais/boletos.mp4', poster: '/images/tutoriais/boletos-poster.webp', duracao: '0:30' },
    acesso: { url: BOLETOS_URL, label: 'Emitir boleto' },
    steps: [
      'Clique em "Emitir boleto" abaixo para abrir a "Impressão de Anuidades do Ano Corrente", sem login.',
      'Selecione o tipo (por exemplo, Farmacêutico) e preencha os dados pedidos na tela, como inscrição, CPF e data de nascimento.',
      'Clique em "Consultar" para ver as anuidades do ano em aberto.',
      'Selecione a anuidade e imprima o boleto.',
      'Essa consulta mostra só anuidades do ano ainda não vencidas. Para parcelamentos e acordos, abra a tela de acesso do CRF AL em Casa e clique em "Impressão Parcelamentos/Acordo" no Painel de Controle; para débitos vencidos, entre na área restrita ou fale com o CRF-AL.',
    ],
  },
];

function resolver(fonte: TutorialSource): Tutorial {
  if (!('requerimentoId' in fonte)) return fonte;
  const requerimento = getRequerimento(fonte.requerimentoId);
  if (!requerimento) throw new Error(`Tutorial "${fonte.id}" aponta para requerimento inexistente: ${fonte.requerimentoId}`);
  return {
    ...fonte,
    perfil: perfilDoRequerimento(requerimento.id),
    prazo: requerimento.prazo,
    steps: requerimento.instrucoes,
    videoUrl: requerimento.videoUrl,
    acesso: requerimento.acesso,
  };
}

export const tutoriais: Tutorial[] = fontes.map(resolver);
