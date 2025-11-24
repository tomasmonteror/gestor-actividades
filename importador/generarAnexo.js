const PDFDocument = require("pdfkit");
const fs = require("fs");

function generarAnexo({
  titulo,
  lugar,
  grupos,
  profesorAcompanante,
  fecha,
  horaInicio,
  horaFin,
  coste,
  nombreCoordinador,
  salida
}) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(fs.createWriteStream(salida));

  // Fecha actual
  const fechaHoy = new Date();
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const fechaActual = `${fechaHoy.getDate()} de ${meses[fechaHoy.getMonth()]} de ${fechaHoy.getFullYear()}`;

  // -----------------------------------------------------------
  // ENCABEZADO
  // -----------------------------------------------------------

  // Texto IES "Augustóbriga"
  doc.font("Helvetica-Bold").fontSize(16);
  doc.text('IES "Augustóbriga"', 50, 40);

  // Imagen esquina superior derecha
  try {
    doc.image("./img/junta.png", 400, 20, { width: 150 });
  } catch (err) {
    console.log("No se pudo cargar la imagen adjunta");
  }

  doc.moveDown(2);

  // -----------------------------------------------------------
  // CUERPO PRINCIPAL
  // -----------------------------------------------------------
  doc.fontSize(13).font("Helvetica-Bold").text("ANEXO I", { align: "center" });
  doc.moveDown(1.2);

  doc.font("Helvetica").fontSize(11);
  doc.text("IES AUGUSTÓBRIGA");
  doc.text("C/Antonio Concha, 71");
  doc.text("10300 NAVALMORAL DE LA MATA (Cáceres)");
  doc.text("Telf. 927 01 68 90 – Fax. 927 01 68 92");
  doc.text("E-mail: ies.augustobriga@edu.juntaextremadura.net");

  doc.moveDown(1.5);

  doc.fontSize(13).font("Helvetica-Bold")
    .text("PROPUESTA DE ACTIVIDAD EXTRAESCOLAR O COMPLEMENTARIA", { align: "center" });
  doc.fontSize(13)
    .text("Curso 2025 - 2026", { align: "center" });

  doc.moveDown(1.2);
  doc.font("Helvetica").fontSize(11);
  doc.text(`- Coordinador de la actividad: ${nombreCoordinador || ""}`);
  doc.moveDown(1);
  doc.text(`- Denominación de la actividad: ${titulo}`);
  doc.moveDown(1);
  doc.text("- Objetivos de la actividad:");
  doc.moveDown(1);
  doc.text(`- Lugar de celebración: ${lugar}`);
  doc.moveDown(1);
  doc.text("- Conocimiento del lugar, características o itinerarios:");
  doc.moveDown(1);
  doc.text("- Alumnos implicados: ", { continued: true });
  doc.font("Helvetica-Bold").text("Se adjunta el listado.");
  doc.moveDown(1);
  doc.font("Helvetica").fontSize(11);
  doc.text(`- Cursos implicados: ${grupos}`);
  doc.moveDown(1);
  doc.text(`- Profesores acompañantes: ${profesorAcompanante}`);
  doc.moveDown(1);
  doc.text(`- Día/s de celebración de la actividad: ${fecha}`);
  doc.text(`- Coste de la actividad: ${coste} €`);
doc.moveDown(1);
  doc.text(`- Horario: ${horaInicio} - ${horaFin}`);
  doc.text("- Observaciones:");
  doc.moveDown(1);
  doc.text("- Relación alumnos con circunstancias especiales:");
  doc.moveDown(1);
  doc.text("- Transportes:");
  doc.moveDown(1.2);

  // Fecha inferior
  doc.text(`En Navalmoral de la Mata, ${fechaActual}`);
  doc.moveDown(2);

  // Firmas
  doc.text(`Vº. Bº.: Marta Víctor Vega                                   Fdo.: ____________________________`);
  doc.text("            Directora                                                           Coordinador/a de la actividad");

  doc.moveDown(2.5);

  // Inspectora
  doc.text(`DÑA. LAURA DEL CASTILLO BLANCO – INSPECTORA DE EDUCACIÓN`, { align: "center" });
  doc.font("Helvetica")
     .text("DELEGACIÓN PROVINCIAL DE EDUCACIÓN - CÁCERES", { align: "center" });

  doc.end();
  console.log("ANEXO I generado:", salida);
}

module.exports = generarAnexo;
