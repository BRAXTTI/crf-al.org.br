import re
import xml.etree.ElementTree as ET

XML_FILE = 'crf-al.WordPress.2026-08-31.xml'

NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'dc': 'http://purl.org/dc/elements/1.1/',
}


def contar_palavras(texto):
    """Contar palavras separadas por espaços."""
    palavras = [p for p in re.split(r'\s+', texto.strip()) if p]
    return len(palavras)


def main():
    tree = ET.parse(XML_FILE)
    root = tree.getroot()

    noticias = []
    for item in root.iter('item'):
        tipo = item.find('wp:post_type', NS)
        status = item.find('wp:status', NS)
        titulo = item.find('title')
        if tipo is None or status is None or titulo is None:
            continue
        if tipo.text != 'post' or status.text != 'publish':
            continue
        t = titulo.text or ''
        noticias.append((t, contar_palavras(t)))

    noticias.sort(key=lambda x: x[1], reverse=True)

    print(f'Total de notícias publicadas: {len(noticias)}\n')
    print('Top 10 títulos com mais palavras:')
    for t, n in noticias[:10]:
        print(f'  {n:3d} palavras | {t}')


if __name__ == '__main__':
    main()
