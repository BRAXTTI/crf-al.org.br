import FiscalizacaoPageShell from './FiscalizacaoPageShell';

export default function InstrumentosFiscalizacaoPage() {
  return (
    <FiscalizacaoPageShell title="Instrumentos de fiscalização">
      <p>
        A fiscalização utiliza instrumentos formais para registrar constatações e determinar providências, assegurando transparência e padronização dos atos fiscalizatórios.
      </p>

      <h2>Termo de inspeção</h2>
      <p>
        Documento preenchido manual ou eletronicamente pelo farmacêutico fiscal, destinado à verificação do exercício das atividades farmacêuticas nos estabelecimentos. Seu preenchimento é obrigatório em todas as inspeções.
      </p>

      <h2>Termo de notificação</h2>
      <p>
        Documento preenchido manual ou eletronicamente pelo farmacêutico fiscal para determinar providências imediatas aos representantes legais quanto à documentação e registros, no prazo de 5 dias úteis.
      </p>

      <h2>Termo de intimação</h2>
      <p>
        Documento preenchido manual ou eletronicamente pelo farmacêutico fiscal para determinar providências imprescindíveis ao farmacêutico e/ou ao estabelecimento, especialmente sobre atividades farmacêuticas.
      </p>
    </FiscalizacaoPageShell>
  );
}
