import {
  FileText,
  Edit3,
  Copy,
  FileCheck,
  Search,
  Building2,
  UserCheck,
  Stamp,
} from 'lucide-react';

export interface ServiceItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  category: string;
  valor: string;
  prazo: string;
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
    valor: 'R$ 350,00',
    prazo: '30 dias úteis',
    tutorial: {
      steps: [
        'Acesse o portal do CRF em Casa',
        'Clique em "Pré Inscrição Pessoa Física"',
        'Preencha o formulário atentamente',
        'Anexe os documentos necessários',
        'Realize o pagamento da taxa',
        'Aguarde a análise da sua documentação',
        'Após a análise e aprovação em plenária, você receberá um email avisando a aprovação da sua inscrição',
      ],
      videoUrl: 'https://www.youtube.com/watch?v=DgM-SnAUsJ0',
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
    prazo: '5 dias úteis',
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
    prazo: '10 dias úteis',
    tutorial: {
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
    prazo: 'Até 10 dias úteis',
    tutorial: {
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
    prazo: 'Até 10 dias úteis',
    tutorial: {
      steps: [
        'Acesse a consulta pública',
        'Digite o CPF ou número de inscrição',
        'Clique em "Consultar"',
        'Visualize os dados do profissional',
        'Verifique a situação atual',
      ],
    },
  },
  {
    id: 6,
    icon: Building2,
    title: 'Consulta a Autorização de Funcionamento',
    description:
      'Verifique a regularidade de estabelecimentos farmacêuticos.',
    category: 'Estabelecimentos',
    valor: 'Gratuito',
    prazo: '30 dias úteis',
    tutorial: {
      steps: [
        'Acesse a consulta de estabelecimentos',
        'Informe o CNPJ ou nome da farmácia',
        'Selecione o estado e cidade',
        'Visualize os dados do estabelecimento',
        'Confirme a autorização de funcionamento',
      ],
    },
  },
  {
    id: 7,
    icon: UserCheck,
    title: 'Consulta a Responsabilidade Técnica',
    description: 'Consulte os vínculos de responsabilidade técnica.',
    category: 'Estabelecimentos',
    valor: 'Gratuito',
    prazo: '10 dias úteis',
    tutorial: {
      steps: [
        'Acesse a consulta de RT',
        'Digite o CPF do farmacêutico',
        'Ou informe o CNPJ do estabelecimento',
        'Visualize os vínculos ativos',
        'Verifique o histórico de RT',
      ],
    },
  },
  {
    id: 8,
    icon: Stamp,
    title: 'Validar Documentos',
    description: 'Valide a autenticidade de documentos emitidos pelo CRFAL.',
    category: 'Validação',
    valor: 'Gratuito',
    prazo: 'Imediato',
    tutorial: {
      steps: [
        'Acesse o validador de documentos',
        'Digite o código de validação',
        'Ou faça upload do QR Code',
        'Clique em "Validar"',
        'Visualize o resultado da validação',
      ],
    },
  },
];
