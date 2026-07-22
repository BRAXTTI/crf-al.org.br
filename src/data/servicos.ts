import {
  FileText,
  Edit3,
  Copy,
  FileCheck,
  Search,
  UserCheck,
} from 'lucide-react';

export interface ServiceItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  category: string;
  valor: string;
  prazo?: string;
  tutorial: {
    steps: string[];
    videoUrl?: string;
  };
}

export const servicesData: ServiceItem[] = [
  // Para habilitar o vídeo no modal, adicione `videoUrl` em cada tutorial com o link do YouTube.
  // Exemplo: videoUrl: 'https://www.youtube.com/watch?v=SEU_VIDEO_ID'
  {
    id: 1,
    icon: FileText,
    title: 'Primeira Inscrição - Pessoa Física',
    description:
      'Destinado a farmacêuticos que nunca estiveram inscritos em nenhum Conselho Regional de Farmácia.',
    category: 'Inscrição',
    valor: 'Consulte o valor nos canais de atendimento do CRFAL',
    prazo: '30 dias (a depender da data da plenária)',
    tutorial: {
      steps: [
        'Acesse o portal do CRF em Casa',
        'Clique em "Pré Inscrição Pessoa Física"',
        'Preencha o formulário atentamente',
        'Anexe os documentos necessários',
        'Imprima seu protocolo e leve sua documentação original na sede/seccional do CRFAL',
        'Aguarde a análise da sua documentação pelo CRFAL',
        'Após a análise e aprovação em plenária, você receberá um email avisando a aprovação da sua inscrição e um boleto para o pagamento da taxa de inscrição',
        'Efetue o pagamento, aguarde a compensação do pagamento para receber a confirmação da sua inscrição',
      ],
    },
  },
  {
    id: 2,
    icon: Edit3,
    title: 'Alteração de Dados',
    description:
      'Atualize suas informações cadastrais de forma rápida e segura.',
    category: 'Atualização Cadastral',
    valor: 'Gratuito',
    prazo: 'Instantaneamente',
    tutorial: {
      steps: [
        'Faça login no CRFAL em Casa',
        'Acesse "Meus Dados"',
        'Clique na caixa correspondendo ao dado que deseja alterar"',
        'Altere as informações necessárias',
        'Anexe documentos comprobatórios, se necessário',
        'Confirme as alterações clicando em "Salvar Protocolo"',
      ],
    },
  },
  {
    id: 3,
    icon: Copy,
    title: 'Baixa de Responsabilidade Técnica',
    description:
      'Solicite a baixa do vínculo de responsabilidade técnica sem precisar anexar requerimento.',
    category: 'Responsabilidade Técnica',
    valor: 'Gratuito',
    prazo: 'Instantaneamente',
    tutorial: {
      videoUrl: 'https://www.youtube.com/watch?v=1EfNUxgilW0',
      steps: [
        'Acesse o CRF em Casa como Pessoa Física',
        'Clique em "Baixa de Contrato de Trabalho"',
        'Selecione o vínculo a ser encerrado (Responsabilidades Técnicas (Selecione a Empresa)"',
        'Selecione o motivo da baixa',
        'Coloque a Data do Contrato e a Data de Desligamento',
        'Em caso de problemas na hora da demissão: ANEXAR UMA DECLARAÇÃO EXPONDO OS MOTIVOS e/ou CÓPIA DA AÇÃO NA JUSTIÇA DO TRABALHO (SE ACONTECER).',
        'Clique em "Salvar Protocolo"',
      ],
    },
  },
  {
    id: 4,
    icon: FileCheck,
    title: 'Comunicado de Afastamento Provisório',
    description:
      'Comunique seu afastamento provisório 100% online e evite autuações.',
    category: 'Responsabilidade Técnica',
    valor: 'Gratuito',
    tutorial: {
      videoUrl: 'https://www.youtube.com/watch?v=nd6smKz0R78',
      steps: [
        'Entre no CRFAL em Casa como Pessoa Física',
        'Clique em "Comunicado de Afastamento Provisório"',
        'Selecione a Responsabilidade Técnica (RT)',
        'Selecione o Motivo de Ausência',
        'Coloque a Data de Início e de Término do Afastamento',
        'Informe o horário de início e término do afastamento, caso o motivo permita',
        'Anexe um comprovante do motivo de ausência.',
        'Em caso de atestado médico, o farmacêutico deverá apresenta-lo presencialmente no CRFAL em até 10 dias.',
        'Clique em "Salvar Protocolo"',
        'Caso seja necessário, acompanhe o processo pelo menu de "Protocolos Web"',
      ],
    },
  },
  {
    id: 5,
    icon: Search,
    title: 'Justificativa de Ausência',
    description:
      'Em caso de autuação ou qualquer outro motivo, você pode solicitar a justificativa de ausência para o CRFAL.',
    category: 'Consultas e Justificativas',
    valor: 'Gratuito',
    tutorial: {
      steps: [
        'Acesse o CRF AL em Casa como Pessoa Física',
        'Vá até o menu de Justificativa de Ausencia',
        'Selecione a inspeção com ausência identificada',
        'Preencha o formulário que será exibido',
        'Clique em "Salvar Justificativa"',
      ],
    },
  },
  {
    id: 6,
    icon: UserCheck,
    title: 'Consulta a Responsabilidade Técnica',
    description: 'Consulte os vínculos de responsabilidade técnica.',
    category: 'Estabelecimentos',
    valor: 'Gratuito',
    prazo: 'Instantaneo',
    tutorial: {
      steps: [
        'Acesse o CRF AL em Casa como Pessoa Fisica',
        'Clique em Resp. Técnicas Ativas/Perfil',
        'As empresas que você possui vínculo será exibida.',
        'Visualize seu tipo de vinculo, situação e perfis.'
      ],
    },
  },
  {
    id: 7,
    icon: UserCheck,
    title: 'Defesa de Auto de Infração - Pessoa Júridica',
    description: 'Realize sua defesa de auto de infração sem sair de casa.',
    category: 'Estabelecimentos',
    valor: 'Gratuito',
    prazo: 'Instantaneo',
    tutorial: {
      videoUrl: 'https://www.youtube.com/watch?v=_3F3mOfv-1A',
      steps: [
        'Acesse o CRF AL em Casa como Pessoa Juridica',
        'Clique em Defesa de Infração na seção Fiscalização',
        'Selecione o auto que você irá interpolar a defesa',
        'Anexe sua defesa de Auto de Infração assinado digitalmente',
        'Anexe um documento que comprove a representação legal',
        'Por fim, clique em "Salvar Defesa"',
        'Acompanhe seu protocolo pelo CRF AL em Casa na seção de "Protocolos Web"'
      ],
    },
  },
  {
    id: 8,
    icon: UserCheck,
    title: 'Inscrição Definitiva - Pessoa Física',
    description: 'Solicitando sua inscrição definitiva no CRFAL',
    category: 'Inscrição',
    valor: 'Gratuito',
    prazo: 'Instantaneo',
    tutorial: {
      videoUrl: 'https://youtu.be/P6TfpvT-pqk?t=13',
      steps: [
        'Acesse o CRF AL em Casa como Pessoa Física',
        'Clique em "Formularios e Requerimentos"',
        'Baixe o formulário de SOLICITAÇÃO DE CARTEIRA DEFINITIVA, SEGUNDA VIA OU CÉDULA DE IDENTIDADE"',
        'Preencha o formulário seguindo as instruções do próprio formulário',
        'Vá até a página inicial e aperta em "Enviar Documentos"',
        'Selecione a opção de SOLICITAÇÃO DE CARTEIRA DEFINITIVA',
        'Anexe o formulário preenchido e envie também seu diploma',
        'Salve o protocolo e você pode acompanhar sua solicitação na opção "Protocolos Web"'
      ],
    },
  },
];
