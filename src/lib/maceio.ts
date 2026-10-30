import { DIAS_SEM_EXPEDIENTE, EXPEDIENTE, type DiaSemExpediente } from '@/config/contact';
import { useEffect, useState } from 'react';

/** Data de hoje em Maceió, no formato YYYY-MM-DD. */
export function todayInMaceio(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Maceio' }).format(agora);
}

const DIA_MS = 86_400_000;

/** Quando o expediente volta depois de `hoje`, pulando fins de semana e dias sem expediente. */
function proximaAbertura(hoje: string, diasSemExpediente: DiaSemExpediente[]) {
  const meioDia = Date.parse(`${hoje}T12:00:00Z`);
  const fimDeSemana = (data: Date) => [0, 6].includes(data.getUTCDay());
  for (let dias = 1; ; dias++) {
    const data = new Date(meioDia + dias * DIA_MS);
    const iso = data.toISOString().slice(0, 10);
    if (fimDeSemana(data) || diasSemExpediente.some((dia) => dia.data === iso)) continue;
    if (dias === 1 && !fimDeSemana(new Date(meioDia))) return 'amanhã';
    if (dias >= 7) return `em ${formatDate(iso, { day: '2-digit', month: '2-digit' })}`;
    return formatDate(iso, { weekday: 'long' }).replace('-feira', '');
  }
}

/** Expediente: segunda a sexta, das 9h às 17h, no horário de Maceió, exceto em `DIAS_SEM_EXPEDIENTE`. */
export function statusAtendimento(agora: Date, diasSemExpediente = DIAS_SEM_EXPEDIENTE) {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Maceio', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(agora);
  const dia = partes.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hora = Number(partes.find((p) => p.type === 'hour')?.value ?? 0) % 24;
  const minuto = Number(partes.find((p) => p.type === 'minute')?.value ?? 0);
  const minutos = hora * 60 + minuto;
  const hoje = todayInMaceio(agora);
  const abre = `abre ${proximaAbertura(hoje, diasSemExpediente)} às ${EXPEDIENTE.abre}h`;
  const semExpediente = diasSemExpediente.find((d) => d.data === hoje);
  if (semExpediente) return { aberto: false, texto: ['Fechado hoje', semExpediente.motivo, abre].filter(Boolean).join(' · ') };
  const util = !['Sat', 'Sun'].includes(dia);
  if (util && minutos >= EXPEDIENTE.abre * 60 && minutos < EXPEDIENTE.fecha * 60) return { aberto: true, texto: `Aberto agora · fecha às ${EXPEDIENTE.fecha}h` };
  if (util && minutos < EXPEDIENTE.abre * 60) return { aberto: false, texto: `Fechado · abre hoje às ${EXPEDIENTE.abre}h` };
  return { aberto: false, texto: `Fechado · ${abre}` };
}

/** Status do expediente, atualizado a cada minuto. */
export function useStatusAtendimento() {
  const [status, setStatus] = useState(() => statusAtendimento(new Date()));
  useEffect(() => {
    const timer = window.setInterval(() => setStatus(statusAtendimento(new Date())), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return status;
}

export function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('pt-BR', { ...options, timeZone: 'UTC' });
}

export function weekday(date: string) {
  const text = formatDate(date, { weekday: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function daysUntil(date: string, today: string) {
  return Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000);
}

export function countdown(days: number) {
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  return `Em ${days} dias`;
}
