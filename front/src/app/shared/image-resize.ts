/**
 * Lê um File de imagem, faz crop quadrado central, redimensiona e exporta como data URL JPEG.
 * Roda 100% no browser via canvas — não envia nada pra rede.
 *
 * @param file Arquivo escolhido pelo input
 * @param size Lado do quadrado final (px). Default 256.
 * @param quality Qualidade JPEG entre 0 e 1. Default 0.85.
 */
export async function resizeImageToDataUrl(
  file: File,
  size = 256,
  quality = 0.85,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo escolhido não é uma imagem.');
  }
  if (file.type === 'image/svg+xml') {
    throw new Error('SVG não é suportado. Use PNG, JPG ou WebP.');
  }

  const dataUrlOriginal = await lerComoDataUrl(file);
  const img = await carregarImagem(dataUrlOriginal);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não consegui criar o canvas.');

  // Crop quadrado central
  const lado = Math.min(img.width, img.height);
  const sx = (img.width - lado) / 2;
  const sy = (img.height - lado) / 2;

  ctx.drawImage(img, sx, sy, lado, lado, 0, 0, size, size);

  return canvas.toDataURL('image/jpeg', quality);
}

function lerComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Não consegui ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Imagem inválida ou corrompida.'));
    img.src = src;
  });
}
