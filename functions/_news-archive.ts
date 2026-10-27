// Índice de URLs históricas; o inventário publicado é obtido do WP novo em _news.ts.
import { NEWS_MAP } from './_news-map';
export const NEWS_ARCHIVE = NEWS_MAP.filter(row => !row.blocked);
