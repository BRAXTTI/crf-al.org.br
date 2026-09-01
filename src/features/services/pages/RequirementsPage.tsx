import { useCallback, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
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
  User,
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
  Info,
  AlertCircle,
  Workflow,
  X,
  Search,
  Clock,
  ListChecks,
  ExternalLink,
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
          'Requerimento de RT e Declaração de Outras Atividades (DOA) [01 via]',
          'Carteira de Trabalho do farmacêutico (original e cópia)',
        ],
        instrucoes: [
          'Preencha todos os campos corretamente.',
          'Traceje os campos não utilizados e não utilize formulário com rasuras.',
          'Anexe o vínculo profissional e a DOA.',
          'Protocole no CRF-AL e acompanhe a análise.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${LEGACY_WP_UPLOADS_URL}/2025/02/Contratacao-de-RT-e-Declaracao-de-outras-atividades.docx`,
      },
      {
        id: 'contratacao-rt-servico-publico',
        icon: ClipboardList,
        title: 'Contratação de Responsável Técnico - Serviço Público',
        description: 'Contratação de responsável técnico para estabelecimento público.',
        documentos: [
          'Requerimento de RT e DOA [01 via]',
          'Vínculo empregatício: portaria, CNES ou declaração do RH',
        ],
        instrucoes: [
          'Preencha o requerimento completo e sem rasuras.',
          'Anexe o comprovante de vínculo empregatício no serviço público.',
          'Protocole no CRF-AL e responda diligências, se houver.',
          'Se for jornada 12x36, use o formulário específico de plantonista.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${LEGACY_WP_UPLOADS_URL}/2024/08/Contratacao-de-RT-e-Declaracao-de-outras-atividades.docx`,
      },
      {
        id: 'contratacao-rt-plantonista',
        icon: RefreshCw,
        title: 'Contratação de RT Plantonista 12x36 + DOA',
        description: 'Contratação de RT no regime de plantão 12x36.',
        documentos: [
          'Requerimento específico de RT Plantonista 12x36',
          'Declaração de Outras Atividades (DOA)',
          'Comprovação de vínculo profissional',
        ],
        instrucoes: [
          'Use o formulário específico de plantonista 12x36.',
          'Preencha todos os campos e traceje os não utilizados.',
          'Anexe os comprovantes de vínculo e a DOA.',
          'Protocole no CRF-AL para homologação.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: `${LEGACY_WP_UPLOADS_URL}/2024/08/Contratacao-de-RT-plantonista-12x36-DOA.docx`,
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

const ESTATISTICAS = {
  servicos: TODOS_OS_ITENS.length,
  formularios: TODOS_OS_ITENS.filter((item) => item.downloadUrl).length,
  categorias: individualMenu.length + corporateMenu.length,
};

export default function RequirementsPage() {
  const [activeType, setActiveType] = useState<'individual' | 'corporate'>('individual');
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<string>('todas');
  const [selectedItem, setSelectedItem] = useState<RequirementItem | null>(null);
  const [activeTab, setActiveTab] = useState<'documentos' | 'instrucoes' | 'observacoes'>('documentos');
  const [mostraFluxograma, setMostraFluxograma] = useState(false);

  const currentMenu = activeType === 'individual' ? individualMenu : corporateMenu;

  const termo = normalizar(busca.trim());

  const itensFiltrados = useMemo(() => {
    return currentMenu
      .filter((cat) => categoria === 'todas' || cat.id === categoria)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) => termo === '' || normalizar(`${item.title} ${item.description}`).includes(termo)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [currentMenu, categoria, termo]);

  const totalResultados = itensFiltrados.reduce((soma, cat) => soma + cat.items.length, 0);

  const observacoesSelecionadas = useMemo(() => {
    if (!selectedItem) return [];
    const obs = selectedItem.observacoesImportantes;
    const lista = Array.isArray(obs)
      ? obs.filter((o) => o.trim().length > 0)
      : obs?.trim()
        ? [obs.trim()]
        : [];
    return lista.length > 0 ? lista : [DEFAULT_IMPORTANT_OBSERVATION];
  }, [selectedItem]);

  const handleTypeChange = useCallback((type: 'individual' | 'corporate') => {
    setActiveType(type);
    setCategoria('todas');
    setBusca('');
  }, []);

  const handleSelectItem = useCallback((item: RequirementItem) => {
    setSelectedItem(item);
    setActiveTab('documentos');
    setMostraFluxograma(false);
  }, []);

  const handleOpenChange = useCallback((aberto: boolean) => {
    if (!aberto) {
      setSelectedItem(null);
      setMostraFluxograma(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950">
      <SEO
        title="Requerimentos"
        description="Acesse todos os requerimentos do CRFAL para pessoa física e jurídica — registro, renovação, certidões e muito mais para profissionais farmacêuticos em Alagoas."
        path="/servicos/requerimentos"
      />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a]">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-crfal-blue-light/25 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-[26rem] w-[26rem] rounded-full bg-[#0066CC]/20 blur-3xl" />
          <div className="absolute right-1/4 top-10 h-40 w-40 rounded-full bg-crfal-gold/20 blur-3xl" />
        </div>

        <div className="container-crfal relative z-10 pb-14 pt-28 md:pb-20 md:pt-36">
          <nav aria-label="Trilha de navegação" className="mb-6 flex items-center gap-2 text-sm text-white/60">
            <a href="/" className="transition-colors hover:text-white">Início</a>
            <ChevronRight className="h-4 w-4" />
            <span>Serviços</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Requerimentos</span>
          </nav>

          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            <ClipboardList className="h-4 w-4 text-crfal-gold" />
            Atendimento digital · CRF-AL
          </p>

          <h1 className="max-w-3xl font-display text-[2.25rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Central de{' '}
            <span className="bg-gradient-to-r from-[#8FC1F2] to-crfal-gold bg-clip-text text-transparent">
              Requerimentos
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            Escolha o perfil, encontre o serviço e acompanhe documentos e
            instruções passo a passo — tudo em um só lugar.
          </p>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3">
            {[
              { valor: ESTATISTICAS.servicos, rotulo: 'Serviços' },
              { valor: ESTATISTICAS.formularios, rotulo: 'Formulários' },
              { valor: ESTATISTICAS.categorias, rotulo: 'Categorias' },
            ].map((item) => (
              <div
                key={item.rotulo}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">{item.valor}</dd>
                <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-white/70">
                  {item.rotulo}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main className="container-crfal py-8 md:py-12">
        {/* Toolbar sticky */}
        <div className="sticky top-[72px] z-30 rounded-2xl border border-crfal-gray-200/80 bg-white/85 p-3 shadow-card backdrop-blur-lg dark:border-slate-700/80 dark:bg-slate-900/85 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div
              role="group"
              aria-label="Selecionar tipo de pessoa"
              className="inline-flex shrink-0 rounded-full border border-crfal-gray-200 bg-crfal-gray-100 p-1 dark:border-slate-700 dark:bg-slate-800"
            >
              {(
                [
                  { id: 'individual', label: 'Pessoa Física', icon: User },
                  { id: 'corporate', label: 'Pessoa Jurídica', icon: Building2 },
                ] as const
              ).map((tab) => {
                const TabIcon = tab.icon;
                const ativo = activeType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTypeChange(tab.id)}
                    aria-pressed={ativo}
                    className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light lg:flex-initial ${
                      ativo
                        ? 'bg-crfal-blue text-white shadow-md'
                        : 'text-crfal-gray-600 hover:text-crfal-blue dark:text-slate-300 dark:hover:text-sky-300'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative lg:ml-auto lg:max-w-xs lg:flex-1">
              <label htmlFor="busca-requerimento" className="sr-only">Buscar requerimento</label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-crfal-gray-400" />
              <input
                id="busca-requerimento"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar requerimento..."
                className="min-h-[44px] w-full rounded-full border border-crfal-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-800 transition-colors placeholder:text-crfal-gray-400 focus:border-crfal-blue-light focus:outline-none focus:ring-2 focus:ring-crfal-blue-light/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-crfal-gray-400 transition-colors hover:bg-crfal-gray-100 hover:text-crfal-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            role="group"
            aria-label="Filtrar por categoria"
            className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              onClick={() => setCategoria('todas')}
              aria-pressed={categoria === 'todas'}
              className={`inline-flex min-h-[44px] shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light ${
                categoria === 'todas'
                  ? 'border-crfal-blue bg-crfal-blue text-white'
                  : 'border-crfal-gray-200 bg-white text-crfal-gray-600 hover:border-crfal-blue/40 hover:text-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Todas
              <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                categoria === 'todas'
                  ? 'bg-white/20 text-white'
                  : 'bg-crfal-gray-100 text-crfal-gray-500 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {currentMenu.reduce((soma, cat) => soma + cat.items.length, 0)}
              </span>
            </button>
            {currentMenu.map((cat) => {
              const ativo = categoria === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.id)}
                  aria-pressed={ativo}
                  className={`inline-flex min-h-[44px] shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light ${
                    ativo
                      ? 'border-crfal-blue bg-crfal-blue text-white'
                      : 'border-crfal-gray-200 bg-white text-crfal-gray-600 hover:border-crfal-blue/40 hover:text-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {cat.title}
                  <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                    ativo
                      ? 'bg-white/20 text-white'
                      : 'bg-crfal-gray-100 text-crfal-gray-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-8">
          {totalResultados === 0 ? (
            <div className="rounded-2xl border border-dashed border-crfal-gray-300 bg-white py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <Search className="mx-auto mb-3 h-10 w-10 text-crfal-gray-300 dark:text-slate-600" />
              <h2 className="font-display text-lg font-semibold text-neutral-800 dark:text-slate-100">
                Nenhum requerimento encontrado
              </h2>
              <p className="mt-1 text-sm text-crfal-gray-500 dark:text-slate-400">
                Tente ajustar a busca ou os filtros selecionados.
              </p>
              <button
                onClick={() => {
                  setBusca('');
                  setCategoria('todas');
                }}
                className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crfal-blue-dark"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            itensFiltrados.map((cat) => (
              <section key={cat.id} aria-labelledby={`cat-${cat.id}`} className="mb-10 last:mb-0">
                <div className="mb-5 flex items-center gap-3">
                  <h2
                    id={`cat-${cat.id}`}
                    className="font-display text-xl font-semibold text-neutral-800 dark:text-slate-100 md:text-2xl"
                  >
                    {cat.title}
                  </h2>
                  <span className="rounded-full bg-crfal-blue-lighter px-2.5 py-1 text-xs font-bold text-crfal-blue dark:bg-crfal-blue/20 dark:text-sky-300">
                    {cat.items.length}
                  </span>
                  <div
                    aria-hidden
                    className="hidden h-px flex-1 bg-gradient-to-r from-crfal-gray-200 to-transparent dark:from-slate-700 sm:block"
                  />
                </div>

                <div
                  key={`${activeType}|${categoria}|${termo}`}
                  className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {cat.items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <article
                        key={item.id}
                        className="group relative flex animate-in flex-col rounded-2xl border border-crfal-gray-200 bg-white p-5 shadow-card duration-500 fill-mode-backwards fade-in slide-in-from-bottom-3 transition-all hover:-translate-y-1.5 hover:border-crfal-blue/25 hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-900"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-crfal-blue-lighter text-crfal-blue transition-colors group-hover:bg-crfal-blue group-hover:text-white dark:bg-crfal-blue/15 dark:text-crfal-blue-light">
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-display text-base font-semibold leading-snug text-neutral-800 transition-colors group-hover:text-crfal-blue dark:text-slate-100 dark:group-hover:text-sky-300 sm:text-lg">
                            <button
                              type="button"
                              onClick={() => handleSelectItem(item)}
                              className="after:absolute after:inset-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light"
                            >
                              {item.title}
                            </button>
                          </h3>
                        </div>

                        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-crfal-gray-600 dark:text-slate-400">
                          {item.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-crfal-gray-100 pt-3.5 dark:border-slate-800">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-crfal-blue transition-all group-hover:gap-2.5 dark:text-sky-300">
                            Ver detalhes
                            <ChevronRight className="h-4 w-4" />
                          </span>
                          {item.downloadUrl && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-crfal-gray-100 px-2.5 py-1 text-[11px] font-semibold text-crfal-gray-600 dark:bg-slate-800 dark:text-slate-400">
                              <Download className="h-3 w-3" />
                              Formulário
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      {/* Dialog de detalhes */}
      <Dialog open={selectedItem !== null} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl"
        >
          {selectedItem && (
            <>
              <div className="relative shrink-0 bg-gradient-to-r from-crfal-blue-dark to-crfal-blue p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  aria-label="Fechar detalhes"
                  className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-4 pr-12">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:h-14 sm:w-14">
                    {(() => {
                      const Icon = selectedItem.icon;
                      return <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" />;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="font-display text-lg font-semibold leading-snug text-white sm:text-xl">
                      {selectedItem.title}
                    </DialogTitle>
                    <DialogDescription className="mt-1.5 text-sm leading-relaxed text-white/80">
                      {selectedItem.description}
                    </DialogDescription>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedItem.prazo && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                      <Clock className="h-3.5 w-3.5 text-white/70" />
                      Prazo: {selectedItem.prazo}
                    </span>
                  )}
                  {selectedItem.taxaAplicavel && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                      <Info className="h-3.5 w-3.5 text-white/70" />
                      Taxa: {selectedItem.taxaAplicavel}
                    </span>
                  )}
                  {selectedItem.fluxogramaUrl && !mostraFluxograma && (
                    <button
                      type="button"
                      onClick={() => setMostraFluxograma(true)}
                      className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      <Workflow className="h-3.5 w-3.5" />
                      Ver fluxograma
                    </button>
                  )}
                </div>
              </div>

              {mostraFluxograma && selectedItem.fluxogramaUrl ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-center justify-between border-b border-crfal-gray-200 px-5 py-3 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setMostraFluxograma(false)}
                      className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-semibold text-crfal-blue transition-colors hover:text-crfal-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light dark:text-crfal-blue-light"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar aos detalhes
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto bg-crfal-gray-50 p-4 dark:bg-slate-950 sm:p-6">
                    <img
                      src={selectedItem.fluxogramaUrl}
                      alt={`Fluxograma do requerimento ${selectedItem.title}`}
                      className="mx-auto h-auto w-full rounded-xl border border-crfal-gray-200 bg-white object-contain shadow-sm dark:border-slate-700"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="shrink-0 border-b border-crfal-gray-200 dark:border-slate-700">
                    <div className="flex">
                      {(
                        [
                          { id: 'documentos', label: 'Documentos', icon: ListChecks, count: selectedItem.documentos.length },
                          { id: 'instrucoes', label: 'Instruções', icon: FileText, count: selectedItem.instrucoes.length },
                          { id: 'observacoes', label: 'Observações', icon: Info, count: observacoesSelecionadas.length },
                        ] as const
                      ).map((tab) => {
                        const TabIcon = tab.icon;
                        const ativo = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            aria-pressed={ativo}
                            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue-light sm:text-sm ${
                              ativo
                                ? 'border-crfal-blue text-crfal-blue dark:border-crfal-blue-light dark:text-crfal-blue-light'
                                : 'border-transparent text-crfal-gray-500 hover:text-crfal-blue dark:text-slate-400 dark:hover:text-crfal-blue-light'
                            }`}
                          >
                            <TabIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              ativo
                                ? 'bg-crfal-blue-lighter text-crfal-blue dark:bg-crfal-blue/20 dark:text-crfal-blue-light'
                                : 'bg-crfal-gray-100 text-crfal-gray-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                    {activeTab === 'documentos' && (
                      <ul className="space-y-2.5">
                        {selectedItem.documentos.map((doc, index) => (
                          <li key={index} className="flex items-start gap-3 rounded-lg bg-crfal-gray-50 p-3 dark:bg-slate-800/50">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-crfal-blue text-xs font-bold text-white">
                              {index + 1}
                            </span>
                            <span className="text-sm leading-relaxed text-crfal-gray-700 dark:text-slate-200">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {activeTab === 'instrucoes' && (
                      <ol className="space-y-0">
                        {selectedItem.instrucoes.map((instrucao, index) => (
                          <li key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-sm font-bold text-crfal-blue dark:bg-crfal-blue/20 dark:text-crfal-blue-light">
                                {index + 1}
                              </span>
                              {index < selectedItem.instrucoes.length - 1 && (
                                <div className="mt-1 h-full w-px bg-crfal-gray-200 dark:bg-slate-700" />
                              )}
                            </div>
                            <p className="pb-5 pt-1 text-sm leading-relaxed text-crfal-gray-700 dark:text-slate-200">{instrucao}</p>
                          </li>
                        ))}
                      </ol>
                    )}

                    {activeTab === 'observacoes' && (
                      <div className="space-y-3">
                        {observacoesSelecionadas.map((observacao, index) => (
                          <div key={index} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-600/25 dark:bg-amber-900/15">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <p className="whitespace-pre-line text-sm leading-relaxed text-amber-800 dark:text-amber-200">{observacao}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3 border-t border-crfal-gray-200 bg-crfal-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800/40 sm:p-6">
                    <a
                      href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crfal-blue-dark active:scale-95"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Acessar CRF AL em Casa
                    </a>
                    {selectedItem.downloadUrl ? (
                      <a
                        href={selectedItem.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-crfal-blue px-5 py-2.5 text-sm font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white dark:border-crfal-blue-light dark:text-crfal-blue-light dark:hover:bg-crfal-blue-light dark:hover:text-slate-950"
                      >
                        <Download className="h-4 w-4" />
                        Baixar formulário
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border-2 border-crfal-gray-200 px-5 py-2.5 text-sm font-medium text-crfal-gray-400 dark:border-slate-700 dark:text-slate-500">
                        <Download className="h-4 w-4" />
                        Formulário indisponível
                      </span>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
