import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QuotationData } from "@/types";
import { formatCurrency, numberToWords, toArabicNumerals } from "@/lib/utils";
import { defaultCompanySettings } from "@/types";

async function loadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function buildQuotationHTML(data: QuotationData, company: typeof defaultCompanySettings, headerImage: string): string {
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td class="cell-center">${item.slNo}</td>
      <td class="cell-left">${item.description.replace(/\n/g, "<br>")}</td>
      <td class="cell-center">${item.quantity} ${item.unit}</td>
      <td class="cell-center">${item.rate > 0 ? formatCurrency(item.rate, data.currency) : "L/S"}</td>
      <td class="cell-right">${formatCurrency(item.amount, data.currency)}</td>
    </tr>
  `).join("");

  const termsHtml = data.paymentTerms
    .split("\n")
    .filter((t) => t.trim())
    .map((t) => `<li>${t.trim()}</li>`)
    .join("");

  const headerHtml = headerImage
    ? `<img class="header-img" src="${headerImage}" alt="Company Header" />`
    : `<div class="header-fallback">
        <div class="header-row">
          <div class="header-left">
            <p><strong>CR NO:</strong> ${company.crNumber}</p>
            <p><strong>PO BOX:</strong> ${company.poBox}</p>
            <p><strong>Postal Code:</strong> ${company.postalCode}</p>
            <p>${company.country}</p>
          </div>
          <div class="header-center">
            <div class="logo-shape"><span class="logo-text">${company.logoText}</span></div>
            <div class="company-arabic">${company.arabicName}</div>
            <div class="company-english">${company.name}</div>
          </div>
          <div class="header-right">
            <p><strong>س.ت.رق:</strong> ${toArabicNumerals(company.crNumber)}</p>
            <p><strong>ص.ب:</strong> ${toArabicNumerals(company.poBox)}</p>
            <p><strong>الرمز البريدي:</strong> ${toArabicNumerals(company.postalCode)}</p>
            <p>سلطنة عمان</p>
          </div>
        </div>
        <div class="red-separator"></div>
      </div>`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm 12mm 12mm 12mm;
    font-family: "Segoe UI", Arial, "Noto Sans Arabic", sans-serif;
    font-size: 10pt;
    line-height: 1.4;
    color: #1a1a1a;
    background: white;
  }
  .header-img {
    width: 100%;
    max-width: 186mm;
    display: block;
    margin: 0 auto 4mm auto;
    object-fit: contain;
  }

  .header-fallback .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2mm;
  }
  .header-fallback .header-left {
    width: 28%;
    font-size: 9pt;
    line-height: 1.6;
    color: #000;
    padding-top: 2mm;
  }
  .header-fallback .header-left p { margin: 0; }
  .header-fallback .header-center {
    width: 44%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .header-fallback .logo-shape {
    width: 18mm;
    height: 18mm;
    background: #C8102E;
    transform: rotate(45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 3mm;
    position: relative;
  }
  .header-fallback .logo-shape::before {
    content: "";
    position: absolute;
    top: 3mm; left: 3mm; right: 3mm; bottom: 3mm;
    border: 1.5px solid white;
  }
  .header-fallback .logo-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    color: white;
    font-weight: bold;
    font-size: 10pt;
    letter-spacing: 1px;
    white-space: nowrap;
  }
  .header-fallback .company-arabic {
    font-size: 10pt;
    color: #C8102E;
    font-weight: bold;
    margin-bottom: 1mm;
    direction: rtl;
  }
  .header-fallback .company-english {
    font-size: 9pt;
    color: #C8102E;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .header-fallback .header-right {
    width: 28%;
    font-size: 9pt;
    line-height: 1.6;
    color: #000;
    text-align: right;
    direction: rtl;
    padding-top: 2mm;
  }
  .header-fallback .header-right p { margin: 0; }
  .header-fallback .red-separator {
    border: none;
    border-top: 2.5px solid #C8102E;
    margin: 2mm 0 6mm;
  }

  .date { text-align: right; font-size: 10pt; color: #444; margin-bottom: 6mm; }

  .to-section { font-size: 11pt; margin-bottom: 4mm; }
  .to-section p { line-height: 1.5; }

  .title { text-align: center; font-size: 16pt; font-weight: bold; margin: 3mm 0 4mm; text-decoration: underline; text-underline-offset: 3px; }

  .subject { font-size: 10pt; font-weight: bold; margin-bottom: 4mm; }
  .subject u { font-weight: bold; text-decoration: underline; text-underline-offset: 2px; }

  .intro { font-size: 10pt; color: #333; margin-bottom: 4mm; }

  .scope-label { font-size: 10pt; font-weight: bold; text-decoration: underline; text-underline-offset: 2px; margin-bottom: 3mm; display: inline-block; }

  table.items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin-bottom: 4mm;
  }
  table.items-table th, table.items-table td {
    border: 0.5px solid #000;
    padding: 2.5mm 2mm;
  }
  table.items-table th {
    font-weight: bold;
    background: #f5f5f5;
    text-align: center;
  }
  .cell-center { text-align: center; }
  .cell-left { text-align: left; }
  .cell-right { text-align: right; }
  .total-row td { border-top: 1.5px solid #000; font-weight: bold; }
  .total-label { text-align: right; padding-right: 3mm; }

  .amount-words {
    text-align: center;
    font-weight: bold;
    font-size: 10pt;
    border: 0.5px solid #000;
    padding: 2mm 4mm;
    margin: 3mm auto 6mm;
    display: inline-block;
    width: 100%;
  }

  .section-title { font-size: 10pt; font-weight: bold; text-decoration: underline; text-underline-offset: 2px; margin-bottom: 2mm; display: inline-block; }
  .terms-list { list-style: disc; padding-left: 5mm; margin-bottom: 6mm; font-size: 10pt; }
  .terms-list li { margin-bottom: 1mm; }

  .bank-details { font-size: 10pt; margin-bottom: 6mm; }
  .bank-row { display: flex; gap: 8mm; margin-bottom: 1mm; }
  .bank-label { font-weight: bold; min-width: 22mm; }

  .signature { font-size: 10pt; margin-bottom: 6mm; }
  .signature-name { font-weight: bold; font-size: 11pt; margin-top: 8mm; }

  .footer {
    margin-top: auto;
    padding-top: 4mm;
  }
  .footer-separator {
    border: none;
    border-top: 1.5px solid #000;
    border-bottom: 3px solid #C8102E;
    height: 5px;
    margin-bottom: 2mm;
  }
  .footer-line {
    font-size: 7.5pt;
    color: #000;
    text-align: center;
    line-height: 1.6;
    margin-bottom: 1mm;
  }
  .footer-arabic {
    direction: rtl;
    font-size: 8pt;
  }

  .page { display: flex; flex-direction: column; min-height: 275mm; }
</style>
</head>
<body>
  <div class="page">
    ${headerHtml}

    <div class="date">Date: ${data.date}</div>

    <div class="to-section">
      <p>To</p>
      <p>M/s</p>
      <p>${data.companyName || data.clientName}</p>
      <p style="font-size:10pt;">${data.address}</p>
    </div>

    <div class="title">QUOTATION</div>

    <div class="subject">Sub: <u>${data.subject}</u></div>

    <div class="intro">
      We thank you for your invitation to quote for the subject work and pleased for submitting herewith our lowest quotation for the same as follows:
    </div>

    <div class="scope-label">Scope of work:</div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:10%">SL.</th>
          <th style="width:40%">Descriptions</th>
          <th style="width:15%">QTY</th>
          <th style="width:17%">Rate In ${data.currency}</th>
          <th style="width:18%">Amount in ${data.currency === "OMR" ? "Ro" : data.currency}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="total-row">
          <td colspan="3"></td>
          <td class="total-label">Total Amount</td>
          <td class="cell-right">${formatCurrency(data.totalAmount, data.currency)}</td>
        </tr>
      </tbody>
    </table>

    <div class="amount-words">${numberToWords(data.totalAmount, data.currency === "OMR" ? "Omani Rials" : data.currency)}</div>

    <div class="section-title">Payment terms:</div>
    <ul class="terms-list">
      ${termsHtml}
    </ul>

    <div class="bank-details">
      <div style="font-weight:bold; margin-bottom:2mm;">Bank Details -</div>
      <div class="bank-row"><span class="bank-label">Bank Name</span><span>: ${data.bankName}</span></div>
      <div class="bank-row"><span class="bank-label">AC NO</span><span>: ${data.accountNumber}</span></div>
      <div class="bank-row"><span class="bank-label">Name</span><span>: ${data.accountName}</span></div>
    </div>

    <div class="signature">
      <p>Yours Faithfully,</p>
      <p>For, ${company.name}</p>
      <p class="signature-name">${data.signatureName}</p>
      <p>GSM: ${data.contactNumber}</p>
    </div>

    <div class="footer">
      <div class="footer-separator"></div>
      <div class="footer-line footer-arabic">ست: ${toArabicNumerals(company.crNumber)} ، ص.ب: ${toArabicNumerals(company.poBox)} ، الرمز البريدي: ${toArabicNumerals(company.postalCode)} ، سلطنة عمان، هاتف: ${toArabicNumerals(company.phone.replace(/\D/g,""))}</div>
      <div class="footer-line">C.R.: ${company.crNumber}, P.O. Box: ${company.poBox}, Postal Code: ${company.postalCode}, Sultanate of Oman, Tel: ${company.phone.replace(/\D/g,"")}</div>
    </div>
  </div>
</body>
</html>
  `;
}

export async function generateQuotationPDF(data: QuotationData, company = defaultCompanySettings): Promise<jsPDF> {
  const headerImage = await loadImageAsBase64("/header.png");
  const html = buildQuotationHTML(data, company, headerImage);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "210mm";
  document.body.appendChild(container);

  const iframe = document.createElement("iframe");
  iframe.style.width = "210mm";
  iframe.style.height = "297mm";
  iframe.style.border = "none";
  container.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    iframe.srcdoc = html;
  });

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) throw new Error("Failed to load iframe");

  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 800));

  const canvas = await html2canvas(iframeDoc.body, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    width: 794,
    height: 1123,
    windowWidth: 794,
    windowHeight: 1123,
  });

  document.body.removeChild(container);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgData = canvas.toDataURL("image/png");
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  return doc;
}

export async function downloadQuotationPDF(data: QuotationData, company = defaultCompanySettings) {
  const doc = await generateQuotationPDF(data, company);
  doc.save(`${data.quotationNumber}.pdf`);
}
