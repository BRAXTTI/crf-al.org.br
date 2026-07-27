import { useState, useMemo } from 'react';
import SEO from '@/components/SEO';
import {
  User,
  Building2,
  ChevronRight,
  ChevronDown,
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/12/Inscricao-profissional-Secundaria-transferencia-reativacaoinscricao.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/03/Requerimento-Prorrogacao-de-Inscricao-Provisoria.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/03/Requerimento-Inscricao-profissional-carteira-definitiva-segunda-via-de-carteira-definitiva-cedula.docx',
        
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/03/Requerimento-de-transferencia-para-outro-regional.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/03/Requerimento-de-Cancelamento-de-Inscricao.docx',
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2026/04/Contratacao-de-RT-e-Declaracao-de-outras-atividades_ATUALIZADO.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/08/Contratacao-de-RT-plantonista-12x36-DOA.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/02/Requerimento-de-Registro-de-Posto-de-Medicamento.docx',
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2025/02/Contratacao-de-RT-e-Declaracao-de-outras-atividades.docx',
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2024/08/Contratacao-de-RT-e-Declaracao-de-outras-atividades.docx',
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2024/08/Contratacao-de-RT-plantonista-12x36-DOA.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/08/Declaracao-de-horarios.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/02/Requerimento-para-Transferencia-de-RT-entre-MATRIZ_FILIAL.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/02/Requerimento-de-Alteracao-Contratual-de-Firma.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/09/Declaracao-de-Atividade-Profissional-DAP.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/02/Defesa-ao-Auto-de-Infracao.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/02/Recurso-de-multa-fiscal-Homologada-pelo-CRF.docx',
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
        downloadUrl: 'https://wordpress.crf-al.org.br/wp-content/uploads/2024/02/Reconsideracao-de-Indeferimento.docx',
      },
    ],
  },
];

export default function RequirementsPage() {
  const [activeType, setActiveType] = useState<'individual' | 'corporate'>('individual');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RequirementItem | null>(null);
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [selectedFlowchartItem, setSelectedFlowchartItem] = useState<RequirementItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'documentos' | 'instrucoes' | 'observacoes'>('documentos');

  const currentMenu = activeType === 'individual' ? individualMenu : corporateMenu;

  const filteredMenu = useMemo(() => {
    if (!searchQuery.trim()) return currentMenu;
    const q = searchQuery.toLowerCase().trim();
    return currentMenu
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.title.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [currentMenu, searchQuery]);

  const selectedItemObservations = selectedItem?.observacoesImportantes;
  const normalizedSelectedItemObservations = selectedItem
    ? Array.isArray(selectedItemObservations)
      ? selectedItemObservations.filter((obs) => obs.trim().length > 0)
      : selectedItemObservations?.trim()
        ? [selectedItemObservations.trim()]
        : []
    : [];
  const allSelectedItemObservations = selectedItem
    ? normalizedSelectedItemObservations.length > 0
      ? normalizedSelectedItemObservations
      : [DEFAULT_IMPORTANT_OBSERVATION]
    : [];
  const hasSelectedItemObservations = allSelectedItemObservations.length > 0;

  const handleCategoryClick = (catId: string) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
    setSelectedItem(null);
    setShowObservationsModal(false);
  };

  const handleTypeChange = (type: 'individual' | 'corporate') => {
    setActiveType(type);
    setExpandedCategory(null);
    setSelectedItem(null);
    setSearchQuery('');
    setShowObservationsModal(false);
  };

  const handleSelectItem = (item: RequirementItem) => {
    setSelectedItem(item);
    setActiveTab('documentos');
    setShowObservationsModal(false);
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950">
      <SEO
        title="Requerimentos"
        description="Acesse todos os requerimentos do CRFAL para pessoa física e jurídica — registro, renovação, certidões e muito mais para profissionais farmacêuticos em Alagoas."
        path="/servicos/requerimentos"
      />

      <div className="relative overflow-hidden bg-crfal-blue-dark pb-14 pt-24 md:pb-18 md:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-crfal-blue-dark via-crfal-blue/90 to-crfal-blue-dark" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden
        />

        <div className="container-crfal relative z-10">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/60 sm:text-sm" aria-label="Breadcrumb">
            <a href="/" className="transition-colors hover:text-white">Início</a>
            <ChevronRight className="h-4 w-4" />
            <span>Serviços</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Requerimentos</span>
          </nav>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            <ClipboardList className="h-3.5 w-3.5" />
            Atendimento Digital
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] sm:text-4xl md:text-5xl">
            Requerimentos
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            Selecione o tipo de pessoa, escolha a categoria e o serviço desejado para visualizar documentos necessários e instruções detalhadas.
          </p>
        </div>
      </div>

      <div className="container-crfal py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-full rounded-xl border border-crfal-gray-200 bg-white p-1.5 shadow-card dark:border-slate-700 dark:bg-slate-900 sm:w-auto">
            {(
              [
                { id: 'individual', label: 'Pessoa Física', icon: User },
                { id: 'corporate', label: 'Pessoa Jurídica', icon: Building2 },
              ] as const
            ).map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTypeChange(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-300 sm:flex-initial ${
                    isActive
                      ? 'bg-crfal-blue text-white shadow-card'
                      : 'text-crfal-gray-600 hover:text-crfal-blue dark:text-slate-300 dark:hover:text-crfal-blue-light'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-crfal-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar requerimento..."
              className="h-12 w-full rounded-xl border border-crfal-gray-200 bg-white pl-12 pr-4 text-sm text-crfal-gray-800 shadow-card transition-all placeholder:text-crfal-gray-400 focus:border-crfal-blue focus:outline-none focus:ring-2 focus:ring-crfal-blue/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-crfal-gray-400 transition-colors hover:text-crfal-gray-600"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="sticky top-24 overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-crfal-gray-200 bg-crfal-blue-dark px-5 py-4 dark:border-slate-700">
                <h2 className="flex items-center gap-2 font-bold text-white">
                  {activeType === 'individual' ? (
                    <><User className="h-5 w-5" /> Categorias — Pessoa Física</>
                  ) : (
                    <><Building2 className="h-5 w-5" /> Categorias — Pessoa Jurídica</>
                  )}
                </h2>
              </div>

              {isSearching && filteredMenu.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-crfal-gray-500 dark:text-slate-400">
                    Nenhum requerimento encontrado para "{searchQuery}".
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-crfal-gray-100 dark:divide-slate-700/70">
                  {filteredMenu.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategoryClick(category.id)}
                        className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition-all duration-200 ${
                          expandedCategory === category.id || isSearching
                            ? 'bg-crfal-blue text-white'
                            : 'text-crfal-gray-800 hover:bg-crfal-blue-lighter hover:text-crfal-blue dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-crfal-blue-light'
                        }`}
                      >
                        <span className="text-sm font-semibold">{category.title}</span>
                        <span className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            expandedCategory === category.id || isSearching
                              ? 'bg-white/20 text-white'
                              : 'bg-crfal-blue-lighter text-crfal-blue dark:bg-slate-700 dark:text-crfal-blue-light'
                          }`}>
                            {category.items.length}
                          </span>
                          {!isSearching && (
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ${
                                expandedCategory === category.id ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </span>
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          expandedCategory === category.id || isSearching ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="bg-crfal-gray-50 py-1 dark:bg-slate-800/50">
                          {category.items.map((item) => {
                            const Icon = item.icon;
                            const isSelected = selectedItem?.id === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSelectItem(item)}
                                className={`flex w-full items-center gap-3 px-6 py-2.5 text-left text-sm transition-all duration-200 ${
                                  isSelected
                                    ? 'border-l-4 border-crfal-blue bg-crfal-blue/10 font-semibold text-crfal-blue dark:bg-crfal-blue/20 dark:text-crfal-blue-light'
                                    : 'border-l-4 border-transparent text-crfal-gray-700 hover:bg-crfal-blue/5 hover:text-crfal-blue dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-crfal-blue-light'
                                }`}
                              >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="leading-snug">{item.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedItem ? (
              <div className="animate-fade-in">
                <div className="overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
                  <div className="border-b border-crfal-gray-200 bg-gradient-to-r from-crfal-blue-dark to-crfal-blue p-5 sm:p-6 dark:border-slate-700">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="mb-4 flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar à lista
                    </button>

                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15">
                        {(() => {
                          const Icon = selectedItem.icon;
                          return <Icon className="h-7 w-7 text-white" />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-white sm:text-xl md:text-2xl">{selectedItem.title}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-white/80">{selectedItem.description}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2.5">
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
                      {selectedItem.fluxogramaUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedFlowchartItem(selectedItem)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter"
                        >
                          <Workflow className="h-3.5 w-3.5" />
                          Ver Fluxograma
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-b border-crfal-gray-200 dark:border-slate-700">
                    <div className="flex">
                      {(
                        [
                          { id: 'documentos', label: 'Documentos', icon: ListChecks, count: selectedItem.documentos.length },
                          { id: 'instrucoes', label: 'Instruções', icon: FileText, count: selectedItem.instrucoes.length },
                          { id: 'observacoes', label: 'Observações', icon: Info, count: allSelectedItemObservations.length },
                        ] as const
                      ).map((tab) => {
                        const TabIcon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isDisabled = tab.id === 'observacoes' && !hasSelectedItemObservations;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => !isDisabled && setActiveTab(tab.id)}
                            disabled={isDisabled}
                            className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-xs font-semibold transition-all sm:text-sm ${
                              isDisabled
                                ? 'cursor-not-allowed border-transparent text-crfal-gray-300 dark:text-slate-600'
                                : isActive
                                  ? 'border-crfal-blue text-crfal-blue dark:border-crfal-blue-light dark:text-crfal-blue-light'
                                  : 'border-transparent text-crfal-gray-500 hover:text-crfal-blue dark:text-slate-400 dark:hover:text-crfal-blue-light'
                            }`}
                          >
                            <TabIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              isActive
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

                  <div className="p-5 sm:p-6">
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

                    {activeTab === 'observacoes' && hasSelectedItemObservations && (
                      <div className="space-y-3">
                        {allSelectedItemObservations.map((observacao, index) => (
                          <div key={index} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-600/25 dark:bg-amber-900/15">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <p className="whitespace-pre-line text-sm leading-relaxed text-amber-800 dark:text-amber-200">{observacao}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-crfal-gray-200 bg-crfal-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800/40 sm:p-6">
                    <a
                      href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crfal-blue-dark"
                    >
                      <FileText className="h-4 w-4" />
                      Acessar CRF AL em Casa
                    </a>
                    {selectedItem.downloadUrl ? (
                      <a
                        href={selectedItem.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-crfal-blue px-5 py-2.5 text-sm font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white dark:border-crfal-blue-light dark:text-crfal-blue-light dark:hover:bg-crfal-blue-light dark:hover:text-slate-950"
                      >
                        <Download className="h-4 w-4" />
                        Baixar Formulário
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-lg border-2 border-crfal-gray-200 px-5 py-2.5 text-sm font-medium text-crfal-gray-400 dark:border-slate-700 dark:text-slate-500">
                        <Download className="h-4 w-4" />
                        Formulário indisponível
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-crfal-gray-200 bg-white p-10 text-center shadow-card dark:border-slate-700 dark:bg-slate-900 md:p-14">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-crfal-blue-lighter dark:bg-crfal-blue/15">
                  <ClipboardList className="h-10 w-10 text-crfal-blue dark:text-crfal-blue-light" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-crfal-gray-800 dark:text-white">
                  Selecione um requerimento
                </h3>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-crfal-gray-500 dark:text-slate-400">
                  Escolha o tipo de pessoa acima, navegue pelas categorias ao lado e selecione o serviço desejado para visualizar documentos e instruções.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {currentMenu.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="rounded-full bg-crfal-blue-lighter px-4 py-2 text-sm font-medium text-crfal-blue transition-all duration-200 hover:bg-crfal-blue hover:text-white dark:bg-crfal-blue/15 dark:text-crfal-blue-light dark:hover:bg-crfal-blue dark:hover:text-white"
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedFlowchartItem?.fluxogramaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fluxograma-title"
          onClick={() => setSelectedFlowchartItem(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl animate-scale-in dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-crfal-gray-200 p-5 dark:border-slate-700">
              <div>
                <h3 id="fluxograma-title" className="text-lg font-bold text-crfal-blue dark:text-crfal-blue-light">Fluxograma do processo</h3>
                <p className="mt-1 text-sm text-crfal-gray-500 dark:text-slate-400">{selectedFlowchartItem.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlowchartItem(null)}
                className="rounded-full border border-crfal-gray-200 p-2 text-crfal-gray-500 transition-colors hover:border-crfal-blue hover:text-crfal-blue dark:border-slate-600 dark:hover:border-crfal-blue-light dark:hover:text-crfal-blue-light"
                aria-label="Fechar fluxograma"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto bg-crfal-gray-50 p-4 dark:bg-slate-950 sm:p-6">
              <img
                src={selectedFlowchartItem.fluxogramaUrl}
                alt={`Fluxograma do requerimento ${selectedFlowchartItem.title}`}
                className="mx-auto h-auto w-full max-w-none rounded-xl border border-crfal-gray-200 bg-white object-contain shadow-sm dark:border-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {showObservationsModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowObservationsModal(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl animate-scale-in dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-crfal-gray-200 p-5 dark:border-slate-700">
              <h3 className="text-lg font-bold text-crfal-blue dark:text-crfal-blue-light">Observações Importantes</h3>
              <p className="mt-1 text-sm text-crfal-gray-500 dark:text-slate-400">{selectedItem.title}</p>
            </div>
            <div className="p-5">
              {allSelectedItemObservations.map((observacao, index) => (
                <p key={index} className="whitespace-pre-line text-sm leading-relaxed text-crfal-gray-700 dark:text-slate-200">
                  {observacao}
                </p>
              ))}
            </div>
            <div className="flex justify-end border-t border-crfal-gray-200 bg-crfal-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800/40">
              <button
                onClick={() => setShowObservationsModal(false)}
                className="rounded-lg bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crfal-blue-dark"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
