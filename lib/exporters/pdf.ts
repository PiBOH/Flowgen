import jsPDF from 'jspdf';

export async function exportToPdf(element: HTMLElement, filename = 'flowchart.pdf') {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(element, { pixelRatio: 2, backgroundColor: '#ffffff' });

  const pdf = new jsPDF('l', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(dataUrl);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
