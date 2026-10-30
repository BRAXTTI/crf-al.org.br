/** Dados institucionais compartilhados; não duplicar nas páginas. */
export const ATENDIMENTO = {
  telefone: '(82) 99971-0247',
  whatsapp: '(82) 99971-0247',
  email: 'atendimento@crf-al.org.br',
};

export const LOCAIS = [
  {
    id: 'sede',
    nome: 'Sede',
    cidade: 'Maceió',
    endereco: 'Rua Oldemburgo da Silva Paranhos (antiga Rua Goiás), 290 – Farol, Maceió/AL – CEP 57055-320',
    busca: 'Rua Oldemburgo da Silva Paranhos, 290, Farol, Maceió, AL',
  },
  {
    id: 'seccional',
    nome: 'Seccional',
    cidade: 'Arapiraca',
    endereco: 'Rua Delmiro Gouveia, 1382, sala 01, 1º andar – Sen. Teotônio Vilela, Arapiraca/AL – CEP 57312-415',
    busca: 'Rua Delmiro Gouveia, 1382, Senador Teotônio Vilela, Arapiraca, AL',
  },
];


export const SETOR_CONTATOS = {
  fiscalizacao: { email: 'fiscalizacao@crf-al.org.br', telefone: ATENDIMENTO.telefone, whatsapp: '(82) 99999-8624' },
  ouvidoria: { email: 'ouvidoria@crf-al.org.br', telefone: ATENDIMENTO.telefone },
  tecnologia: { email: 'tecnologia@crf-al.org.br', telefone: '(82) 99355-8888' },
} as const;
export const EXPEDIENTE = { abre: 9, fecha: 17, dias: 'Segunda a sexta' } as const;
export const HORARIO_ATENDIMENTO = `${EXPEDIENTE.dias}, das ${EXPEDIENTE.abre}h às ${EXPEDIENTE.fecha}h`;
/** Dias sem expediente (feriados, pontos facultativos), com data YYYY-MM-DD no horário de Maceió. */
export type DiaSemExpediente = { data: string; motivo?: string };
export const DIAS_SEM_EXPEDIENTE: DiaSemExpediente[] = [
  { data: '2026-10-30', motivo: 'sem expediente' },
];
export const telefoneHref = (telefone: string) => `tel:+55${telefone.replace(/\D/g, '')}`;
