import FiscalizacaoPageShell from './FiscalizacaoPageShell';

export default function AfastamentoProvisorio() {
  return (
    <FiscalizacaoPageShell title="Afastamento Provisório">
      <p>
        As comunicações de afastamento provisório do farmacêutico podem ser protocoladas na sede ou seccional do CRF-AL, ou encaminhadas para fiscalizacao@crf-al.org.br mediante requerimento próprio.
      </p>

      <h2>Como comunicar</h2>
      <ul>
        <li>Utilizar o requerimento de afastamento provisório disponível em Requerimentos.</li>
        <li>Protocolar presencialmente na sede/seccional ou enviar por e-mail oficial da fiscalização.</li>
        <li>Manter cópia ou original do protocolo junto à Certidão de Regularidade Técnica do estabelecimento.</li>
      </ul>

      <h2>Apresentação em inspeção</h2>
      <p>
        A comprovação do protocolo deve ser apresentada ao farmacêutico fiscal no momento da inspeção, quando solicitada.
      </p>

      <h2>Justificativa posterior de ausência</h2>
      <p>
        Havendo autuação e impossibilidade de protocolo presencial, o estabelecimento pode encaminhar requerimento e documentos comprobatórios por e-mail.
      </p>
      <ul>
        <li>Os documentos originais devem ser apresentados na sede/seccional do CRF-AL.</li>
        <li>Prazo: 10 dias, contados do primeiro dia útil após a inspeção.</li>
      </ul>
    </FiscalizacaoPageShell>
  );
}
