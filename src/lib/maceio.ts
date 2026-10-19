import { useEffect, useState } from 'react';

/** Data de hoje em Maceió, no formato YYYY-MM-DD. */
export function todayInMaceio(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Maceio' }).format(agora);
}

/** Expediente: segunda a sexta, das 9h às 17h, no horário de Maceió (não considera feriados). */
export function statusAtendimento(agora: Date) {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Maceio', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(agora);
  const dia = partes.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hora = Number(partes.find((p) => p.type === 'hour')?.value ?? 0) % 24;
  const minuto = Number(partes.find((p) => p.type === 'minute')?.value ?? 0);
  const minutos = hora * 60 + minuto;
  const util = !['Sat', 'Sun'].includes(dia);
  if (util && minutos >= 9 * 60 && minutos < 17 * 60) return { aberto: true, texto: 'Aberto agora · fecha às 17h' };
  if (util && minutos < 9 * 60) return { aberto: false, texto: 'Fechado · abre hoje às 9h' };
  if (dia === 'Fri' || dia === 'Sat' || dia === 'Sun') return { aberto: false, texto: 'Fechado · abre segunda às 9h' };
  return { aberto: false, texto: 'Fechado · abre amanhã às 9h' };
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
