import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoAsset from '../assets/Logo_Rei_Do_Cabecote.jpg';

const paymentLabels = {
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  PIX: 'Pix',
  BOLETO: 'Boleto',
};

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'Não informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não informada';
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const displayValue = (value) => (value == null || String(value).trim() === '' ? 'Não informado' : String(value));
const brandColors = {
  charcoal: [23, 26, 34],
  orange: [255, 152, 0],
  ink: [43, 49, 61],
  muted: [104, 112, 126],
  line: [225, 228, 232],
  soft: [246, 247, 249],
  softOrange: [255, 247, 232],
  white: [255, 255, 255],
};

const loadLogoData = async () => {
  const response = await fetch(logoAsset);
  if (!response.ok) throw new Error('Não foi possível carregar a identidade visual do orçamento.');
  const blob = await response.blob();
  const image = new FileReader();
  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image.result);
    image.onerror = () => reject(new Error('Não foi possível preparar a imagem do orçamento.'));
    image.readAsDataURL(blob);
  });
};

const addTable = (doc, options) => autoTable(doc, {
  theme: 'grid',
  margin: { left: 16, right: 16 },
  styles: {
    font: 'helvetica',
    fontSize: 9,
    cellPadding: 3,
    textColor: brandColors.ink,
    lineColor: brandColors.line,
    lineWidth: 0.2,
    overflow: 'linebreak',
    valign: 'middle',
  },
  headStyles: {
    fillColor: brandColors.soft,
    textColor: brandColors.charcoal,
    fontStyle: 'bold',
    fontSize: 8,
  },
  ...options,
});

export const generateServiceQuotePdf = async (quote) => {
  if (!quote?.id) throw new Error('O orçamento não possui um identificador de serviço.');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const pieces = (quote.pecas || []).filter(Boolean);
  const partsTotal = pieces.reduce((sum, part) => sum + (Number(part.preco) || 0), 0);
  const laborTotal = Number(quote.maoDeObra) || 0;
  const total = partsTotal + laborTotal;
  const payment = paymentLabels[quote.tipoPagamento] || displayValue(quote.tipoPagamento);
  const logoData = await loadLogoData();

  doc.setProperties({
    title: `Orçamento de serviço ${quote.id}`,
    subject: quote.descricao || 'Orçamento de serviço',
    author: 'Rei do Cabeçote',
  });

  doc.setFillColor(...brandColors.white);
  doc.rect(0, 0, pageWidth, 37, 'F');
  doc.setFillColor(...brandColors.orange);
  doc.rect(0, 35.5, pageWidth, 1.5, 'F');
  doc.addImage(logoData, 'JPEG', margin, 6, 24, 24);
  doc.setTextColor(...brandColors.charcoal);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('REI DO CABEÇOTE', margin + 30, 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...brandColors.muted);
  doc.text('Retífica e serviços automotivos', margin + 30, 24);
  doc.setFontSize(8);
  doc.text(`Orçamento nº ${quote.id}`, pageWidth - margin, 17, { align: 'right' });
  doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, 24, { align: 'right' });

  doc.setTextColor(...brandColors.charcoal);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('ORÇAMENTO DE SERVIÇO', margin, 49);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...brandColors.muted);
  doc.text(`Status: ${displayValue(quote.status)}`, pageWidth - margin, 49, { align: 'right' });

  addTable(doc, {
    startY: 55,
    head: [['CLIENTE', 'VEÍCULO']],
    body: [[
      `Nome: ${displayValue(quote.clienteNome)}\nCPF: ${displayValue(quote.clienteCpf)}\nTelefone: ${displayValue(quote.clienteTelefone)}`,
      `Modelo: ${displayValue(quote.veiculoModelo)}\nMarca: ${displayValue(quote.veiculoMontadora)}\nPlaca: ${displayValue(quote.veiculoPlaca)}\nAno: ${displayValue(quote.veiculoAnoModelo)}`,
    ]],
    columnStyles: {
      0: { cellWidth: (pageWidth - margin * 2) / 2 },
      1: { cellWidth: (pageWidth - margin * 2) / 2 },
    },
  });

  addTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [['SERVIÇO', 'DESCRIÇÃO']],
    body: [[displayValue(quote.tipo), displayValue(quote.descricao)]],
    columnStyles: {
      0: { cellWidth: 48, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  const pieceRows = pieces.length
    ? pieces.map((part) => [
      displayValue(part.nome),
      displayValue(part.descricao),
      formatCurrency(part.preco),
    ])
    : [['Nenhuma peça informada', '—', formatCurrency(0)]];

  addTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [['PEÇA', 'DESCRIÇÃO / APLICAÇÃO', 'VALOR']],
    body: pieceRows,
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 31, halign: 'right' },
    },
  });

  addTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    body: [
      ['Subtotal das peças', formatCurrency(partsTotal)],
      ['Mão de obra', formatCurrency(laborTotal)],
      [{ content: 'TOTAL DO ORÇAMENTO', styles: { fontStyle: 'bold', textColor: brandColors.charcoal, fillColor: brandColors.softOrange } },
        { content: formatCurrency(total), styles: { fontStyle: 'bold', halign: 'right', textColor: brandColors.charcoal, fillColor: brandColors.softOrange } }],
    ],
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 42, halign: 'right' },
    },
    tableWidth: 105,
    margin: { left: pageWidth - margin - 105, right: margin },
  });

  addTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [['CONDIÇÕES E PRAZOS']],
    body: [[
      `Abertura da ordem: ${formatDate(quote.dataCriacao)}\nPagamento: ${payment}\nData prevista: ${formatDate(quote.dataPrevista)}\nGarantia até: ${formatDate(quote.garantia)}`,
    ]],
  });

  addTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [['OBSERVAÇÕES']],
    body: [[displayValue(quote.observacoes)]],
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setDrawColor(...brandColors.line);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...brandColors.muted);
    doc.text('Rei do Cabeçote - Orçamento de serviço', margin, footerY);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
  }

  doc.save(`orcamento_${quote.id}.pdf`);
};
