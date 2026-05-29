import FiscalizacaoPageShell from './FiscalizacaoPageShell';

export default function LegislacaoPage() {
  return (
    <FiscalizacaoPageShell title="Legislação">
      <p>
        Esta área reúne referências para consulta da legislação profissional farmacêutica e dos atos normativos aplicáveis ao exercício e à fiscalização.
      </p>

      <h2>Referências principais</h2>
      <ul>
        <li>Lei Federal nº 3.820/1960.</li>
        <li>Resoluções do Conselho Federal de Farmácia (CFF).</li>
        <li>Normas complementares relacionadas à assistência farmacêutica e responsabilidade técnica.</li>
      </ul>

      <h2>Consulta atualizada</h2>
      <p>
        Para acessar textos integrais, versões atualizadas de normas e atos recentes, utilize o portal oficial do Conselho Federal de Farmácia.
      </p>

      <a
        href="https://www.cff.org.br"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex rounded-lg bg-crfal-blue px-4 py-2 text-sm font-medium text-white hover:bg-crfal-blue-dark transition-colors"
      >
        Acessar portal do CFF
      </a>
    </FiscalizacaoPageShell>
  );
}
