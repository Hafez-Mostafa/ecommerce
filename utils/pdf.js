import { createWriteStream } from "fs";
import PDFDocument from "pdfkit";

import path from "path";


// source:  https://github.com/PSPDFKit-labs/pdfkit-invoice/blob/master/createInvoice.js

 export async function createInvoice(invoice, path) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
  doc.pipe(createWriteStream(path));
}

export async function generateHeader(doc) {
  doc
      .image(`${path.resolve('Nagarro.jpg')}`, 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text("Nagarro ES.", 110, 57)
      .fontSize(10)
      .text("Nagarro ES.", 200, 50, { align: "right" })
      .text("Campusplatz 2·", 200, 65, { align: "right" })
      .text("NRW, Leverkusen, 51379", 200, 80, { align: "right" })
      .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  // if (!(invoice.date instanceof Date)) {
  //   throw new Error("invoice.date is not a valid Date object");
  // }

  doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
      .fontSize(10)
      .text("Invoice Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(invoice.invoice_nr, 150, customerInformationTop)
      .font("Helvetica")
      .text("Invoice Date:", 50, customerInformationTop + 15)
      .text(invoice.date, 150, customerInformationTop + 15)
      .text("Balance Due:", 50, customerInformationTop + 30)
      .text(
          formatCurrency(invoice.paid ),
          150,
          customerInformationTop + 30
      )
      .font("Helvetica-Bold")
      .text(invoice.shipping.name, 300, customerInformationTop)
      .font("Helvetica")
      .text(invoice.shipping.address, 300, customerInformationTop + 15)
      .text(
          invoice.shipping.city + ", " + invoice.shipping.state + ", " + invoice.shipping.country,
          300, customerInformationTop + 30
      )
      .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
      doc,
      invoiceTableTop,
      "Item",
      "Unit Cost",
      "Quantity",
      "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
          doc,
          position,
          item.title,
          formatCurrency(item.price *100),
          item.quantity,
          formatCurrency(item.finalPrice*100)
      );

      generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Subtotal",
      "",
      formatCurrency(invoice.subtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
      doc,
      paidToDatePosition,
      "",
      "",
      "Paid To Date",
      "",
      formatCurrency(invoice.paid)
  );

  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
      doc,
      duePosition,
      "",
      "",
      "CopounPercent",
      "",
     `${invoice.coupon}%`
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
      .fontSize(10)
      .text(
          "Payment is due within 15 days. Thank you for your business.",
          50,
          780,
          { align: "center", width: 500 }
      );
}

function generateTableRow(doc, y, item, description, unitCost, quantity, lineTotal) {
  doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 150, y)
      .text(unitCost, 280, y, { width: 90, align: "right" })
      .text(quantity, 370, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents/100).toFixed(2);
}
