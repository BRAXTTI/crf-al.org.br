/** Placeholder neutro (retângulo azul-claro da paleta, sem texto) para imagens ausentes ou que falharam. */
export const IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23E6F0F8'/%3E%3C/svg%3E";

/**
 * `onError` de `<img>`: troca a imagem quebrada pelo placeholder uma única vez.
 * O React escuta o erro direto no elemento (não via `onerror`), então a trava é o próprio `src`.
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.getAttribute('src') === IMAGE_PLACEHOLDER) return;
  img.removeAttribute('srcset');
  img.src = IMAGE_PLACEHOLDER;
}
