import { toSvg, toPng, toJpeg } from 'html-to-image';

type ImageFormat = 'svg' | 'png' | 'jpg';

export async function exportImage(element: HTMLElement, format: ImageFormat, filename?: string) {
  let dataUrl = '';

  const options = {
    quality: format === 'jpg' ? 0.95 : 1,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  };

  switch (format) {
    case 'svg':
      dataUrl = await toSvg(element, options);
      break;
    case 'png':
      dataUrl = await toPng(element, options);
      break;
    case 'jpg':
      dataUrl = await toJpeg(element, options);
      break;
  }

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename || `flowchart.${format}`;
  a.click();
}
