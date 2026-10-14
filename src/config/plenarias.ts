/** Agenda oficial do CRF-AL. Incluir apenas informações confirmadas pela equipe. */
export interface PlenaryMeeting {
  id: string;
  title: string;
  /** Data local da reunião, no formato YYYY-MM-DD (sem conversão para UTC). */
  date: string;
  time?: string;
  location?: string;
  /** PDF público da pauta do dia. */
  agendaUrl?: string;
  /** PDF público da ata assinada. */
  minutesUrl?: string;
  /** Gravações no YouTube, na ordem das partes. */
  videoUrls?: string[];
  /** Reunião aberta, mas não realizada por falta de quórum. */
  noQuorum?: boolean;
}

export interface PlenaryYear {
  year: number;
  /** Exibir aviso público enquanto a agenda contiver exemplos. */
  isDemo?: boolean;
  calendarUrl?: string;
  meetings: PlenaryMeeting[];
}

// Datas confirmadas pela equipe; vídeos do canal do CRF-AL no YouTube.
// Gravações de poucos minutos correspondem a reuniões sem quórum. Horário e local ainda não informados.
export const plenaryYears: PlenaryYear[] = [{
  year: 2026,
  meetings: [
    { id: 'plenaria-2026-01-16', title: '1ª Reunião Plenária Ordinária', date: '2026-01-16', videoUrls: ['https://www.youtube.com/watch?v=Yte0FNf69QA'] },
    { id: 'plenaria-2026-02-20', title: '2ª Reunião Plenária Ordinária', date: '2026-02-20', videoUrls: ['https://www.youtube.com/watch?v=nS813PXu2kY'] },
    { id: 'plenaria-2026-03-20', title: '3ª Reunião Plenária Ordinária', date: '2026-03-20', videoUrls: ['https://www.youtube.com/watch?v=Ac2qUwFRMRQ'], noQuorum: true },
    { id: 'plenaria-2026-04-13', title: 'Reunião Plenária Extraordinária', date: '2026-04-13', videoUrls: ['https://www.youtube.com/watch?v=BTjPUmTcpKM'], noQuorum: true },
    { id: 'plenaria-2026-04-17', title: '4ª Reunião Plenária Ordinária', date: '2026-04-17' },
    { id: 'plenaria-2026-05-15', title: '5ª Reunião Plenária Ordinária', date: '2026-05-15', videoUrls: ['https://www.youtube.com/watch?v=eCMdJjCnFck'] },
    { id: 'plenaria-2026-06-19', title: '6ª Reunião Plenária Ordinária', date: '2026-06-19', videoUrls: ['https://www.youtube.com/watch?v=hovhwau2lxM'], noQuorum: true },
    { id: 'plenaria-2026-07-17', title: '7ª Reunião Plenária Ordinária', date: '2026-07-17', videoUrls: ['https://www.youtube.com/watch?v=g-j9HB_OApM', 'https://www.youtube.com/watch?v=TKHPNbMgVgg'], noQuorum: true },
    { id: 'plenaria-2026-08-21', title: '8ª Reunião Plenária Ordinária', date: '2026-08-21', videoUrls: ['https://www.youtube.com/watch?v=6AvO-jaXHFk'], noQuorum: true },
    { id: 'plenaria-2026-09-25', title: '9ª Reunião Plenária Ordinária', date: '2026-09-25', videoUrls: ['https://www.youtube.com/watch?v=XmNtBSm_C7I'] },
    { id: 'plenaria-2026-10-16', title: '10ª Reunião Plenária Ordinária', date: '2026-10-16' },
    { id: 'plenaria-2026-11-13', title: '11ª Reunião Plenária Ordinária', date: '2026-11-13' },
    { id: 'plenaria-2026-12-18', title: '12ª Reunião Plenária Ordinária', date: '2026-12-18' },
  ],
}];
