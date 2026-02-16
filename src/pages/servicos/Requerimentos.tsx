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

interface RequerimentoItem {
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
  items: RequerimentoItem[];
}

const pessoaFisicaMenu: MenuCategory[] = [
  {
    id: 'inscricao-pf',
    title: 'Inscrição',
    items: [
      {
        id: 'inscricao-primaria',
        icon: UserPlus,
        title: 'Primeira Inscrição - Pessoa Física',
        description:
          'Solicite sua primeira inscrição no Conselho Regional de Farmácia de Alagoas.',
        documentos: [
          'Diploma de Farmacêutico (original e cópia)',
          'Histórico Escolar (original e cópia)',
          'Documento de identidade (RG ou CNH)',
          'CPF',
          'Comprovante de residência atualizado',
          'Certidão de nascimento ou casamento',
          '2 fotos 3x4 recentes',
          'Título de eleitor',
          'Comprovante de quitação do serviço militar (se aplicável)',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Selecione "Pré Inscrição Pessoa Física" no menu principal',
          'Preencha o formulário com seus dados pessoais e profissionais',
          'Anexe todos os documentos solicitados digitalizados',
          'Revise as informações e confirme o envio',
          'Após analise da documentação, você receberá um email com o boleto para o pagamento da taxa de inscrição',
          'Após pagar o boleto, você receberá um email com a confirmação da inscrição.',
        ],
        taxaAplicavel: 'R$ 350,00',
        prazo: '30 dias úteis',
      },
      {
        id: 'inscricao-transferencia',
        icon: RefreshCw,
        title: 'Transferência de Inscrição',
        description:
          'Transfira sua inscrição do CRF AL para outro Conselho Regional de Farmácia.',
        documentos: [
          'Carteira profissional do CRFAL',
          'Estar em dia com as anuidades do CRF AL',
        ],
        instrucoes: [
          'Baixe o requerimento de transferência de inscrição no CRFAL em Casa',
          'Preencha o formulário',
          'Envie pelo CRF AL em Casa selecionando a opção "INSCRIÇÃO PROFISSIONAL SECUNDÁRIA, TRANSFERENCIA OU REATIVAÇÃO"',
          'Anexe o requerimento que você baixou e preencheu',
          'Clique em "Salvar Protocolo"',
          'Vá até o CRFAL mais próximo e entregue sua carteira',
        ],
        taxaAplicavel: 'Gratuíto ',
        prazo: '20 dias úteis',
      },
      {
        id: 'inscricao-secundaria',
        icon: FilePlus,
        title: 'Inscrição Secundária',
        description:
          'Obtenha inscrição secundária para atuar em mais de uma jurisdição.',
        documentos: [
          'Comprovante de inscrição primária em outro CRF',
          'Certidão de regularidade do CRF de origem',
          'Documento de identidade',
          'Comprovante de endereço em Alagoas',
          '2 fotos 3x4',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Selecione "Inscrição Secundária"',
          'Informe o número da inscrição primária',
          'Preencha os dados e anexe os documentos',
          'Efetue o pagamento da taxa',
        ],
        taxaAplicavel: 'R$ 200,00',
        prazo: '15 dias úteis',
      },
    ],
  },
  {
    id: 'certidoes-pf',
    title: 'Certidões e Documentos',
    items: [
      {
        id: 'certidao-regularidade-pf',
        icon: BadgeCheck,
        title: 'Certidão de Regularidade',
        description:
          'Solicite certidão comprovando sua regularidade perante o CRFAL.',
        documentos: [
          'Número da inscrição no CRFAL',
          'Documento de identidade',
          'Estar em dia com as anuidades',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Vá em "Certidões" > "Certidão de Regularidade"',
          'Verifique se não há pendências financeiras',
          'Clique em "Emitir Certidão"',
          'O documento será gerado automaticamente em PDF',
        ],
        prazo: 'Emissão imediata (sem pendências)',
      },
      {
        id: 'segunda-via-carteira',
        icon: FileText,
        title: '2ª Via da Carteira Profissional',
        description:
          'Solicite a segunda via da sua carteira profissional em caso de perda, roubo ou dano.',
        documentos: [
          'Boletim de ocorrência (em caso de roubo/perda)',
          'Documento de identidade',
          'CPF',
          '2 fotos 3x4 recentes',
          'Comprovante de residência',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Selecione "2ª Via de Carteira"',
          'Informe o motivo da solicitação',
          'Anexe os documentos necessários',
          'Efetue o pagamento da taxa',
          'Aguarde a confecção e retirada',
        ],
        taxaAplicavel: 'R$ 80,00',
        prazo: '10 dias úteis',
      },
    ],
  },
  {
    id: 'alteracao-pf',
    title: 'Alteração Cadastral',
    items: [
      {
        id: 'alteracao-dados-pf',
        icon: Edit3,
        title: 'Alteração de Dados Pessoais',
        description:
          'Atualize seus dados pessoais como nome, endereço, telefone e e-mail.',
        documentos: [
          'Documento comprobatório da alteração (ex: certidão de casamento para mudança de nome)',
          'Documento de identidade atualizado',
          'Comprovante de residência (para mudança de endereço)',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Vá em "Meus Dados" > "Alterar Dados"',
          'Selecione o dado que deseja alterar',
          'Preencha com as novas informações',
          'Anexe o documento comprobatório',
          'Confirme a alteração',
        ],
        prazo: '5 dias úteis',
      },
    ],
  },
];

const pessoaJuridicaMenu: MenuCategory[] = [
  {
    id: 'registro-pj',
    title: 'Registro de Empresa',
    items: [
      {
        id: 'registro-novo-pj',
        icon: Building2,
        title: 'Registro de Estabelecimento',
        description:
          'Registre seu estabelecimento farmacêutico junto ao CRFAL.',
        documentos: [
          'Contrato Social ou Requerimento de Empresário',
          'CNPJ',
          'Alvará de Funcionamento',
          'Licença Sanitária',
          'Inscrição Estadual',
          'Comprovante de endereço do estabelecimento',
          'Documento de identidade do responsável legal',
          'ART do farmacêutico responsável técnico',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Selecione "Registro de Empresa"',
          'Preencha os dados do estabelecimento',
          'Informe o farmacêutico responsável técnico',
          'Anexe toda a documentação exigida',
          'Efetue o pagamento da taxa de registro',
          'Aguarde a vistoria e aprovação',
        ],
        taxaAplicavel: 'R$ 500,00',
        prazo: '45 dias úteis',
      },
      {
        id: 'autorizacao-funcionamento',
        icon: ShieldCheck,
        title: 'Autorização de Funcionamento',
        description:
          'Solicite a autorização de funcionamento para seu estabelecimento.',
        documentos: [
          'Registro no CRFAL (número)',
          'Alvará sanitário atualizado',
          'Contrato de responsabilidade técnica vigente',
          'Alvará de funcionamento municipal',
        ],
        instrucoes: [
          'Certifique-se de que o registro está ativo',
          'Acesse "Autorização de Funcionamento" no portal',
          'Preencha o formulário de solicitação',
          'Anexe a documentação atualizada',
          'Aguarde a vistoria fiscal',
          'Receba a autorização após aprovação',
        ],
        prazo: '30 dias úteis',
      },
    ],
  },
  {
    id: 'responsabilidade-tecnica',
    title: 'Responsabilidade Técnica',
    items: [
      {
        id: 'vinculo-rt',
        icon: Stamp,
        title: 'Vínculo de Responsabilidade Técnica',
        description:
          'Registre ou altere o vínculo de responsabilidade técnica do estabelecimento.',
        documentos: [
          'Contrato de trabalho do farmacêutico (CLT ou prestação de serviço)',
          'Inscrição ativa do farmacêutico no CRFAL',
          'Horário de funcionamento do estabelecimento',
          'Declaração de carga horária do farmacêutico',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa com login da empresa',
          'Vá em "Responsabilidade Técnica"',
          'Selecione "Novo Vínculo" ou "Alteração"',
          'Informe os dados do farmacêutico',
          'Anexe o contrato de trabalho',
          'Defina os horários de assistência',
          'Aguarde a aprovação do vínculo',
        ],
        prazo: '10 dias úteis',
      },
      {
        id: 'baixa-rt',
        icon: ClipboardList,
        title: 'Baixa de Responsabilidade Técnica',
        description:
          'Solicite a baixa do vínculo de responsabilidade técnica.',
        documentos: [
          'Termo de rescisão contratual ou distrato',
          'Declaração de baixa assinada pelo farmacêutico e proprietário',
          'Indicação do novo responsável técnico (se aplicável)',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Vá em "Responsabilidade Técnica" > "Baixa"',
          'Selecione o vínculo a ser encerrado',
          'Anexe a documentação de rescisão',
          'Confirme a solicitação',
          'Aguarde a análise e processamento',
        ],
        prazo: '10 dias úteis',
      },
    ],
  },
  {
    id: 'certidoes-pj',
    title: 'Certidões e Documentos',
    items: [
      {
        id: 'certidao-regularidade-pj',
        icon: FileCheck,
        title: 'Certidão de Regularidade da Empresa',
        description:
          'Emita a certidão de regularidade do estabelecimento perante o CRFAL.',
        documentos: [
          'CNPJ do estabelecimento',
          'Número de registro no CRFAL',
          'Estar em dia com as anuidades',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Vá em "Certidões" > "Certidão de Regularidade PJ"',
          'Informe o CNPJ ou número de registro',
          'Verifique se não há pendências',
          'Clique em "Emitir Certidão"',
          'O documento será gerado em PDF',
        ],
        prazo: 'Emissão imediata (sem pendências)',
      },
      {
        id: 'alteracao-dados-pj',
        icon: Landmark,
        title: 'Alteração de Dados Cadastrais da Empresa',
        description:
          'Atualize os dados cadastrais do estabelecimento como endereço, razão social ou sócios.',
        documentos: [
          'Alteração contratual registrada na Junta Comercial',
          'Novo CNPJ (se alterado)',
          'Comprovante de endereço atualizado',
          'Alvará de funcionamento (se mudança de endereço)',
        ],
        instrucoes: [
          'Acesse o portal CRF em Casa',
          'Vá em "Dados da Empresa" > "Alteração Cadastral"',
          'Selecione o tipo de alteração',
          'Anexe a documentação comprobatória',
          'Confirme a solicitação',
          'Aguarde a análise e atualização',
        ],
        prazo: '15 dias úteis',
      },
    ],
  },
];

export default function Requerimentos() {
  const [tipoAtivo, setTipoAtivo] = useState<'fisica' | 'juridica'>('fisica');
  const [categoriaExpandida, setCategoriaExpandida] = useState<string | null>(null);
  const [itemSelecionado, setItemSelecionado] = useState<RequerimentoItem | null>(null);

  const menuAtual = tipoAtivo === 'fisica' ? pessoaFisicaMenu : pessoaJuridicaMenu;

  const handleCategoriaClick = (catId: string) => {
    if (categoriaExpandida === catId) {
      setCategoriaExpandida(null);
    } else {
      setCategoriaExpandida(catId);
    }
    setItemSelecionado(null);
  };

  const handleItemClick = (item: RequerimentoItem) => {
    setItemSelecionado(item);
  };

  const handleTipoChange = (tipo: 'fisica' | 'juridica') => {
    setTipoAtivo(tipo);
    setCategoriaExpandida(null);
    setItemSelecionado(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-white/60 text-xs sm:text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">Início</a>
            <ChevronRight className="w-4 h-4" />
            <span>Serviços</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Requerimentos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Requerimentos
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl">
            Acesse todos os requerimentos disponíveis para pessoa física e pessoa jurídica.
            Selecione o tipo e o serviço desejado para visualizar os documentos necessários e instruções.
          </p>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16">
        {/* Tipo Selector - Pessoa Física / Pessoa Jurídica */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={() => handleTipoChange('fisica')}
            className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 group ${
              tipoAtivo === 'fisica'
                ? 'border-crfal-blue bg-crfal-blue text-white shadow-lg shadow-crfal-blue/20'
                : 'border-neutral-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/90 text-neutral-700 dark:text-slate-200 hover:border-crfal-blue/30 hover:shadow-md'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                tipoAtivo === 'fisica'
                  ? 'bg-white/20'
                  : 'bg-crfal-blue-lighter text-crfal-blue'
              }`}
            >
              <User className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Pessoa Física</h3>
              <p className={`text-sm ${tipoAtivo === 'fisica' ? 'text-white/70' : 'text-neutral-500'}`}>
                Farmacêuticos e profissionais
              </p>
            </div>
          </button>

          <button
            onClick={() => handleTipoChange('juridica')}
            className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 group ${
              tipoAtivo === 'juridica'
                ? 'border-crfal-blue bg-crfal-blue text-white shadow-lg shadow-crfal-blue/20'
                : 'border-neutral-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/90 text-neutral-700 dark:text-slate-200 hover:border-crfal-blue/30 hover:shadow-md'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                tipoAtivo === 'juridica'
                  ? 'bg-white/20'
                  : 'bg-crfal-blue-lighter text-crfal-blue'
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">Pessoa Jurídica</h3>
              <p className={`text-sm ${tipoAtivo === 'juridica' ? 'text-white/70' : 'text-neutral-500'}`}>
                Empresas e estabelecimentos
              </p>
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Menu */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 overflow-hidden lg:sticky lg:top-24">
              <div className="p-4 bg-gradient-to-r from-crfal-blue to-crfal-blue-dark">
                <h2 className="text-white font-bold flex items-center gap-2">
                  {tipoAtivo === 'fisica' ? (
                    <><User className="w-5 h-5" /> Pessoa Física</>
                  ) : (
                    <><Building2 className="w-5 h-5" /> Pessoa Jurídica</>
                  )}
                </h2>
              </div>

              <div className="divide-y divide-neutral-100">
                {menuAtual.map((categoria) => (
                  <div key={categoria.id}>
                    {/* Category Header */}
                    <button
                      onClick={() => handleCategoriaClick(categoria.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all duration-200 ${
                        categoriaExpandida === categoria.id
                          ? 'bg-crfal-blue-lighter text-crfal-blue'
                          : 'hover:bg-neutral-50 dark:hover:bg-slate-800/70 text-neutral-700'
                      }`}
                    >
                      <span className="font-semibold text-sm">{categoria.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          categoriaExpandida === categoria.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Sub Items */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        categoriaExpandida === categoria.id
                          ? 'max-h-96 opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="bg-neutral-50/50 py-1">
                        {categoria.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              className={`w-full flex items-center gap-3 px-6 py-2.5 text-left text-sm transition-all duration-200 ${
                                itemSelecionado?.id === item.id
                                  ? 'bg-crfal-blue text-white'
                                  : 'text-neutral-600 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-crfal-blue'
                              }`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span className="min-w-0 truncate">{item.title}</span>
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

          {/* Right Content - Detail Panel */}
          <div className="lg:col-span-8">
            {itemSelecionado ? (
              <div className="animate-fade-in">
                {/* Detail Header */}
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 overflow-hidden">
                  <div className="bg-gradient-to-r from-crfal-blue to-crfal-blue-dark p-6">
                    <button
                      onClick={() => setItemSelecionado(null)}
                      className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        {(() => {
                          const Icon = itemSelecionado.icon;
                          return <Icon className="w-7 h-7 text-white" />;
                        })()}
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                          {itemSelecionado.title}
                        </h2>
                        <p className="text-white/80 mt-1">
                          {itemSelecionado.description}
                        </p>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 mt-5">
                      {itemSelecionado.taxaAplicavel && (
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                          <Info className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white">
                            Taxa: <strong>{itemSelecionado.taxaAplicavel}</strong>
                          </span>
                        </div>
                      )}
                      {itemSelecionado.prazo && (
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                          <AlertCircle className="w-4 h-4 text-white/70" />
                          <span className="text-sm text-white">
                            Prazo: <strong>{itemSelecionado.prazo}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documentos Necessários */}
                  <div className="p-6 border-b border-neutral-100">
                    <h3 className="font-bold text-neutral-800 flex items-center gap-2 mb-4">
                      <ClipboardList className="w-5 h-5 text-crfal-blue" />
                      Documentos Necessários
                    </h3>
                    <ul className="space-y-2.5">
                      {itemSelecionado.documentos.map((doc, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-crfal-blue-lighter text-crfal-blue text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm text-neutral-700">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instruções */}
                  <div className="p-6 border-b border-neutral-100">
                    <h3 className="font-bold text-neutral-800 flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-crfal-blue" />
                      Instruções Passo a Passo
                    </h3>
                    <ol className="space-y-3">
                      {itemSelecionado.instrucoes.map((instrucao, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-crfal-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm text-neutral-700 pt-1">
                            {instrucao}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Actions */}
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
                    <button className="btn-outline text-sm flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Baixar Formulário
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-8 sm:p-12 md:p-16 text-center">
                <div className="w-20 h-20 bg-crfal-blue-lighter rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="w-10 h-10 text-crfal-blue" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-3">
                  Selecione um requerimento
                </h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                  Escolha uma categoria no menu ao lado e selecione o tipo de requerimento
                  que deseja para visualizar os documentos necessários e instruções detalhadas.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {menuAtual.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoriaClick(cat.id)}
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
