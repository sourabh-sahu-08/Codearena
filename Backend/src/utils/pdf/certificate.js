import PDFDocument from "pdfkit";

export function generateCertificateBuffer({ name, hackathonTitle, award }) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];

  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  doc.fontSize(28).text("Certificate of Achievement", { align: "center" });
  doc.moveDown(1.5);
  doc.fontSize(18).text("This is to certify that", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(26).text(name, { align: "center" });
  doc.moveDown(0.7);
  doc.fontSize(16).text(`has received "${award}" in`, { align: "center" });
  doc.moveDown(0.4);
  doc.fontSize(20).text(hackathonTitle, { align: "center" });
  doc.moveDown(2);
  doc.fontSize(12).text(`Generated on: ${new Date().toDateString()}`, { align: "center" });

  doc.end();
  return done;
}