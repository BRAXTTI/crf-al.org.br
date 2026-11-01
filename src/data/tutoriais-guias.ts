/**
 * Conteúdo curto de cada tarefa em `/servicos/tutoriais/:id`. Os passos em
 * `requerimentos.ts` continuam sendo os da Central; ao mudar um processo, revise
 * os dois textos. Os tempos (`inicio`/`fim`, em segundos) foram marcados assistindo
 * cada gravação: ao trocar o arquivo, marque de novo.
 */
import { MANUAL_CRF_EM_CASA } from '@/data/manual-crf-em-casa';

export interface PassoGuia {
  /** Até ~8 palavras, com o nome do botão entre aspas. */
  titulo: string;
  /** Uma linha, mostrada só no passo ativo quando há vídeo. */
  detalhe?: string;
  inicio?: number;
  fim?: number;
}

export interface VideoGuia {
  src: string;
  poster: string;
  alt: string;
  duracao: string;
  /** Diferença entre o que o vídeo mostra e o caminho do botão de ação. */
  aviso?: string;
}

export interface GuiaTutorial {
  tempoEstimado: string;
  /** No máximo 3. */
  antes: string[];
  passos: PassoGuia[];
  /** Esperas e entregas presenciais: não contam como passo. */
  depois?: string[];
  video?: VideoGuia;
  /** Enquanto não há vídeo curto, link discreto para o YouTube (duração exibida). */
  videoCompleto?: string;
  problemas: { sintoma: string; solucao: string }[];
  /** Id de outra tarefa, só quando há continuação real. */
  proxima?: string;
}

function doManual(id: string, duracao: string, aviso?: string): VideoGuia {
  const secao = MANUAL_CRF_EM_CASA.find((s) => s.id === id);
  if (!secao?.video || !secao.poster) throw new Error(`Manual sem vídeo: ${id}`);
  return { src: secao.video, poster: secao.poster, alt: secao.videoAlt, duracao, aviso };
}

const SENHA = { sintoma: 'Esqueci a senha', solucao: 'Na tela de login, use "Recuperar Senha", no Painel de Controle.' };
const LOGIN_PF = { sintoma: 'Não encontro o botão', solucao: 'Confira se entrou como Pessoa Física. Os botões mudam conforme o login.' };
const LOGIN_PJ = { sintoma: 'Não encontro o botão', solucao: 'Confira se entrou como Pessoa Jurídica. Os botões mudam conforme o login.' };
const ANEXO = { sintoma: 'O arquivo não anexa', solucao: 'Use JPG, PNG, TIFF ou PDF. Se persistir, fale com o atendimento.' };

export const GUIAS: Record<string, GuiaTutorial> = {
  'primeira-inscricao': {
    tempoEstimado: 'cerca de 10 min',
    antes: ['Não precisa de login', 'Documentos prontos para anexar'],
    passos: [
      { titulo: 'Clique em "Fazer pré-inscrição"', detalhe: 'No sistema, a opção é "Pré Inscrição Pessoa Física".' },
      { titulo: 'Preencha o formulário' },
      { titulo: 'Anexe os documentos' },
      { titulo: 'Imprima o protocolo' },
    ],
    depois: [
      'Leve a documentação original à sede ou à seccional do CRF-AL.',
      'O CRF-AL analisa os documentos e o pedido vai à plenária.',
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
    depois: ['Leve os documentos originais à sede ou à seccional para conferência.', 'O CRF-AL analisa o pedido.'],
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
    depois: ['O CRF-AL analisa o pedido.'],
    problemas: [SENHA, LOGIN_PJ, ANEXO],
    proxima: 'situacao-protocolos',
  },
  'baixa-rt': {
    tempoEstimado: 'cerca de 2 min',
    video: doManual('baixa-responsabilidade-tecnica', '0:32'),
    antes: ['Login de Pessoa Física', 'Data de desligamento'],
    passos: [
      { titulo: 'Clique em "Baixa Resp. Técnicas"', detalhe: 'A tela abre com o título "Baixa de Contrato de Trabalho".', inicio: 0, fim: 5 },
      { titulo: 'Escolha a empresa do vínculo', inicio: 5, fim: 10 },
      { titulo: 'Informe o motivo e responda à tela', detalhe: 'A tela pode perguntar se você já deu baixa na Vigilância.', inicio: 10, fim: 15 },
      { titulo: 'Informe a data de desligamento', detalhe: 'Na tela, o campo aparece como "Data Rescisão".', inicio: 15, fim: 19 },
      { titulo: 'Anexe documentos, se necessário', detalhe: 'Com problema no desligamento, anexe declaração com os motivos e, se houver, a ação trabalhista.', inicio: 19, fim: 23 },
      { titulo: 'Clique em "Salvar Protocolo"', detalhe: 'Guarde o comprovante com o número do protocolo.', inicio: 23, fim: 32.4 },
    ],
    problemas: [SENHA, LOGIN_PF, { sintoma: 'O vínculo não aparece', solucao: 'Confira seus vínculos em "Resp. Técnicas Ativas/Perfil". Se faltar algum, fale com o atendimento.' }],
    proxima: 'situacao-protocolos',
  },
  'consulta-rt': {
    tempoEstimado: 'cerca de 1 min',
    antes: ['Login de Pessoa Física'],
    passos: [
      { titulo: 'Clique em "Resp. Técnicas Ativas/Perfil"' },
      { titulo: 'Veja as empresas do seu vínculo' },
      { titulo: 'Confira tipo de vínculo, situação e perfis' },
    ],
    problemas: [SENHA, LOGIN_PF, { sintoma: 'Um vínculo está errado ou faltando', solucao: 'Fale com o atendimento e informe o nome da empresa.' }],
  },
  'afastamento-provisorio': {
    tempoEstimado: 'cerca de 3 min',
    videoCompleto: '2:13',
    antes: ['Login de Pessoa Física', 'Datas do afastamento', 'Comprovante do motivo'],
    passos: [
      { titulo: 'Clique em "Comunicado de Afastamento Provisório"' },
      { titulo: 'Selecione a responsabilidade técnica (RT)' },
      { titulo: 'Selecione o motivo da ausência' },
      { titulo: 'Informe as datas de início e término', detalhe: 'Informe também os horários, quando o motivo permitir.' },
      { titulo: 'Anexe o comprovante do motivo' },
      { titulo: 'Clique em "Salvar Protocolo"' },
    ],
    depois: ['Atestado médico: apresente presencialmente no CRF-AL em até 10 dias.'],
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
    videoCompleto: '1:35',
    antes: ['Login de Pessoa Jurídica', 'Defesa assinada digitalmente', 'Comprovante de representação legal'],
    passos: [
      { titulo: 'Em Fiscalização, clique em "Defesa de Infração"' },
      { titulo: 'Selecione o auto de infração' },
      { titulo: 'Anexe a defesa assinada digitalmente' },
      { titulo: 'Anexe a comprovação de representação legal' },
      { titulo: 'Clique em "Salvar Defesa"' },
    ],
    depois: ['A defesa deve ser enviada dentro do prazo indicado na notificação.'],
    problemas: [SENHA, LOGIN_PJ, ANEXO],
    proxima: 'situacao-protocolos',
  },
  'situacao-protocolos': {
    tempoEstimado: 'cerca de 1 min',
    video: doManual('protocolos', '0:27'),
    antes: ['Login do CRF AL em Casa', 'Número do protocolo'],
    passos: [
      { titulo: 'Clique em "Protocolos Web"', detalhe: 'O botão fica na página inicial.', inicio: 0, fim: 2 },
      { titulo: 'Localize o protocolo e confira a situação', inicio: 2, fim: 10 },
      { titulo: 'Se houver pendência, abra "Protocolos Aguardando Resposta"', inicio: 10, fim: 15 },
      { titulo: 'Escreva a resposta e anexe o que foi pedido', inicio: 15, fim: 21 },
      { titulo: 'Clique em "Salvar"', detalhe: 'O sistema mostra o comprovante da resposta.', inicio: 21, fim: 27 },
    ],
    problemas: [SENHA, { sintoma: 'O protocolo não aparece', solucao: 'Confira se entrou com o mesmo login usado no pedido e veja também "Protocolos CRF".' }],
  },
  'emitir-boletos': {
    tempoEstimado: 'cerca de 2 min',
    video: doManual('boletos', '0:28', 'O vídeo mostra a tela de parcelamentos. A de anuidades do ano, aberta pelo botão, pede os mesmos dados.'),
    antes: ['Não precisa de login', 'Número de inscrição e CPF ou CNPJ', 'Data de nascimento, se a tela pedir'],
    passos: [
      { titulo: 'Clique em "Emitir boleto"', detalhe: 'Abre a "Impressão de Anuidades do Ano Corrente".', inicio: 0, fim: 5 },
      { titulo: 'Selecione o tipo', detalhe: 'Por exemplo, Farmacêutico.', inicio: 5, fim: 8 },
      { titulo: 'Preencha os dados pedidos na tela', inicio: 8, fim: 14 },
      { titulo: 'Clique em "Consultar"', inicio: 14, fim: 21 },
      { titulo: 'Selecione o débito e imprima o boleto', inicio: 21, fim: 28.4 },
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
    video: doManual('certidao-regularidade', '0:18'),
    antes: ['Login do CRF AL em Casa', 'Certidão liberada pelo CRF-AL'],
    passos: [
      { titulo: 'Clique em "Impressão Certidão de Regularidade"', inicio: 0, fim: 3 },
      { titulo: 'Clique no ícone de impressão', detalhe: 'Fica na linha "CRT Disponível para Impressão".', inicio: 3, fim: 10 },
      { titulo: 'Leia e clique em "Confirmar Leitura"', inicio: 10, fim: 14 },
      { titulo: 'Imprima ou salve o PDF', inicio: 14, fim: 18.3 },
    ],
    depois: ['Após a emissão da CRT definitiva, a provisória é invalidada automaticamente.'],
    problemas: [SENHA, { sintoma: 'A certidão não aparece para impressão', solucao: 'Ela só fica disponível depois de liberada. Fale com o atendimento para saber a situação.' }],
  },
};
