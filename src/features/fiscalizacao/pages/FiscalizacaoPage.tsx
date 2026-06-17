import FiscalizacaoPageShell from './FiscalizacaoPageShell';

export default function FiscalizacaoPage() {
  return (
    <FiscalizacaoPageShell
      title="Fiscalização"
      description="Saiba como o CRFAL fiscaliza o exercício profissional farmacêutico em Alagoas — procedimentos, atuações, penalidades e base legal."
    >
      <p>
        O Conselho Regional de Farmácia do Estado de Alagoas é uma autarquia federal criada pela Lei Federal 3.820, de 11 de novembro de 1960. Entre suas atribuições legais está fiscalizar o exercício da profissão farmacêutica e coibir infrações à legislação.
      </p>

      <h2>Papel institucional</h2>
      <ul>
        <li>Garantir assistência farmacêutica efetiva, ética e segura para a população.</li>
        <li>Realizar inspeções em estabelecimentos farmacêuticos em todo o estado.</li>
        <li>Encaminhar demandas e irregularidades aos órgãos competentes quando necessário.</li>
      </ul>

      <h2>Procedimento fiscal</h2>
      <p>
        O procedimento fiscal observa as normas do CFF sobre presença do farmacêutico e condições do exercício profissional. O Processo Administrativo Fiscal é instaurado a partir da lavratura do Auto de Infração.
      </p>
      <ul>
        <li>Falta de registro do estabelecimento junto ao Conselho.</li>
        <li>Ausência de responsável técnico no exercício regular.</li>
        <li>Assistência farmacêutica insuficiente em relação à legislação vigente.</li>
      </ul>

      <h2>Defesa, multas e penalidades</h2>
      <p>
        O estabelecimento autuado pode apresentar defesa escrita no prazo legal. Em caso de infração confirmada, podem ser aplicadas multas previstas na Lei 3.820/60 e penalidades éticas cabíveis, conforme o rito processual vigente.
      </p>
    </FiscalizacaoPageShell>
  );
}
