import type { ElementType } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  ClipboardList,
  Download,
  Edit3,
  FileCheck,
  FilePlus,
  FileText,
  Info,
  Landmark,
  RefreshCw,
  ShieldCheck,
  Stamp,
  UserPlus,
} from 'lucide-react';
import {
  LEGACY_WP_UPLOADS_URL,
  WP_UPLOADS_URL,
} from '@/services/wordpress/client';

/**
 * Fonte única dos requerimentos. A página de Requerimentos e a de Tutoriais
 * leem daqui: os passos de um tutorial vinculado (`requerimentoId`) são
 * sempre os mesmos `instrucoes` mostrados em “Como solicitar”.
 */
export interface RequirementItem {
  id: string;
  icon: ElementType;
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

export interface MenuCategory {
  id: string;
  title: string;
  items: RequirementItem[];
}

export const DEFAULT_IMPORTANT_OBSERVATION =
  'Caso tenha duvidas quanto ao processo de envio ou manuseio do nosso sistema online CRF AL em Casa envie um email para tecnologia@crf-al.org.br e responderemos em ate 01 (um) dia Útil.';

export const individualMenu: MenuCategory[] = [
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
        fluxogramaUrl: '/images/fluxograma-primeira-inscricao-crfal.webp',
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
          'Acesse o CRF AL em Casa como Pessoa Física.',
          'Clique em "Formulários e Requerimentos".',
          'Baixe o formulário "Solicitação de Carteira Definitiva, Segunda Via ou Cédula de Identidade".',
          'Preencha o formulário seguindo as instruções do próprio documento.',
          'Volte à página inicial e clique em "Enviar Documentos".',
          'Selecione a opção "Solicitação de Carteira Definitiva".',
          'Anexe o formulário preenchido e o seu diploma.',
          'Salve o protocolo e acompanhe a solicitação em "Protocolos Web".',
        ],
        observacoesImportantes: [
          'Leve os documentos originais na sede/seccional para conferência após o protocolo online.',
        ],
        prazo: 'Conforme análise do CRF-AL',
        downloadUrl: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
        videoUrl: 'https://youtu.be/P6TfpvT-pqk?t=13',
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

export const corporateMenu: MenuCategory[] = [
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
          'Acesse o CRF AL em Casa como Pessoa Jurídica.',
          'Na seção Fiscalização, clique em "Defesa de Infração".',
          'Selecione o auto de infração ao qual a defesa se refere.',
          'Anexe a defesa do auto de infração assinada digitalmente.',
          'Anexe um documento que comprove a representação legal.',
          'Clique em "Salvar Defesa".',
          'Acompanhe o protocolo em "Protocolos Web". A defesa deve ser enviada dentro do prazo indicado na notificação.',
        ],
        prazo: 'Conforme prazo processual',
        downloadUrl: `${WP_UPLOADS_URL}/2024/02/Defesa-ao-Auto-de-Infracao.docx`,
        videoUrl: 'https://www.youtube.com/watch?v=_3F3mOfv-1A',
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

export const TODOS_OS_REQUERIMENTOS = [...individualMenu, ...corporateMenu].flatMap((cat) => cat.items);

export function getRequerimento(id: string): RequirementItem | undefined {
  return TODOS_OS_REQUERIMENTOS.find((item) => item.id === id);
}

export function perfilDoRequerimento(id: string): 'pessoa-fisica' | 'pessoa-juridica' {
  return corporateMenu.some((cat) => cat.items.some((item) => item.id === id)) ? 'pessoa-juridica' : 'pessoa-fisica';
}
