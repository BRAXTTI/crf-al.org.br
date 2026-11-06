/**
 * Conteúdo curto de cada tarefa em `/servicos/tutoriais/:id`. Os passos em
 * `requerimentos.ts` continuam sendo os da Central; ao mudar um processo, revise
 * os dois textos. Os tempos (`inicio`/`fim`, em segundos) foram marcados assistindo
 * cada gravação: ao trocar o arquivo, marque de novo.
 */
import { VIDEOS_URL } from '@/config/site';

export interface PassoGuia {
  /** Até ~8 palavras, com o nome do botão entre aspas. */
  titulo: string;
  /** Uma linha, mostrada só no passo ativo quando há vídeo. */
  detalhe?: string;
  inicio?: number;
  fim?: number;
}

export interface VideoGuia {
  /** MP4 (H.264 + AAC): fallback que toca em qualquer aparelho. */
  src: string;
  /** WebM (VP9 + Opus) menor, oferecido antes do MP4 quando existir. */
  webm?: string;
  poster: string;
  alt: string;
  duracao: string;
  /** Tem narração: não toca sozinho; toca no clique, com som e controles de volume. */
  narrado?: boolean;
  /** Proporção do arquivo; padrão '4:3' (gravações do Manual). */
  proporcao?: '4:3' | '16:9';
  /** Diferença entre o que o vídeo mostra e o caminho do botão de ação. */
  aviso?: string;
}

/**
 * Foto 16:9 (960x540) até haver vídeo; não é print do sistema. Com `video`, o vídeo tem prioridade.
 */
export interface CapaProvisoria {
  src: string;
  alt: string;
}

export interface GuiaTutorial {
  tempoEstimado: string;
  /** No máximo 3. */
  antes: string[];
  passos: PassoGuia[];
  /** Esperas e entregas presenciais: não contam como passo. */
  depois?: string[];
  video?: VideoGuia;
  capaProvisoria?: CapaProvisoria;
  /** Enquanto não há vídeo curto, link discreto para o YouTube (duração exibida). */
  videoCompleto?: string;
  problemas: { sintoma: string; solucao: string }[];
  /** Id de outra tarefa, só quando há continuação real. */
  proxima?: string;
}

const SENHA = { sintoma: 'Esqueci a senha', solucao: 'Na tela de login, use "Recuperar Senha", no Painel de Controle.' };
const LOGIN_PF = { sintoma: 'Não encontro o botão', solucao: 'Confira se entrou como Pessoa Física. Os botões mudam conforme o login.' };
const LOGIN_PJ = { sintoma: 'Não encontro o botão', solucao: 'Confira se entrou como Pessoa Jurídica. Os botões mudam conforme o login.' };
const ANEXO = { sintoma: 'O arquivo não anexa', solucao: 'Use JPG, PNG, TIFF ou PDF. Se persistir, fale com o atendimento.' };

export const GUIAS: Record<string, GuiaTutorial> = {
  'primeira-inscricao': {
    tempoEstimado: 'cerca de 10 min',
    capaProvisoria: {
      src: '/images/tutoriais/primeira-inscricao-foto-poster.webp',
      alt: 'Mesa de estudo com jaleco branco dobrado, pasta azul-marinho fechada com documentos, caneta dourada e notebook de costas.',
    },
    antes: ['Não precisa de login', 'Documentos prontos para anexar'],
    passos: [
      { titulo: 'Clique em "Fazer pré-inscrição"', detalhe: 'No sistema, a opção é "Pré Inscrição Pessoa Física".' },
      { titulo: 'Preencha o formulário' },
      { titulo: 'Anexe os documentos' },
      { titulo: 'Imprima o protocolo' },
    ],
    depois: [
      'Leve a documentação original à sede ou à seccional do CRF-AL.',
      'O CRF-AL analisa os documentos e o protocolo vai à plenária.',
      'Aprovada a inscrição, você recebe um e-mail com o boleto da taxa.',
      'Pague o boleto e aguarde a compensação para receber a confirmação.',
    ],
    problemas: [
      { sintoma: 'Não sei quais documentos enviar', solucao: 'A lista completa está no link "Ver documentos", em "Antes de começar".' },
      ANEXO,
    ],
  },
  'inscricao-definitiva': {
    tempoEstimado: 'cerca de 10 min',
    videoCompleto: '1:47',
    antes: ['Login de Pessoa Física', 'Diploma pronto para anexar'],
    passos: [
      { titulo: 'Clique em "Formulários e Requerimentos"' },
      { titulo: 'Baixe o formulário de carteira definitiva', detalhe: '"Solicitação de Carteira Definitiva, Segunda Via ou Cédula de Identidade".' },
      { titulo: 'Preencha o formulário', detalhe: 'Siga as instruções do próprio documento.' },
      { titulo: 'Clique em "Enviar Documentos"', detalhe: 'O botão fica na página inicial.' },
      { titulo: 'Selecione "Solicitação de Carteira Definitiva"' },
      { titulo: 'Anexe o formulário e o diploma' },
      { titulo: 'Salve o protocolo' },
    ],
    depois: ['Leve os documentos originais à sede ou à seccional para conferência.', 'O CRF-AL analisa o protocolo.'],
    problemas: [SENHA, LOGIN_PF, ANEXO],
    proxima: 'situacao-protocolos',
  },
  'alteracao-de-dados': {
    tempoEstimado: 'cerca de 3 min',
    antes: ['Login de Pessoa Física', 'Comprovante do dado alterado, se necessário'],
    passos: [
      { titulo: 'Clique em "Meus Dados"' },
      { titulo: 'Clique no dado que quer alterar' },
      { titulo: 'Altere as informações' },
      { titulo: 'Anexe comprovantes, se necessário' },
      { titulo: 'Clique em "Salvar Protocolo"' },
    ],
    problemas: [SENHA, LOGIN_PF, ANEXO],
    proxima: 'situacao-protocolos',
  },
  'contratacao-rt': {
    tempoEstimado: 'cerca de 5 min',
    videoCompleto: '0:48',
    antes: ['Login de Pessoa Jurídica', 'Comprovante do vínculo empregatício'],
    passos: [
      { titulo: 'Clique em "Solicitação de RT"' },
      { titulo: 'Preencha os campos' },
      { titulo: 'Anexe o comprovante do vínculo' },
    ],
    depois: ['O CRF-AL analisa o protocolo.'],
    problemas: [SENHA, LOGIN_PJ, ANEXO],
    proxima: 'situacao-protocolos',
  },
  'baixa-rt': {
    tempoEstimado: 'cerca de 2 min',
    video: {
      src: `${VIDEOS_URL}/tutoriais/baixa-responsabilidade-tecnica.mp4`,
      webm: `${VIDEOS_URL}/tutoriais/baixa-responsabilidade-tecnica.webm`,
      poster: '/images/tutoriais/baixa-responsabilidade-tecnica-poster.webp',
      alt: 'Baixa de responsabilidade técnica no CRF AL em Casa, do acesso pelo painel até salvar o protocolo.',
      duracao: '0:53',
      narrado: true,
      proporcao: '16:9',
    },
    antes: ['Login de Pessoa Física', 'Data de desligamento'],
    passos: [
      { titulo: 'Clique em "Baixa Resp. Técnicas"', detalhe: 'No painel, em "Atalhos de Menus Mais Usados".', inicio: 0, fim: 22.8 },
      { titulo: 'Clique na empresa do vínculo', detalhe: 'A tela abre com o título "Baixa de Contrato de Trabalho".', inicio: 22.8, fim: 27.5 },
      { titulo: 'Escolha o motivo e responda à tela', detalhe: 'A tela pergunta se você já deu baixa na Vigilância.', inicio: 27.5, fim: 32 },
      { titulo: 'Informe a data de desligamento', detalhe: 'Na tela, o campo aparece como "Data Rescisão".', inicio: 32, fim: 34.5 },
      { titulo: 'Anexe documentos, se necessário', detalhe: 'Com problema no desligamento, anexe em "Selecione" uma declaração com os motivos.', inicio: 34.5, fim: 42.6 },
      { titulo: 'Clique em "Salvar Protocolo"', detalhe: 'Guarde o comprovante com o número do protocolo.', inicio: 42.6, fim: 52.8 },
    ],
    depois: ['Acompanhe o status do protocolo no menu "Protocolos Web".'],
    problemas: [SENHA, LOGIN_PF, { sintoma: 'O vínculo não aparece', solucao: 'Confira seus vínculos em "Resp. Técnicas Ativas/Perfil". Se faltar algum, fale com o atendimento.' }],
    proxima: 'situacao-protocolos',
  },
  'afastamento-provisorio': {
    tempoEstimado: 'cerca de 3 min',
    video: {
      src: `${VIDEOS_URL}/tutoriais/afastamento-provisorio.mp4`,
      poster: '/images/tutoriais/afastamento-provisorio-comunicado-poster.webp',
      alt: 'Comunicado de afastamento provisório no CRF AL em Casa, do acesso pelo painel até salvar o protocolo.',
      duracao: '0:55',
      narrado: true,
      proporcao: '16:9',
    },
    antes: ['Login de Pessoa Física', 'Datas do afastamento', 'Comprovante do motivo'],
    passos: [
      { titulo: 'Clique em "Comunicado de Ausência (Afastamento Provisório)"', detalhe: 'No painel, em "Atalhos de Menus Mais Usados" > Fiscalização.', inicio: 0, fim: 21.1 },
      { titulo: 'Marque a responsabilidade técnica (RT)', inicio: 21.1, fim: 25 },
      { titulo: 'Selecione o motivo da ausência', detalhe: 'O sistema mostra o máximo de dias permitido para o motivo.', inicio: 25, fim: 32 },
      { titulo: 'Informe as datas de início e fim', detalhe: 'Informe também os horários, quando o motivo permitir.', inicio: 32, fim: 39.3 },
      { titulo: 'Anexe o comprovante em "Selecione"', inicio: 39.3, fim: 43.8 },
      { titulo: 'Clique em "Salvar Protocolo"', inicio: 43.8, fim: 55.2 },
    ],
    depois: ['Acompanhe o status do protocolo no menu "Protocolos Web".'],
    problemas: [SENHA, LOGIN_PF, ANEXO],
    proxima: 'situacao-protocolos',
  },
  'justificativa-de-ausencia': {
    tempoEstimado: 'cerca de 3 min',
    antes: ['Login de Pessoa Física'],
    passos: [
      { titulo: 'Abra o menu "Justificativa de Ausência"' },
      { titulo: 'Selecione a inspeção com a ausência' },
      { titulo: 'Preencha o formulário' },
      { titulo: 'Clique em "Salvar Justificativa"' },
    ],
    problemas: [SENHA, LOGIN_PF, { sintoma: 'A inspeção não aparece', solucao: 'Fale com o atendimento e informe a data da inspeção.' }],
  },
  'defesa-auto-infracao': {
    tempoEstimado: 'cerca de 5 min',
    video: {
      src: `${VIDEOS_URL}/tutoriais/defesa-auto-infracao.mp4`,
      webm: `${VIDEOS_URL}/tutoriais/defesa-auto-infracao.webm`,
      poster: '/images/tutoriais/defesa-auto-infracao-poster.webp',
      alt: 'Defesa de auto de infração no CRF AL em Casa, do acesso pelo painel até salvar a defesa e acompanhar o protocolo.',
      duracao: '1:02',
      narrado: true,
      proporcao: '16:9',
    },
    antes: ['Login de Pessoa Jurídica, com o CPF do representante legal', 'Defesa assinada digitalmente', 'Comprovante de representação legal'],
    passos: [
      { titulo: 'Clique em "Defesa de Infração"', detalhe: 'No painel, em "Atalhos de Menus Mais Usados" > Fiscalização.', inicio: 0, fim: 24.1 },
      { titulo: 'Clique no auto de infração', detalhe: 'No 1º passo da tela, com a situação "Aguardando Defesa".', inicio: 24.1, fim: 31.9 },
      { titulo: 'Anexe a defesa assinada em "Selecione"', detalhe: 'No 2º passo da tela.', inicio: 31.9, fim: 37.4 },
      { titulo: 'Anexe a comprovação de representação legal', detalhe: 'No 3º passo, ao lado, também em "Selecione".', inicio: 37.4, fim: 44.7 },
      { titulo: 'Se quiser, preencha "Informações Adicionais"', inicio: 44.7, fim: 50.6 },
      { titulo: 'Clique em "Salvar Defesa"', detalhe: 'Confira todas as informações antes de salvar.', inicio: 50.6, fim: 61.9 },
    ],
    depois: ['A defesa deve ser enviada dentro do prazo indicado na notificação.', 'Acompanhe o status do protocolo no menu "Protocolos Web".'],
    problemas: [SENHA, LOGIN_PJ, ANEXO],
    proxima: 'situacao-protocolos',
  },
  'situacao-protocolos': {
    tempoEstimado: 'cerca de 1 min',
    video: {
      src: `${VIDEOS_URL}/tutoriais/situacao-protocolos.mp4`,
      webm: `${VIDEOS_URL}/tutoriais/situacao-protocolos.webm`,
      poster: '/images/tutoriais/situacao-protocolos-poster.webp',
      alt: 'Acompanhamento de protocolos no CRF AL em Casa, da lista em "Protocolos Web" até "Protocolos Aguardando Resposta".',
      duracao: '0:54',
      narrado: true,
      proporcao: '16:9',
    },
    antes: ['Login do CRF AL em Casa', 'Número do protocolo'],
    passos: [
      { titulo: 'Clique em "Protocolos Web"', detalhe: 'No painel, em "Atalhos de Menus Mais Usados".', inicio: 0, fim: 20 },
      { titulo: 'Filtre a lista ou busque pelo número', detalhe: 'O filtro mostra só os protocolos em aberto ou os finalizados.', inicio: 20, fim: 27.7 },
      { titulo: 'Confira a etapa na coluna "Situação"', inicio: 27.7, fim: 31.7 },
      { titulo: 'Se houver pendência, abra "Protocolos Aguardando Resposta"', detalhe: 'Volte ao painel. Ali o CRF-AL pede documentos ou informações que faltaram.', inicio: 31.7, fim: 40.4 },
      { titulo: 'Selecione o protocolo, responda e anexe', detalhe: 'Anexe o que foi solicitado.', inicio: 40.4, fim: 46.2 },
      { titulo: 'Clique em "Salvar"', detalhe: 'O sistema mostra o comprovante da resposta.', inicio: 46.2, fim: 54.2 },
    ],
    problemas: [SENHA, { sintoma: 'O protocolo não aparece', solucao: 'Confira se entrou com o mesmo login usado para abrir o protocolo e veja também "Protocolos CRF".' }],
  },
  'emitir-boletos': {
    tempoEstimado: 'cerca de 2 min',
    video: {
      src: `${VIDEOS_URL}/tutoriais/emitir-boletos.mp4`,
      webm: `${VIDEOS_URL}/tutoriais/emitir-boletos.webm`,
      poster: '/images/tutoriais/emitir-boletos-poster.webp',
      alt: 'Emissão do boleto da anuidade no CRF AL em Casa, do acesso sem login até selecionar a anuidade e imprimir.',
      duracao: '0:48',
      narrado: true,
      proporcao: '16:9',
    },
    antes: ['Não precisa de login', 'Número de inscrição e CPF ou CNPJ', 'Data de nascimento, se a tela pedir'],
    passos: [
      { titulo: 'Clique em "Impressão Anuidade Ano Corrente"', detalhe: 'No "Painel de Controle", sem precisar de login, ou pelo botão "Emitir boleto".', inicio: 0, fim: 14.5 },
      { titulo: 'Selecione o tipo de cadastro', detalhe: 'Por exemplo, Farmacêutico.', inicio: 14.5, fim: 18.1 },
      { titulo: 'Preencha os dados solicitados', detalhe: 'Inscrição, CPF e data de nascimento.', inicio: 18.1, fim: 23.2 },
      { titulo: 'Clique em "Consultar"', detalhe: 'Se precisar corrigir algum dado depois, clique em "Nova Consulta".', inicio: 23.2, fim: 25.5 },
      { titulo: 'Marque a anuidade e clique em "Imprimir Boleto"', detalhe: 'As anuidades disponíveis aparecem destacadas em verde.', inicio: 25.5, fim: 47.6 },
    ],
    depois: [
      'Essa tela mostra só anuidades do ano ainda não vencidas.',
      'Parcelamentos e acordos: na tela de acesso, use "Impressão Parcelamentos/Acordo".',
      'Débitos vencidos: entre na área restrita ou fale com o CRF-AL.',
    ],
    problemas: [{ sintoma: 'O débito não aparece', solucao: 'A tela do botão só mostra anuidades do ano não vencidas. Para outros débitos, veja "Depois de emitir".' }],
  },
  'imprimir-crt': {
    tempoEstimado: 'cerca de 1 min',
    video: {
      src: `${VIDEOS_URL}/tutoriais/imprimir-crt.mp4`,
      webm: `${VIDEOS_URL}/tutoriais/imprimir-crt.webm`,
      poster: '/images/tutoriais/imprimir-crt-poster.webp',
      alt: 'Impressão da Certidão de Regularidade Técnica no CRF AL em Casa, do acesso pelo painel até o ícone da certidão disponível.',
      duracao: '0:47',
      narrado: true,
      proporcao: '16:9',
    },
    antes: ['Login do CRF AL em Casa', 'Certidão liberada pelo CRF-AL'],
    passos: [
      { titulo: 'Clique em "Impressão Certidão de Regularidade"', detalhe: 'No painel, em "Atalhos de Menus Mais Usados".', inicio: 0, fim: 21.7 },
      { titulo: 'Clique no ícone do documento', detalhe: 'Fica no começo da linha "CRT Disponível para Impressão".', inicio: 21.7, fim: 31.3 },
      { titulo: 'Leia e clique em "Confirmar Leitura"', inicio: 31.3, fim: 35.9 },
      { titulo: 'Salve ou imprima o PDF', inicio: 35.9, fim: 47.2 },
    ],
    depois: ['Após a emissão da CRT definitiva, a provisória é invalidada automaticamente.'],
    problemas: [SENHA, { sintoma: 'A certidão não aparece para impressão', solucao: 'Ela só fica disponível depois de liberada. Fale com o atendimento para saber a situação.' }],
  },
};
