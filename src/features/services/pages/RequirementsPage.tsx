import { useState } from 'react';
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
} from 'lucide-react';

interface RequirementItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  documentos: string[];
  instrucoes: string[];
  taxaAplicavel?: string;
  prazo?: string;
  downloadUrl?: string;
}

interface MenuCategory {
  id: string;
  title: string;
  items: RequirementItem[];
}

const individualMenu: MenuCategory[] = [
  {
    id: 'inscricoes-pf',
    title: 'Inscrições',
    items: [
      {
        id: 'inscricao-definitiva-provisoria',
        icon: UserPlus,
        title: 'Inscrição Profissional Definitiva e Provisória',
        description: 'Serviço realizado pelo CRF-AL em Casa para novos farmacêuticos.',
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
        'Clique em "Pré Inscrição Pessoa Física"',
        'Preencha o formulário atentamente',
        'Anexe os documentos necessários',
        'Imprima seu protocolo e leve sua documentação original na sede/seccional do CRFAL',
        'Aguarde a análise da sua documentação pelo CRFAL',
        'Após a análise e aprovação em plenária, você receberá um email avisando a aprovação da sua inscrição e um boleto para o pagamento da taxa de inscrição',
        'Efetue o pagamento, aguarde a compensação do pagamento para receber a confirmação da sua inscrição',
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2024/12/Inscricao-profissional-Secundaria-transferencia-reativacaoinscricao.docx',
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2024/03/Requerimento-Prorrogacao-de-Inscricao-Provisoria.docx',
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2024/03/Requerimento-Inscricao-profissional-carteira-definitiva-segunda-via-de-carteira-definitiva-cedula.docx',
        
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2024/03/Requerimento-de-transferencia-para-outro-regional.docx',
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
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2024/03/Requerimento-de-Cancelamento-de-Inscricao.docx',
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
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: 'https://www.crf-al.org.br/app/uploads/2024/08/Contratacao-de-RT-plantonista-12x36-DOA.docx',
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
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
          'Protocole no CRF-AL e acompanhe retorno técnico.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
          'Protocole no CRF-AL e acompanhe a atualização cadastral.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
          'Protocole no CRF-AL e acompanhe a análise.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
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
          'Protocole no CRF-AL e acompanhe a nova análise.',
        ],
        prazo: 'Conforme prazo processual',
        downloadUrl: 'https://www.crf-al.org.br/requerimentos/',
      },
    ],
  },
];

export default function RequirementsPage() {
  const [activeType, setActiveType] = useState<'individual' | 'corporate'>('individual');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RequirementItem | null>(null);

  const currentMenu = activeType === 'individual' ? individualMenu : corporateMenu;

  const handleCategoryClick = (catId: string) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
    setSelectedItem(null);
  };

  const handleTypeChange = (type: 'individual' | 'corporate') => {
    setActiveType(type);
    setExpandedCategory(null);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">Início</a>
            <ChevronRight className="w-4 h-4" />
            <span>Serviços</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Requerimentos</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Requerimentos</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Acesse todos os requerimentos disponíveis para pessoa física e pessoa jurídica.
            Selecione o tipo e o serviço desejado para visualizar os documentos necessários e instruções.
          </p>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16">
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={() => handleTypeChange('individual')}
            className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 group ${
              activeType === 'individual'
                ? 'border-crfal-blue bg-crfal-blue text-white shadow-lg shadow-crfal-blue/20'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-crfal-blue/30 hover:shadow-md'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                activeType === 'individual' ? 'bg-white/20' : 'bg-crfal-blue-lighter text-crfal-blue'
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Pessoa Física</h3>
              <p className={`text-sm ${activeType === 'individual' ? 'text-white/70' : 'text-neutral-500'}`}>
                Farmacêuticos e profissionais
              </p>
            </div>
          </button>

          <button
            onClick={() => handleTypeChange('corporate')}
            className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 group ${
              activeType === 'corporate'
                ? 'border-crfal-blue bg-crfal-blue text-white shadow-lg shadow-crfal-blue/20'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-crfal-blue/30 hover:shadow-md'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                activeType === 'corporate' ? 'bg-white/20' : 'bg-crfal-blue-lighter text-crfal-blue'
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Pessoa Jurídica</h3>
              <p className={`text-sm ${activeType === 'corporate' ? 'text-white/70' : 'text-neutral-500'}`}>
                Empresas e estabelecimentos
              </p>
            </div>
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden sticky top-24">
              <div className="p-4 bg-gradient-to-r from-crfal-blue to-crfal-blue-dark">
                <h2 className="text-white font-bold flex items-center gap-2">
                  {activeType === 'individual' ? (
                    <><User className="w-5 h-5" /> Pessoa Física</>
                  ) : (
                    <><Building2 className="w-5 h-5" /> Pessoa Jurídica</>
                  )}
                </h2>
              </div>

              <div className="divide-y divide-neutral-100">
                {currentMenu.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => handleCategoryClick(category.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all duration-200 ${
                        expandedCategory === category.id
                          ? 'bg-crfal-blue-lighter text-crfal-blue'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span className="font-semibold text-sm">{category.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          expandedCategory === category.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        expandedCategory === category.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="bg-neutral-50/50 py-1">
                        {category.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              className={`w-full flex items-center gap-3 px-6 py-2.5 text-left text-sm transition-all duration-200 ${
                                selectedItem?.id === item.id
                                  ? 'bg-crfal-blue text-white'
                                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-crfal-blue'
                              }`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span>{item.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedItem ? (
              <div className="animate-fade-in">
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-crfal-blue to-crfal-blue-dark p-6">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        {(() => {
                          const Icon = selectedItem.icon;
                          return <Icon className="w-7 h-7 text-white" />;
                        })()}
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">{selectedItem.title}</h2>
                        <p className="text-white/80 mt-1">{selectedItem.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-5">
                      {selectedItem.taxaAplicavel && (
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                          <Info className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white">
                            Taxa: <strong>{selectedItem.taxaAplicavel}</strong>
                          </span>
                        </div>
                      )}
                      {selectedItem.prazo && (
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                          <AlertCircle className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white">
                            Prazo: <strong>{selectedItem.prazo}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-b border-neutral-100">
                    <h3 className="font-bold text-neutral-800 flex items-center gap-2 mb-4">
                      <ClipboardList className="w-5 h-5 text-crfal-blue" />
                      Documentos Necessários
                    </h3>
                    <ul className="space-y-2.5">
                      {selectedItem.documentos.map((doc, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-crfal-blue-lighter text-crfal-blue text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm text-neutral-700">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 border-b border-neutral-100">
                    <h3 className="font-bold text-neutral-800 flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-crfal-blue" />
                      Instruções Passo a Passo
                    </h3>
                    <ol className="space-y-3">
                      {selectedItem.instrucoes.map((instrucao, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-crfal-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm text-neutral-700 pt-1">{instrucao}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-6 bg-neutral-50 flex flex-wrap gap-3">
                    <a
                      href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Acessar Portal
                    </a>
                    {selectedItem.downloadUrl ? (
                      <a
                        href={selectedItem.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-sm flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Formulário
                      </a>
                    ) : (
                      <button className="btn-outline text-sm flex items-center gap-2 opacity-60 cursor-not-allowed" disabled>
                        <Download className="w-4 h-4" />
                        Formulário indisponível
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 md:p-16 text-center">
                <div className="w-20 h-20 bg-crfal-blue-lighter rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="w-10 h-10 text-crfal-blue" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-3">Selecione um requerimento</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Escolha uma categoria no menu ao lado e selecione o tipo de requerimento
                  que deseja para visualizar os documentos necessários e instruções detalhadas.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {currentMenu.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="px-4 py-2 text-sm bg-crfal-blue-lighter text-crfal-blue rounded-full hover:bg-crfal-blue hover:text-white transition-all duration-200"
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
    </div>
  );
}
