const PDFDocument = require("pdfkit");
const fs = require("fs");

function generarAutorizacionPDF({
  departamento,
  lugar,
  fecha,        // → viene del otro script como DD/MM/YYYY
  horaInicio,   // → HH:MM
  horaFin,      // → HH:MM
  coste,
  salida
}) {
  const doc = new PDFDocument({ size: "A4", margin: 30 });
  doc.pipe(fs.createWriteStream(salida));

  // Fecha actual del sistema
  const fechaHoy = new Date();
  const fechaActual = `${fechaHoy.getDate()} de ${mesTexto(fechaHoy.getMonth())} de ${fechaHoy.getFullYear()}`;

  // ----------------------------------------------------------------------
  // GENERADOR DE UNA AUTORIZACIÓN (se imprimen dos usando esta función)
  // ----------------------------------------------------------------------
  function escribirAutorizacion(offsetY) {
    doc.save();
    doc.translate(0, offsetY);

    // Texto del margen izquierdo
    doc.save();
    
    // Inserta la imagen vertical en el margen izquierdo
    try {
    doc.image("vertical.png", 35, 68, { width: 75 });
    } catch (e) {
    console.log("No se pudo cargar vertical.png");
    }

    //doc.restore();

    // Cabecera
    try {
      doc.image("logo-centro.png", 30, 1, { width: 85 });
    } catch (e) {}

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("IES AUGUSTÓBRIGA", 150, 0);
    doc.font("Helvetica").fontSize(9);
    doc.text("C/ Antonio Concha, 71", 150, 14);
    doc.text("10300 Navalmoral de la Mata (Cáceres)", 150, 26);
    doc.text("Telf.- 927 016890", 150, 38);

    doc.moveDown(3);

    // Línea compacta superior
    doc.font("Helvetica").fontSize(10);
    doc.text(
      "Dña. ______________________________________________ con DNI ________________ como1________________ y " +
      "D._________________________________________________ con DNI__________________como1_________________________________" +
      "del alumno/a ___________________________________________del nivel académico____________.",
      { lineGap: 4 }
    );

    doc.moveDown(1);

    // AUTORIZO + texto con fecha y horas
    doc.font("Helvetica-Bold").text("AUTORIZO ", { continued: true });
    doc.font("Helvetica").text("que se desplace a: ", { continued: true });
    doc.font("Helvetica-Bold").text(`${lugar}`, { continued: true });
    doc.font("Helvetica").text(` con motivo de la actividad organizada por el departamento de ` +
      `${departamento} el día `, { continued: true });
    doc.font("Helvetica-Bold").text(`${fecha} desde las ${horaInicio} hasta las ${horaFin}.`
    );

    doc.moveDown(1);

    // Coste
    doc.font("Helvetica-Bold").text(`Coste de la actividad: ${coste} EUROS.`);
    doc.moveDown(0.8);

    // Párrafo de normas
    doc.font("Helvetica").text(
      "Asimismo, me comprometo a no hacer ningún tipo de reclamación a los profesores acompañantes " +
      "si se produce algún incumplimiento del horario y/o de las normas establecidas."
    );

    doc.moveDown(1.2);

    // Fecha actual
    doc.text(`Navalmoral de la Mata, a ${fechaActual}.`);

    doc.moveDown(2.2);

    // Firmas
    doc.font("Helvetica").text(
      "Fdo.__________________________            Fdo. _________________________"
    );

    doc.fontSize(8);
    doc.text(
      "           (madre o tutor legal)                                                         (padre o tutor legal)"
    );

    doc.moveDown(1);

    // Notas (tamaño reducido)
    doc.font("Helvetica-Oblique").fontSize(7);
    doc.text(
      "1 Las firmas de ambos progenitores o tutores legales son OBLIGATORIAS en actividades extraescolares de larga duración fuera de la jornada lectiva."
    );
    doc.text(
      "En caso de actividades de un día de duración, el progenitor/a o tutor legal que autoriza asume la responsabilidad general de la actividad."
    );

    doc.restore();
  }

  // Imprimir dos autorizaciones en el mismo folio
  escribirAutorizacion(20);      // primera
  escribirAutorizacion(420);    // segunda

  doc.end();
  console.log("PDF generado:", salida);
}


// Función auxiliar para pasar número de mes a texto
function mesTexto(numMes) {
  const meses = [
    "enero", "febrero", "marzo",
    "abril", "mayo", "junio",
    "julio", "agosto", "septiembre",
    "octubre", "noviembre", "diciembre"
  ];
  return meses[numMes];
}

module.exports = generarAutorizacionPDF;
