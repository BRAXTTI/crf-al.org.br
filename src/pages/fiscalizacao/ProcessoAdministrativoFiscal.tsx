import FiscalizacaoPageShell from './FiscalizacaoPageShell';

export default function ProcessoAdministrativoFiscal() {
  return (
    <FiscalizacaoPageShell title="Processo Administrativo Fiscal">
      <p>
        O Processo Administrativo Fiscal é instaurado a partir da lavratura do auto de infração para estabelecimento que infringir determinações da Lei 3.820/60, observando o rito da Resolução CFF nº 566/12.
      </p>

      <h2>Etapas iniciais</h2>
      <ol>
        <li>Lavratura do auto de infração pelo farmacêutico fiscal.</li>
        <li>Entrega do termo de inspeção e auto de infração no momento da fiscalização.</li>
        <li>Abertura de prazo para defesa escrita pelo estabelecimento.</li>
      </ol>

      <h2>Prazo de defesa</h2>
      <p>
        A defesa escrita deve ser encaminhada ao CRF-AL em até 5 dias corridos, contados a partir do primeiro dia útil seguinte à inspeção.
      </p>
      <ul>
        <li>Defesa intempestiva não é considerada para fins de julgamento.</li>
        <li>Na ausência de defesa válida, o processo segue o rito regular, podendo resultar em revelia.</li>
      </ul>

      <h2>Julgamento e recurso</h2>
      <p>
        Cabe ao Plenário do CRF-AL a análise das defesas e o julgamento dos processos, com arquivamento ou aplicação de multa de 1 a 3 salários mínimos regionais, em dobro em caso de reincidência, sem prejuízo de recurso ao CFF nos termos normativos.
      </p>
    </FiscalizacaoPageShell>
  );
}
