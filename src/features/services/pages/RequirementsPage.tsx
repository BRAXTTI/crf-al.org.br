import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import {
  LEGACY_WP_UPLOADS_URL,
  WP_UPLOADS_URL,
} from '@/services/wordpress/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  ChevronRight,
  FileText,
  Download,
  ClipboardList,
  FileCheck,
  Edit3,
  UserPlus,
  BadgeCheck,
  RefreshCw,
  FilePlus,
  Stamp,
  ShieldCheck,
  Landmark,
  ArrowLeft,
  AlertCircle,
  Info,
  Workflow,
  X,
  Search,
  Clock,
  ListChecks,
  Play,
  PillBottle,
  Link2,
  Check,
  Printer,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface RequirementItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  documentos: string[];
  instrucoes: string[];
  observacoesImportantes?: string | string[];
  taxaAplicavel?: string;
  prazo?: string;
  downloadUrl?: string;
  fluxogramaUrl?: string;
  videoUrl?: string;
}

interface MenuCategory {
  id: string;
  title: string;
  items: RequirementItem[];
}

const DEFAULT_IMPORTANT_OBSERVATION =
  'Caso tenha duvidas quanto ao processo de envio ou manuseio do nosso sistema online CRF AL em Casa envie um email para tecnologia@crf-al.org.br e responderemos em ate 01 (um) dia Útil.';

const individualMenu: MenuCategory[] = [
  {
    id: 'inscricoes-pf',
    title: 'Inscrições',
    items: [
      {
        id: 'primeira-inscricao-profissional-provisoria',
        icon: UserPlus,
        title: 'Primeira Inscrição Profissional (Provisória)',
        description: 'Serviço realizado pelo CRF-AL em Casa para primeira inscrição profissional provisória.',
        documentos: [
          '03 fotos 3x4 coloridas e recentes (entregar na sede/seccional)',
          'Certidão ou declaração de conclusão do curso de Bacharelado em Farmácia',
          'Histórico da graduação acadêmica (original e cópia)',
          'RG ou CNH (original e cópia)',
          'CPF (original e cópia)',
          'Carteira de reservista/certificado de dispensa (original e cópia)',
          'Título de eleitor (original e cópia)',
          'Comprovante de residência (cópia)',
          'Carteira de trabalho física (original e cópia) ou folha de rosto da CTPS digital',
          'Exame de comprovação de tipo sanguíneo',
        ],
        instrucoes: [
          'Acesse o portal do CRF em Casa',
          'Clique em "Pré Inscrição Pessoa Física"',
          'Preencha o formulário atentamente',
          'Anexe os documentos necessários',
          'Imprima seu protocolo e leve sua documentação original na sede/seccional do CRFAL',
          'Aguarde a análise da sua documentação pelo CRFAL',
          'Após a análise e aprovação em plenária, você receberá um email avisando a aprovação da sua inscrição e um boleto para o pagamento da taxa de inscrição',
          'Efetue o pagamento, aguarde a compensação do pagamento para receber a confirmação da sua inscrição',
        ],
        observacoesImportantes: [
          'Leve os documentos originais na sede/seccional para conferência após o protocolo online.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
        fluxogramaUrl: '/images/fluxograma-primeira-inscricao-crfal.png',
      },
      {
        id: 'inscricao-profissional-definitiva',
        icon: BadgeCheck,
        title: 'Inscrição Definitiva',
        description: 'Serviço realizado pelo CRF-AL em Casa para inscrição profissional definitiva.',
        documentos: [
          '03 fotos 3x4 coloridas e recentes (entregar na sede/seccional)',
          'Diploma do curso de Bacharelado em Farmácia (entregar na sede/seccional)',
          'Histórico da graduação acadêmica (original e cópia)',
          'RG ou CNH (original e cópia)',
          'CPF (original e cópia)',
          'Carteira de reservista/certificado de dispensa (original e cópia)',
          'Título de eleitor (original e cópia)',
          'Comprovante de residência (cópia)',
          'Carteira de trabalho física (original e cópia) ou folha de rosto da CTPS digital',
          'Exame de comprovação de tipo sanguíneo',
        ],
        instrucoes: [
          'Acesse o portal do CRF em Casa',
          'Selecione a opção de inscrição definitiva ou alteração para definitiva',
          'Preencha o formulário atentamente',
          'Anexe o diploma e os documentos necessários',
          'Imprima seu protocolo e leve sua documentação original na sede/seccional do CRFAL',
          'Aguarde a análise da sua documentação pelo CRFAL',
          'Após a análise e aprovação, acompanhe a confirmação da sua inscrição pelo portal CRF em Casa',
        ],
        observacoesImportantes: [
          'Leve os documentos originais na sede/seccional para conferência após o protocolo online.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
      },
      {
        id: 'inscricao-secundaria-transferencia-reativacao',
        icon: RefreshCw,
        title: 'Inscrição Secundária, Transferência e Reativação',
        description: 'Requerimento profissional para serviços de inscrição secundária, transferência e reativação.',
        documentos: [
          'Documentos exigidos conforme o tipo de solicitação no próprio requerimento',
          'Documento de identificação pessoal atualizado',
          'Comprovantes complementares solicitados pelo CRF-AL',
        ],
        instrucoes: [
          'Preencha todos os campos do requerimento (digitado ou letra de forma).',
          'Traceje os campos não utilizados e não envie formulário com rasuras.',
          'Anexe os documentos exigidos para o serviço escolhido.',
          'Protocole no canal oficial do CRF-AL.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/12/Inscricao-profissional-Secundaria-transferencia-reativacaoinscricao.docx`,
      },
      {
        id: 'prorrogacao-inscricao-provisoria',
        icon: FilePlus,
        title: 'Prorrogação de Inscrição Provisória',
        description: 'Solicitação de prorrogação da inscrição provisória.',
        documentos: [
          'Formulário de prorrogação preenchido',
          'Documentos exigidos no próprio requerimento',
        ],
        instrucoes: [
          'Preencha o requerimento sem rasuras.',
          'Anexe a documentação exigida no formulário oficial.',
          'Protocole no CRF-AL e acompanhe a análise.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/03/Requerimento-Prorrogacao-de-Inscricao-Provisoria.docx`,
      },
    ],
  },
  {
    id: 'carteira-certidoes-pf',
    title: 'Carteira e Certidões',
    items: [
      {
        id: 'carteira-definitiva-segunda-via',
        icon: BadgeCheck,
        title: 'Carteira Profissional Definitiva ou Segunda Via',
        description: 'Requerimento para carteira definitiva e emissão de segunda via.',
        documentos: [
          'Documentos exigidos conforme o serviço no próprio requerimento',
        ],
        instrucoes: [
          'Preencha todos os campos do requerimento.',
          'Traceje os campos não utilizados e evite rasuras.',
          'Anexe os documentos listados no formulário oficial no CRF AL em Casa (se necessario).',
          'Salve o Protocolo e acompanhe o tramite na opção de "Protocolos Web"',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/03/Requerimento-Inscricao-profissional-carteira-definitiva-segunda-via-de-carteira-definitiva-cedula.docx`,

      },
      {
        id: 'certidao-regularidade-pf',
        icon: FileText,
        title: 'Certidão de Regularidade',
        description: 'Emissão de certidão de regularidade do profissional.',
        documentos: [
          'Número de inscrição no CRF-AL',
          'Regularidade financeira e cadastral',
        ],
        instrucoes: [
          'Acesse o CRF-AL em Casa.',
          'Solicite a certidão no menu de serviços/certidões.',
          'Verifique possíveis pendências antes da emissão.',
        ],
        prazo: 'Emissão imediata (sem pendências)',
        downloadUrl: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
      },
    ],
  },
  {
    id: 'transferencia-cancelamento-pf',
    title: 'Transferência e Cancelamento',
    items: [
      {
        id: 'transferencia-outro-regional',
        icon: Edit3,
        title: 'Transferência para Outro Regional',
        description: 'Solicitação de transferência do registro para outro CRF.',
        documentos: [
          'Requerimento de transferência para outro regional',
          'Documentos exigidos no formulário oficial',
        ],
        instrucoes: [
          'Preencha o requerimento corretamente.',
          'Anexe os documentos solicitados no formulário.',
          'Protocole no CRF-AL em casa e acompanhe o trâmite na opção de "Protocolos Web".',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/03/Requerimento-de-transferencia-para-outro-regional.docx`,
      },
      {
        id: 'cancelamento-inscricao',
        icon: AlertCircle,
        title: 'Cancelamento de Inscrição',
        description: 'Solicitação de cancelamento de inscrição profissional.',
        documentos: [
          'Requerimento de cancelamento de inscrição',
          'Documentação exigida no formulário oficial',
        ],
        instrucoes: [
          'Preencha todos os campos com atenção.',
          'Traceje campos não utilizados e não apresente rasuras.',
          'Anexe os documentos comprobatórios previstos no requerimento.',
          'Protocole no CRF-AL.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/03/Requerimento-de-Cancelamento-de-Inscricao.docx`,
      },
    ],
  },
];

const corporateMenu: MenuCategory[] = [
  {
    id: 'registro-inicial',
    title: 'Registro Inicial',
    items: [
      {
        id: 'registro-novo-pj',
        icon: Building2,
        title: 'Registro Inicial - Pessoa Jurídica',
        description: 'Solicitação de registro inicial para pessoa jurídica no CRF-AL.',
        documentos: [
          'Cópia do CNPJ',
          'Cópia da Inscrição Estadual (quando houver)',
          'Contrato social/ato constitutivo e alterações',
          'RG, CPF e comprovante de residência dos sócios/representantes',
          'Requerimento de RT e DOA',
          'Carteira de Trabalho do farmacêutico (original e cópia)',
          'Procuração e documentos do procurador (quando aplicável)',
        ],
        instrucoes: [
          'Preencha todos os campos corretamente (digitado ou letra de forma).',
          'Traceje campos não utilizados e não envie formulário com rasuras.',
          'Anexe toda a documentação obrigatória em formato legível.',
          'Protocole pelo CRF AL em Casa',
          'Se a contratação for 12x36, use o requerimento específico de plantonista.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${LEGACY_WP_UPLOADS_URL}/2026/04/Contratacao-de-RT-e-Declaracao-de-outras-atividades_ATUALIZADO.docx`,
      },
      {
        id: 'registro-inicial-servico-publico',
        icon: ShieldCheck,
        title: 'Registro Inicial - Serviço Público',
        description: 'Solicitação de registro inicial para estabelecimento público.',
        documentos: [
          'Cópia do CNPJ',
          'Cópia do CNES',
          'Portaria de nomeação do responsável',
          'RG e CPF do responsável legal',
          'Vínculo empregatício (portaria, CNES ou declaração do RH)',
          'Requerimento de contratação de RT e DOA',
        ],
        instrucoes: [
          'Preencha todos os campos corretamente.',
          'Traceje os campos não utilizados e evite rasuras.',
          'Anexe os documentos obrigatórios do órgão e do farmacêutico.',
          'Protocole no CRF-AL e acompanhe eventuais exigências.',
          'Se a contratação for 12x36, use o requerimento específico de plantonista.',
        ],
        observacoesImportantes: [ 'Somente serão aceitas declarações de farmacêuticos que: possuam inscrição definitiva há pelo menos 02 anos, Estejam com sua anuidade em dia, não estão respondendo ou tenham respondido a processo ético-disciplinar nos ultimos 05 anos, possuam perfil de Assistência tipo 01 (presença em pelo menos 70% das inspeções realizadas no seu horário de assistência farmacêutica Resolução 579/13 do CFF)',
        ' Os interessados no registro de Posto de Medicamentos deverão apresentar: I) certificado ou declaração de conclusão do ensino médio com fotocópia autenticada, ll) II comprovação de experiência mínima de 05 (cinco) anos em farmácias ou drogarias, com registro na Carteira de Trabalho e Previdência Social (CTPS).',
        'Na documentação deverá constar exclusivamente como Atividade Econômica o comércio varejista de produtos farmacêuticos, sem manipulação de fórmulas.',
        ' Somente será permitido o uso da designação “Posto de Medicamentos”, seguido do nome de fantasia.',
        'Não será permitido o registro de mais de 01 (um) Posto de Medicamentos por localidade.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/08/Contratacao-de-RT-plantonista-12x36-DOA.docx`,
      },
      {
        id: 'registro-posto-medicamentos',
        icon: Landmark,
        title: 'Registro de Postos de Medicamentos',
        description: 'Registro específico para posto de medicamentos.',
        documentos: [
          'Cópia do Cadastro Nacional de Pessoa Jurídica (CNPJ);',
          'Cópia da Inscrição Estadual (quando houver)',
          'Contrato social/ato constitutivo e alterações',
          'RG e CPF dos sócios/representantes legais',
          'Requerimento de registro de posto de medicamentos',
          'Declaração de idoneidade/capacidade de dois farmacêuticos',
          'Declaração da Vigilância Sanitária local conforme exigência estadual',
        ],
        instrucoes: [
          'Preencha o requerimento com todos os campos obrigatórios.',
          'Anexe os documentos de constituição e as declarações exigidas.',
          'Confirme os critérios de elegibilidade do estabelecimento antes do protocolo.',
          'Protocole no CRF-AL em casa e acompanhe análise técnica.',
          'Informação sujeita à validação manual: critérios adicionais podem ser exigidos.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/02/Requerimento-de-Registro-de-Posto-de-Medicamento.docx`,
      },
    ],
  },
  {
    id: 'responsabilidade-tecnica',
    title: 'Responsabilidade Técnica',
    items: [
      {
        id: 'contratacao-rt-pj',
        icon: Stamp,
        title: 'Contratação de Responsável Técnico - Pessoa Jurídica',
        description: 'Contratação de farmacêutico responsável técnico para empresa privada.',
        documentos: [
          'Documento que comprove o vínculo empregatício',
        ],
        instrucoes: [
          'Acesse o CRF em Casa como Pessoa Jurídica.',
          "Clique no ícone de 'Solicitação de RT'.",
          'Preencha os campos necessários.',
          'Anexe a documentação que comprove o vínculo empregatício.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${LEGACY_WP_UPLOADS_URL}/2025/02/Contratacao-de-RT-e-Declaracao-de-outras-atividades.docx`,
        videoUrl: 'https://www.youtube.com/watch?v=S8V5i6fDQ9M',
      },
      {
        id: 'contratacao-rt-servico-publico',
        icon: ClipboardList,
        title: 'Contratação de Responsável Técnico - Serviço Público',
        description: 'Contratação de responsável técnico para estabelecimento público.',
        documentos: [
          'Documento que comprove o vínculo empregatício',
        ],
        instrucoes: [
          'Acesse o CRF em Casa como Pessoa Jurídica.',
          "Clique no ícone de 'Solicitação de RT'.",
          'Preencha os campos necessários.',
          'Anexe a documentação que comprove o vínculo empregatício.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${LEGACY_WP_UPLOADS_URL}/2024/08/Contratacao-de-RT-e-Declaracao-de-outras-atividades.docx`,
        videoUrl: 'https://www.youtube.com/watch?v=S8V5i6fDQ9M',
      },
      {
        id: 'contratacao-rt-plantonista',
        icon: RefreshCw,
        title: 'Contratação de RT Plantonista 12x36 + DOA',
        description: 'Contratação de RT no regime de plantão 12x36.',
        documentos: [
          'Documento que comprove o vínculo empregatício',
        ],
        instrucoes: [
          'Acesse o CRF em Casa como Pessoa Jurídica.',
          "Clique no ícone de 'Solicitação de RT'.",
          'Preencha os campos necessários.',
          'Anexe a documentação que comprove o vínculo empregatício.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${LEGACY_WP_UPLOADS_URL}/2024/08/Contratacao-de-RT-plantonista-12x36-DOA.docx`,
        videoUrl: 'https://www.youtube.com/watch?v=S8V5i6fDQ9M',
      },
    ],
  },
  {
    id: 'horarios-assistencia',
    title: 'Horários e Assistência',
    items: [
      {
        id: 'alteracao-horarios',
        icon: FileCheck,
        title: 'Alteração de Horários de Funcionamento e Assistência Farmacêutica',
        description: 'Atualização de horários do estabelecimento e assistência farmacêutica.',
        documentos: [
          'Requerimento de Alteração de Horários e DOA [01 via]',
          'Carteira de Trabalho do farmacêutico ou portaria de nomeação (serviço público)',
        ],
        instrucoes: [
          'Preencha o requerimento completo e sem rasuras.',
          'Traceje os campos não utilizados.',
          'Anexe o documento de vínculo atualizado.',
          'Protocole no CRF-AL em casa e acompanhe em Protocolos Web.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/08/Declaracao-de-horarios.docx`,
      },
    ],
  },
  {
    id: 'transferencias-alteracoes',
    title: 'Transferências e Alterações',
    items: [
      {
        id: 'transferencia-matriz-filiais',
        icon: FilePlus,
        title: 'Transferência entre Matriz e Filiais',
        description: 'Transferência de farmacêutico entre matriz e filiais.',
        documentos: [
          'Requerimento de transferência e DOA [01 via]',
          'Carteira de Trabalho do farmacêutico (original e cópia)',
        ],
        instrucoes: [
          'Preencha o requerimento com os dados da matriz e filial.',
          'Anexe vínculo profissional atualizado.',
          'Protocole no CRF-AL em casa e acompanhe a atualização cadastral em Protocolos Web.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/02/Requerimento-para-Transferencia-de-RT-entre-MATRIZ_FILIAL.docx`,
      },
      {
        id: 'alteracao-contratual-firma',
        icon: Edit3,
        title: 'Alteração Contratual de Firma',
        description: 'Atualização de dados contratuais da empresa perante o CRF-AL.',
        documentos: [
          'Requerimento de Alteração Contratual de Firma',
          'Alteração contratual registrada na Junta Comercial',
          'Documentos complementares do representante legal (quando exigido)',
        ],
        instrucoes: [
          'Preencha o requerimento sem rasuras.',
          'Anexe o contrato social consolidado e alterações.',
          'Protocole no CRF-AL e acompanhe deferimento.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/02/Requerimento-de-Alteracao-Contratual-de-Firma.docx`,
      },
      {
        id: 'dap',
        icon: FileText,
        title: 'Declaração de Atividade Profissional (DAP)',
        description: 'Solicitação de DAP para fins de comprovação de atividade profissional.',
        documentos: [
          'Formulário DAP preenchido',
          'Documentos comprobatórios indicados no formulário',
        ],
        instrucoes: [
          'Preencha o formulário DAP com os dados atualizados.',
          'Anexe os comprovantes exigidos.',
          'Protocole no CRF-AL em casa e acompanhe em Protocolos Web.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${WP_UPLOADS_URL}/2024/09/Declaracao-de-Atividade-Profissional-DAP.docx`,
      },
    ],
  },
  {
    id: 'fiscalizacao-recursos',
    title: 'Fiscalização e Recursos',
    items: [
      {
        id: 'defesa-auto-infracao',
        icon: AlertCircle,
        title: 'Defesa ao Auto de Infração',
        description: 'Protocolo de defesa administrativa para auto de infração.',
        documentos: [
          'Requerimento de Defesa ao Auto de Infração',
          'Documentos comprobatórios da defesa',
          'Procuração e documentos do representante (quando aplicável)',
        ],
        instrucoes: [
          'Preencha o requerimento corretamente e sem rasuras.',
          'Anexe todas as provas e justificativas necessárias.',
          'Protocole dentro do prazo indicado na notificação.',
        ],
        prazo: 'Conforme prazo processual',
        downloadUrl: `${WP_UPLOADS_URL}/2024/02/Defesa-ao-Auto-de-Infracao.docx`,
      },
      {
        id: 'recurso-multa-fiscal',
        icon: Download,
        title: 'Recurso de Multa Fiscal',
        description: 'Recurso administrativo contra multa fiscal homologada.',
        documentos: [
          'Formulário de Recurso de Multa Fiscal',
          'Documentos e fundamentos do recurso',
        ],
        instrucoes: [
          'Preencha o requerimento de recurso com fundamentação.',
          'Anexe documentos de suporte.',
          'Protocole no prazo regulamentar.',
        ],
        prazo: 'Conforme prazo processual',
        downloadUrl: `${WP_UPLOADS_URL}/2024/02/Recurso-de-multa-fiscal-Homologada-pelo-CRF.docx`,
      },
      {
        id: 'reconsideracao-indeferimento',
        icon: Info,
        title: 'Reconsideração de Indeferimento',
        description: 'Pedido de revisão de decisão de indeferimento.',
        documentos: [
          'Formulário de reconsideração',
          'Documentos complementares para saneamento das pendências',
        ],
        instrucoes: [
          'Preencha o pedido com justificativa clara.',
          'Anexe documentação nova ou corrigida.',
          'Protocole no CRF-AL e acompanhe a nova análise em Protocolos Web.',
        ],
        prazo: 'Conforme prazo processual',
        downloadUrl: `${WP_UPLOADS_URL}/2024/02/Reconsideracao-de-Indeferimento.docx`,
      },
    ],
  },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}


const TODOS_OS_ITENS = [...individualMenu, ...corporateMenu].flatMap((cat) => cat.items);
const CRF_EM_CASA_URL = 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf';

type ProfileType = 'individual' | 'corporate';

const PROFILES = [
  { id: 'individual', param: 'pessoa-fisica', label: 'Farmacêuticos', audience: 'farmacêuticos', sublabel: 'Pessoa física', icon: PillBottle, menu: individualMenu },
  { id: 'corporate', param: 'pessoa-juridica', label: 'Empresas', audience: 'empresas', sublabel: 'Pessoa jurídica', icon: Building2, menu: corporateMenu },
] as const;

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

function buscarItens(menu: readonly MenuCategory[], termo: string) {
  return menu.flatMap((cat) => cat.items).filter(
    (item) => termo === '' || normalizar(`${item.title} ${item.description}`).includes(termo)
  );
}

/* ---------- Checklist de documentos (lembrado neste navegador) ---------- */

function checklistKey(id: string) {
  return `crfal:requerimentos:checklist:${id}`;
}

function lerChecklist(id: string): number[] {
  try {
    const raw = window.localStorage.getItem(checklistKey(id));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function salvarChecklist(id: string, marcados: number[]) {
  try {
    if (marcados.length === 0) window.localStorage.removeItem(checklistKey(id));
    else window.localStorage.setItem(checklistKey(id), JSON.stringify(marcados));
  } catch {
    /* armazenamento indisponível: a lista funciona apenas nesta visita */
  }
}

function escapeHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function imprimirLista(item: RequirementItem, observacoes: string[]) {
  const janela = window.open('', '_blank', 'width=820,height=900');
  if (!janela) return;
  const docs = item.documentos.map((d) => `<li>${escapeHtml(d)}</li>`).join('');
  const passos = item.instrucoes.map((d) => `<li>${escapeHtml(d)}</li>`).join('');
  const obs = observacoes.map((d) => `<p>${escapeHtml(d)}</p>`).join('');
  janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(item.title)} · CRF-AL</title>
<style>body{font:14px/1.6 system-ui,sans-serif;color:#0B192C;max-width:720px;margin:40px auto;padding:0 24px}h1{font-size:22px;color:#003366;margin:4px 0 4px}small{color:#8A6A12;text-transform:uppercase;letter-spacing:.14em;font-size:11px;font-weight:600}h2{font-size:15px;color:#003366;border-bottom:2px solid #C59B27;padding-bottom:4px;margin-top:28px}ul{list-style:none;padding:0}ul li{padding:6px 0 6px 28px;position:relative;border-bottom:1px solid #E2E8F0}ul li:before{content:'';position:absolute;left:0;top:9px;width:14px;height:14px;border:1.5px solid #003366;border-radius:3px}ol li{margin:6px 0}.obs{background:#FFFBEB;border:1px solid #FDE68A;padding:8px 14px;border-radius:8px}footer{margin-top:32px;color:#64748B;font-size:12px}</style></head><body>
<small>CRF-AL · Requerimentos</small><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.description)}</p>
${item.prazo ? `<p><strong>Prazo:</strong> ${escapeHtml(item.prazo)}</p>` : ''}
<h2>Documentos necessários</h2><ul>${docs}</ul><h2>Como solicitar</h2><ol>${passos}</ol>
<h2>Observações</h2><div class="obs">${obs}</div>
<footer>Conselho Regional de Farmácia do Estado de Alagoas · crf-al.org.br</footer></body></html>`);
  janela.document.close();
  janela.focus();
  janela.print();
}

/* ---------- Página ---------- */

export default function RequirementsPage() {
  const [searchParams] = useSearchParams();
  return <RequirementsContent key={`${searchParams.get('perfil') ?? 'pessoa-fisica'}|${searchParams.get('categoria') ?? 'todas'}`} />;
}

function RequirementsContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType: ProfileType = searchParams.get('perfil') === 'pessoa-juridica' ? 'corporate' : 'individual';
  const activeProfile = PROFILES.find((p) => p.id === activeType)!;
  const otherProfile = PROFILES.find((p) => p.id !== activeType)!;
  const currentMenu = activeProfile.menu;

  const [busca, setBusca] = useState(() => searchParams.get('q') ?? '');
  const [categoria, setCategoria] = useState<string>(() => {
    const requested = searchParams.get('categoria');
    return currentMenu.some((category) => category.id === requested) ? requested! : 'todas';
  });
  const [selectedItem, setSelectedItem] = useState<RequirementItem | null>(
    () => TODOS_OS_ITENS.find((item) => item.id === searchParams.get('item')) ?? null
  );
  const [activeTab, setActiveTab] = useState<'documentos' | 'instrucoes'>('documentos');
  const [mostraFluxograma, setMostraFluxograma] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [marcados, setMarcados] = useState<number[]>(() => (selectedItem ? lerChecklist(selectedItem.id) : []));
  const [linkCopiado, setLinkCopiado] = useState(false);
  const tabsId = useId();

  const videoEmbedUrl = useMemo(() => getYouTubeEmbedUrl(selectedItem?.videoUrl), [selectedItem?.videoUrl]);

  const termo = normalizar(busca.trim());

  const itensFiltrados = useMemo(() => {
    return currentMenu
      .filter((cat) => categoria === 'todas' || cat.id === categoria)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => termo === '' || normalizar(`${item.title} ${item.description}`).includes(termo)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [currentMenu, categoria, termo]);

  const totalResultados = itensFiltrados.reduce((soma, cat) => soma + cat.items.length, 0);
  const resultadosOutroPerfil = useMemo(
    () => (termo ? buscarItens(otherProfile.menu, termo).length : 0),
    [otherProfile.menu, termo]
  );
  const totalPerfil = currentMenu.reduce((soma, cat) => soma + cat.items.length, 0);

  const observacoesSelecionadas = useMemo(() => {
    if (!selectedItem) return [];
    const obs = selectedItem.observacoesImportantes;
    const lista = Array.isArray(obs) ? obs.filter((o) => o.trim().length > 0) : obs?.trim() ? [obs.trim()] : [];
    return lista.length > 0 ? lista : [DEFAULT_IMPORTANT_OBSERVATION];
  }, [selectedItem]);

  useEffect(() => {
    if (!linkCopiado) return;
    const timer = window.setTimeout(() => setLinkCopiado(false), 2500);
    return () => window.clearTimeout(timer);
  }, [linkCopiado]);

  const setItemParam = useCallback((id: string | null) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (id) next.set('item', id);
      else next.delete('item');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const handleTypeChange = useCallback((type: ProfileType, manterBusca = false) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('perfil', type === 'corporate' ? 'pessoa-juridica' : 'pessoa-fisica');
      next.delete('categoria');
      next.delete('item');
      if (manterBusca && busca.trim()) next.set('q', busca.trim());
      else next.delete('q');
      return next;
    });
  }, [setSearchParams, busca]);

  const handleSelectItem = useCallback((item: RequirementItem) => {
    setSelectedItem(item);
    setActiveTab('documentos');
    setMostraFluxograma(false);
    setShowVideoModal(false);
    setMarcados(lerChecklist(item.id));
    setLinkCopiado(false);
    setItemParam(item.id);
  }, [setItemParam]);

  const handleOpenChange = useCallback((aberto: boolean) => {
    if (!aberto) {
      setSelectedItem(null);
      setMostraFluxograma(false);
      setShowVideoModal(false);
      setItemParam(null);
    }
  }, [setItemParam]);

  const toggleDocumento = useCallback((index: number) => {
    if (!selectedItem) return;
    setMarcados((atual) => {
      const next = atual.includes(index) ? atual.filter((i) => i !== index) : [...atual, index].sort((a, b) => a - b);
      salvarChecklist(selectedItem.id, next);
      return next;
    });
  }, [selectedItem]);

  const limparChecklist = useCallback(() => {
    if (!selectedItem) return;
    salvarChecklist(selectedItem.id, []);
    setMarcados([]);
  }, [selectedItem]);

  const copiarLink = useCallback(async () => {
    if (!selectedItem) return;
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('item', selectedItem.id);
    if (corporateMenu.some((cat) => cat.items.includes(selectedItem))) url.searchParams.set('perfil', 'pessoa-juridica');
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopiado(true);
    } catch {
      window.prompt('Copie o link do requerimento:', url.toString());
    }
  }, [selectedItem]);

  const limparFiltros = () => {
    setBusca('');
    setCategoria('todas');
  };

  const chipClass = (ativo: boolean) =>
    `inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold ${motion} ${focusRing} ${
      ativo
        ? 'border-crfal-blue bg-crfal-blue text-white shadow-sm'
        : 'border-crfal-gray-200 bg-white text-crfal-gray-700 hover:border-crfal-blue/40 hover:text-crfal-blue'
    }`;
  const chipCount = (ativo: boolean) =>
    `rounded-full px-1.5 text-[11px] font-bold ${ativo ? 'bg-white/20 text-white' : 'bg-crfal-gray-100 text-crfal-gray-600'}`;

  const totalDocs = selectedItem?.documentos.length ?? 0;
  const progresso = totalDocs ? Math.round((marcados.length / totalDocs) * 100) : 0;

  return (
    <div className="min-h-screen">
      <SEO
        title="Requerimentos"
        description="Acesse todos os requerimentos do CRFAL para pessoa física e jurídica — registro, renovação, certidões e muito mais para profissionais farmacêuticos em Alagoas."
        path="/servicos/requerimentos"
      />

      <PageHero
        variant="compact"
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Serviços' }, { label: 'Requerimentos' }]}
        section="servicos"
        lead="Documentos, instruções e formulários de cada requerimento, organizados para farmacêuticos e empresas."
        title="Central de Requerimentos"
        meta={[{ value: totalPerfil, label: `requerimentos para ${activeProfile.audience}` }, { value: currentMenu.length, label: 'categorias' }]}
        actions={<PageHeroAction href={CRF_EM_CASA_URL}>Acessar CRF AL em Casa</PageHeroAction>}
      />

      <main className="container-crfal py-8 md:py-12">
        {/* Barra de perfil, busca e categorias */}
        <div className="sticky top-[var(--header-offset)] z-30 glass-light rounded-2xl border border-white/70 p-3 shadow-[0_12px_32px_-16px_rgba(11,25,44,0.35)] ring-1 ring-crfal-gray-200/70 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div role="group" aria-label="Selecionar perfil" className="grid shrink-0 grid-cols-2 gap-1 rounded-2xl border border-crfal-gray-200 bg-crfal-gray-100 p-1">
              {PROFILES.map((profile) => {
                const ProfileIcon = profile.icon;
                const ativo = activeType === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleTypeChange(profile.id)}
                    aria-pressed={ativo}
                    className={`flex min-h-[52px] items-center gap-2.5 rounded-xl px-3 py-1.5 text-left sm:px-4 ${motion} ${focusRing} ${
                      ativo ? 'bg-crfal-blue text-white shadow-md' : 'text-crfal-gray-700 hover:bg-white hover:text-crfal-blue'
                    }`}
                  >
                    <ProfileIcon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-bold">{profile.label}</span>
                      <span className={`text-[11px] ${ativo ? 'text-white/75' : 'text-crfal-gray-600'}`}>{profile.sublabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative lg:ml-auto lg:max-w-sm lg:flex-1">
              <label htmlFor="busca-requerimento" className="sr-only">Buscar requerimento</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-crfal-gray-400" aria-hidden="true" />
              <input
                id="busca-requerimento"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar requerimento, ex.: certidão"
                className="min-h-[48px] w-full appearance-none rounded-full border [&::-webkit-search-cancel-button]:appearance-none border-crfal-gray-200 bg-white py-2.5 pl-11 pr-11 text-sm text-crfal-blue-dark transition-colors placeholder:text-crfal-gray-400 focus:border-crfal-blue-light focus:outline-none focus:ring-2 focus:ring-crfal-blue-light/40"
              />
              {busca && (
                <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-crfal-gray-400 transition-colors hover:bg-crfal-gray-100 hover:text-crfal-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div role="group" aria-label="Filtrar por categoria" className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => setCategoria('todas')} aria-pressed={categoria === 'todas'} className={chipClass(categoria === 'todas')}>
              Todas <span className={chipCount(categoria === 'todas')}>{totalPerfil}</span>
            </button>
            {currentMenu.map((cat) => {
              const ativo = categoria === cat.id;
              return (
                <button key={cat.id} type="button" onClick={() => setCategoria(cat.id)} aria-pressed={ativo} className={chipClass(ativo)}>
                  {cat.title} <span className={chipCount(ativo)}>{cat.items.length}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-8 md:mt-10" aria-live="polite">
          {termo && (
            <p className="mb-6 text-sm text-crfal-gray-600">
              <strong className="text-crfal-blue-dark">{totalResultados}</strong> {totalResultados === 1 ? 'resultado' : 'resultados'} em {activeProfile.label}
              {resultadosOutroPerfil > 0 && (
                <>
                  {' · '}
                  <button type="button" onClick={() => handleTypeChange(otherProfile.id, true)} className={`inline-flex items-center gap-1 rounded font-semibold text-crfal-blue underline-offset-4 hover:underline ${focusRing}`}>
                    ver {resultadosOutroPerfil} em {otherProfile.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </>
              )}
            </p>
          )}

          {totalResultados === 0 ? (
            <div className="rounded-2xl border border-dashed border-crfal-gray-300 bg-white px-6 py-14 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-crfal-gray-300" aria-hidden="true" />
              <h2 className="text-lg font-bold text-crfal-blue-dark">Nenhum requerimento encontrado em {activeProfile.label}</h2>
              <p className="mt-1 text-sm text-crfal-gray-600">Tente outro termo ou limpe os filtros selecionados.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {resultadosOutroPerfil > 0 && (
                  <button type="button" onClick={() => handleTypeChange(otherProfile.id, true)} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-crfal-blue-dark ${focusRing}`}>
                    Ver {resultadosOutroPerfil} em {otherProfile.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                <button type="button" onClick={limparFiltros} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-crfal-gray-300 px-5 py-2.5 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${focusRing}`}>
                  Limpar filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10 md:space-y-12">
              {itensFiltrados.map((cat) => (
                <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className={goldLabel}>{cat.items.length} {cat.items.length === 1 ? 'requerimento' : 'requerimentos'}</p>
                      <h2 id={`cat-${cat.id}`} className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[26px]">{cat.title}</h2>
                      <span aria-hidden="true" className="mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />
                    </div>
                  </div>

                  <ul className="grid gap-px overflow-hidden rounded-xl border border-crfal-gray-200 bg-crfal-gray-200 shadow-sm lg:grid-cols-2">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id} className="bg-white lg:[&:last-child:nth-child(odd)]:col-span-2">
                          <button
                            type="button"
                            onClick={() => handleSelectItem(item)}
                            className={`group flex h-full w-full items-center gap-4 p-4 text-left hover:bg-crfal-blue-lighter/50 sm:p-5 ${motion} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue`}
                          >
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10 group-hover:bg-crfal-blue group-hover:text-white group-hover:ring-crfal-gold/50 ${motion}`}>
                              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] font-bold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue sm:text-base">{item.title}</span>
                              <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-crfal-gray-600 sm:line-clamp-1">{item.description}</span>
                              {item.prazo && (
                                <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-crfal-gray-600">
                                  <Clock className="h-3.5 w-3.5 text-[#8A6A12]" aria-hidden="true" />
                                  {item.prazo}
                                </span>
                              )}
                            </span>
                            <ChevronRight className={`h-5 w-5 shrink-0 text-crfal-gray-400 group-hover:translate-x-1 group-hover:text-[#8A6A12] ${motion}`} aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <aside className="mt-12 flex flex-col items-start gap-4 rounded-xl bg-gradient-to-br from-crfal-blue to-crfal-blue-dark p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Atendimento online</p>
              <p className="mt-1 text-lg font-bold">Os requerimentos são enviados pelo CRF AL em Casa.</p>
              <p className="mt-1 text-sm text-white/75">Dúvidas sobre o sistema: tecnologia@crf-al.org.br</p>
            </div>
            <a href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition-colors hover:border-white hover:bg-white hover:text-crfal-blue focus-visible:outline-white">
              Acessar CRF AL em Casa <ArrowRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(abre em uma nova aba)</span>
            </a>
          </aside>
        </div>
      </main>

      {/* Detalhes do requerimento */}
      <Dialog open={selectedItem !== null} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          onInteractOutside={(e) => { if (showVideoModal) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (showVideoModal) e.preventDefault(); }}
          className="flex max-h-[calc(100dvh-var(--header-offset)-1.5rem)] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 top-[calc(var(--header-offset)+0.75rem)] translate-y-0 sm:max-w-2xl lg:top-[50%] lg:max-h-[90vh] lg:translate-y-[-50%]"
        >
          {selectedItem && (
            <>
              <div className="relative isolate shrink-0 overflow-hidden border-t-2 border-crfal-gold bg-gradient-to-br from-crfal-blue to-crfal-blue-dark p-5 sm:p-6">
                {(() => { const Icon = selectedItem.icon; return <Icon className="pointer-events-none absolute -bottom-8 -right-6 -z-10 h-40 w-40 text-white opacity-[0.06]" strokeWidth={1} aria-hidden="true" />; })()}
                <div className="absolute right-3 top-3 flex items-center gap-1">
                  <button type="button" onClick={copiarLink} aria-label={linkCopiado ? 'Link copiado' : 'Copiar link deste requerimento'} title="Copiar link" className="inline-flex items-center gap-1.5 rounded-full p-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                    {linkCopiado ? <Check className="h-5 w-5 text-crfal-gold" /> : <Link2 className="h-5 w-5" />}
                    <span className="hidden sm:inline" aria-hidden="true">{linkCopiado ? 'Copiado' : 'Copiar link'}</span>
                  </button>
                  <button type="button" onClick={() => handleOpenChange(false)} aria-label="Fechar detalhes" className="rounded-full p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-start gap-4 pr-24 sm:pr-36">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-crfal-gold/40 sm:h-14 sm:w-14">
                    {(() => { const Icon = selectedItem.icon; return <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden="true" />; })()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Requerimento</p>
                    <DialogTitle className="mt-0.5 text-lg font-bold leading-snug tracking-tight text-white sm:text-[22px]">{selectedItem.title}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="mt-3 text-sm leading-relaxed text-white/80">{selectedItem.description}</DialogDescription>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedItem.prazo && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                      <Clock className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" /> Prazo: {selectedItem.prazo}
                    </span>
                  )}
                  {selectedItem.taxaAplicavel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                      <Info className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" /> Taxa: {selectedItem.taxaAplicavel}
                    </span>
                  )}
                  {selectedItem.fluxogramaUrl && !mostraFluxograma && (
                    <button type="button" onClick={() => setMostraFluxograma(true)} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-crfal-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                      <Workflow className="h-3.5 w-3.5" aria-hidden="true" /> Ver fluxograma
                    </button>
                  )}
                  {videoEmbedUrl && (
                    <button type="button" onClick={() => setShowVideoModal(true)} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-crfal-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                      <Play className="h-3.5 w-3.5" aria-hidden="true" /> Ver tutorial em vídeo
                    </button>
                  )}
                </div>
              </div>

              {mostraFluxograma && selectedItem.fluxogramaUrl ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-center justify-between border-b border-crfal-gray-200 px-5 py-3">
                    <button type="button" onClick={() => setMostraFluxograma(false)} className={`inline-flex min-h-[36px] items-center gap-1.5 rounded text-sm font-semibold text-crfal-blue hover:text-crfal-blue-dark ${focusRing}`}>
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar aos detalhes
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto bg-crfal-gray-50 p-4 sm:p-6">
                    <img src={selectedItem.fluxogramaUrl} alt={`Fluxograma do requerimento ${selectedItem.title}`} className="mx-auto h-auto w-full rounded-xl border border-crfal-gray-200 bg-white object-contain shadow-sm" />
                  </div>
                </div>
              ) : (
                <>
                  <div role="tablist" aria-label="Detalhes do requerimento" className="flex shrink-0 border-b border-crfal-gray-200 px-2 sm:px-4">
                    {([
                      { id: 'documentos', label: 'Documentos', icon: ListChecks, count: selectedItem.documentos.length },
                      { id: 'instrucoes', label: 'Como solicitar', icon: FileText, count: selectedItem.instrucoes.length },
                    ] as const).map((tab) => {
                      const TabIcon = tab.icon;
                      const ativo = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          id={`${tabsId}-${tab.id}-tab`}
                          aria-selected={ativo}
                          aria-controls={`${tabsId}-${tab.id}-panel`}
                          tabIndex={ativo ? 0 : -1}
                          onClick={() => setActiveTab(tab.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                              e.preventDefault();
                              const next = tab.id === 'documentos' ? 'instrucoes' : 'documentos';
                              setActiveTab(next);
                              document.getElementById(`${tabsId}-${next}-tab`)?.focus();
                            }
                          }}
                          className={`-mb-px flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue ${
                            ativo ? 'border-crfal-gold text-crfal-blue' : 'border-transparent text-crfal-gray-600 hover:text-crfal-blue'
                          }`}
                        >
                          <TabIcon className="h-4 w-4" aria-hidden="true" />
                          {tab.label}
                          <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${ativo ? 'bg-crfal-blue-lighter text-crfal-blue' : 'bg-crfal-gray-100 text-crfal-gray-600'}`}>{tab.count}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                    <div className="mb-5 space-y-2">
                      {observacoesSelecionadas.map((observacao, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                          <p className="whitespace-pre-line text-[13px] leading-relaxed text-amber-900">{observacao}</p>
                        </div>
                      ))}
                    </div>

                    {activeTab === 'documentos' ? (
                      <div role="tabpanel" id={`${tabsId}-documentos-panel`} aria-labelledby={`${tabsId}-documentos-tab`}>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-crfal-blue-dark">
                              {marcados.length} de {totalDocs} documentos reunidos
                            </p>
                            <div className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-crfal-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={totalDocs} aria-valuenow={marcados.length} aria-label="Documentos reunidos">
                              <div className="h-full rounded-full bg-crfal-gold transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progresso}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {marcados.length > 0 && (
                              <button type="button" onClick={limparChecklist} className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-gray-600 hover:bg-crfal-gray-100 hover:text-crfal-blue ${focusRing}`}>
                                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Limpar
                              </button>
                            )}
                            <button type="button" onClick={() => imprimirLista(selectedItem, observacoesSelecionadas)} className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-blue hover:bg-crfal-blue-lighter ${focusRing}`}>
                              <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Imprimir lista
                            </button>
                          </div>
                        </div>
                        <ul className="divide-y divide-crfal-gray-100 rounded-xl border border-crfal-gray-200">
                          {selectedItem.documentos.map((doc, index) => {
                            const marcado = marcados.includes(index);
                            return (
                              <li key={index}>
                                <label className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-crfal-gray-50 ${motion}`}>
                                  <input type="checkbox" checked={marcado} onChange={() => toggleDocumento(index)} className="peer sr-only" />
                                  <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] peer-focus-visible:ring-2 peer-focus-visible:ring-crfal-blue peer-focus-visible:ring-offset-2 ${motion} ${marcado ? 'border-crfal-blue bg-crfal-blue text-white' : 'border-crfal-gray-400 bg-white'}`}>
                                    {marcado && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                                  </span>
                                  <span className={`text-sm leading-relaxed ${marcado ? 'text-crfal-gray-500 line-through decoration-crfal-gray-300' : 'text-crfal-gray-700'}`}>{doc}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                        <p className="mt-2 text-xs text-crfal-gray-600">As marcações ficam salvas apenas neste navegador.</p>
                      </div>
                    ) : (
                      <ol role="tabpanel" id={`${tabsId}-instrucoes-panel`} aria-labelledby={`${tabsId}-instrucoes-tab`}>
                        {selectedItem.instrucoes.map((instrucao, index) => (
                          <li key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crfal-blue text-sm font-bold text-white ring-2 ring-crfal-gold/30">{index + 1}</span>
                              {index < selectedItem.instrucoes.length - 1 && <div className="mt-1 h-full w-px bg-crfal-gray-200" />}
                            </div>
                            <p className="pb-5 pt-1 text-sm leading-relaxed text-crfal-gray-700">{instrucao}</p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3 border-t border-crfal-gray-200 bg-crfal-gray-50 p-4 sm:p-5">
                    <ArrowFillButton href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer">
                      Acessar CRF AL em Casa
                    </ArrowFillButton>
                    {selectedItem.downloadUrl && (
                      <a href={selectedItem.downloadUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-crfal-blue px-5 py-2.5 text-sm font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white ${focusRing}`}>
                        <Download className="h-4 w-4" aria-hidden="true" /> Baixar formulário
                      </a>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {showVideoModal && selectedItem && videoEmbedUrl &&
        createPortal(
          <div className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setShowVideoModal(false)}>
            <div role="dialog" aria-modal="true" aria-label={`Tutorial: ${selectedItem.title}`} className="w-full max-w-2xl animate-scale-in overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-crfal-gray-200 p-4">
                <h3 className="font-bold text-crfal-blue">Tutorial: {selectedItem.title}</h3>
                <button type="button" onClick={() => setShowVideoModal(false)} className="rounded-lg p-2 transition-colors hover:bg-crfal-gray-100" aria-label="Fechar vídeo">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <iframe src={videoEmbedUrl} title={`Vídeo tutorial: ${selectedItem.title}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
