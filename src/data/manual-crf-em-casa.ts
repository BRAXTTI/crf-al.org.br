/**
 * Manual de uso do CRF AL em Casa: cada seção tem um texto e uma demonstração
 * em vídeo curto (WebM em loop, sem som, convertido do GIF original). Os
 * arquivos ficam em `public/images/manual-crf-em-casa/`; enquanto `video` não
 * for informado, a página mostra “Demonstração em breve”.
 */
export interface ManualSecao {
  /** Âncora da seção (`#<id>`). */
  id: string;
  title: string;
  /** Parágrafos de explicação. */
  text: string[];
  /** Passos curtos, na ordem em que aparecem no sistema. */
  steps?: string[];
  /** Vídeo WebM da demonstração (ex.: `/images/manual-crf-em-casa/acesso.webm`). */
  video?: string;
  /** Primeiro quadro em JPG, exibido enquanto o vídeo carrega. */
  poster?: string;
  /** Descrição do que a demonstração mostra, para leitores de tela. */
  videoAlt: string;
}

export const MANUAL_CRF_EM_CASA: ManualSecao[] = [
  {
    id: 'acesso',
    title: 'Acessar o sistema',
    text: [
      'O CRF AL em Casa é o atendimento online do Conselho. Farmacêuticos entram como Pessoa Física e estabelecimentos como Pessoa Jurídica, cada um com o próprio login.',
    ],
    steps: [
      'Abra o CRF AL em Casa pelo botão “CRF AL em Casa”, no topo do site.',
      'Escolha o tipo de acesso: Pessoa Física ou Pessoa Jurídica.',
      'Informe seu login e senha e clique em entrar.',
    ],
    video: '/images/manual-crf-em-casa/acesso.webm',
    poster: '/images/manual-crf-em-casa/acesso-poster.webp',
    videoAlt: 'Tela de login do CRF AL em Casa sendo preenchida e o acesso ao painel inicial.',
  },
  {
    id: 'enviar-documentos',
    title: 'Enviar documentos e requerimentos',
    text: [
      'A maior parte dos serviços começa com um formulário baixado no próprio sistema e enviado de volta com os documentos. Cada envio gera um protocolo.',
    ],
    steps: [
      'Clique em “Formulários e Requerimentos” e baixe o formulário do serviço.',
      'Preencha o formulário seguindo as instruções do documento.',
      'Volte à página inicial e clique em “Enviar Documentos”.',
      'Selecione o tipo de solicitação, anexe o formulário e os documentos.',
      'Clique em “Salvar Protocolo”.',
    ],
    video: '/images/manual-crf-em-casa/enviar-documentos.webm',
    poster: '/images/manual-crf-em-casa/enviar-documentos-poster.webp',
    videoAlt: 'Download de um formulário, envio dos documentos e geração do protocolo no CRF AL em Casa.',
  },
  {
    id: 'protocolos',
    title: 'Acompanhar seus protocolos',
    text: [
      'Depois de enviar uma solicitação, acompanhe o andamento pelo número de protocolo. É por lá que aparecem pendências e o resultado da análise.',
    ],
    steps: [
      'Na página inicial, clique em “Protocolos Web”.',
      'Localize a solicitação pelo número de protocolo.',
      'Confira a situação e, se houver pendência, envie o que foi pedido.',
    ],
    video: '/images/manual-crf-em-casa/protocolos.webm',
    poster: '/images/manual-crf-em-casa/protocolos-poster.webp',
    videoAlt: 'Consulta da lista de protocolos e abertura de uma solicitação para ver a situação.',
  },
  {
    id: 'boletos',
    title: 'Emitir boletos e anuidades',
    text: [
      'A emissão de boletos não precisa de login: é feita direto pelo Painel de Controle, na tela de acesso do CRF AL em Casa, informando sua inscrição e CPF ou CNPJ.',
    ],
    steps: [
      'Na tela de acesso, clique em “Impressão Parcelamentos/Acordo” no Painel de Controle.',
      'Selecione o tipo (por exemplo, Farmacêutico) e informe sua inscrição e o CPF ou CNPJ.',
      'Clique em “Consultar” para ver os débitos em aberto.',
      'Selecione a anuidade ou parcela e imprima o boleto.',
    ],
    video: '/images/manual-crf-em-casa/boletos.webm',
    poster: '/images/manual-crf-em-casa/boletos-poster.webp',
    videoAlt: 'Consulta de débitos e emissão da segunda via de um boleto.',
  },
  {
    id: 'baixa-responsabilidade-tecnica',
    title: 'Solicitar baixa de responsabilidade técnica',
    text: [
      'Ao deixar de ser responsável técnico por um estabelecimento, o farmacêutico encerra o vínculo pelo próprio sistema, sem precisar anexar requerimento.',
    ],
    steps: [
      'Acesse como Pessoa Física e clique em “Baixa de Contrato de Trabalho”.',
      'Selecione o estabelecimento do vínculo a ser encerrado.',
      'Escolha o motivo da baixa e responda se já deu baixa na Vigilância Sanitária.',
      'Informe a data de desligamento e, se necessário, anexe documentos.',
      'Clique em “Salvar Protocolo” e guarde o comprovante com o número do protocolo.',
    ],
    video: '/images/manual-crf-em-casa/baixa-responsabilidade-tecnica.webm',
    poster: '/images/manual-crf-em-casa/baixa-responsabilidade-tecnica-poster.webp',
    videoAlt: 'Solicitação de baixa de um vínculo de responsabilidade técnica no CRF AL em Casa.',
  },
  {
    id: 'certidao-regularidade',
    title: 'Imprimir a certidão de regularidade técnica',
    text: [
      'A Certidão de Regularidade Técnica (CRT) comprova que o estabelecimento está regular no CRF-AL. Quando liberada, ela fica disponível para impressão no próprio sistema. Após a emissão da CRT definitiva, a provisória é invalidada automaticamente.',
    ],
    steps: [
      'Acesse o CRF AL em Casa e abra “Impressão Certidão Regularidade Técnica”.',
      'Na linha “CRT Disponível para Impressão”, clique no ícone de impressão.',
      'Leia as informações e clique em “Confirmar Leitura”.',
      'A certidão abre em PDF: imprima ou salve o arquivo.',
    ],
    video: '/images/manual-crf-em-casa/certidao-regularidade.webm',
    poster: '/images/manual-crf-em-casa/certidao-regularidade-poster.webp',
    videoAlt: 'Emissão e impressão da certidão de regularidade técnica no CRF AL em Casa.',
  },
];
