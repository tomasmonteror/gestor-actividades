const { google } = require("googleapis");
const admin = require("firebase-admin");

//const generarAutorizacionPDF = require("./generarAutorizacion");
//const generarAnexoPDF = require("./generarAnexo");
//const enviarEmailConPDF = require("./enviarEmail");

const enviarEmail = require("./enviarEmail");

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("/opt/importador-actividades/firebase-service-account.json")),
});
const db = admin.firestore();

function combineDateAndTime(date, time) {
  if (!date || !time) return "";
  return new Date(`${date}T${time}`).toISOString();
}

function convFecha(fechaExcel) {
  if (!fechaExcel) return "";
  const [d, m, y] = fechaExcel.split("/");
  return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function convHora(horaExcel) {
  if (!horaExcel) return "";
  const [h, m] = horaExcel.split(":");
  return `${h.padStart(2, "0")}:${m}`;
}

async function importarDeHoja() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "/opt/importador-actividades/credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // Cambia por tu ID de hoja y rango
  const spreadsheetId = "1ZGF0gM6zAZmlKY52jdMZeCDnyZ0aBEBbVxmJ4WCU7vc";
  const range = "Actividades25-26!A2:K"; // columna A a K, desde fila 2

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values;
  if (!rows || !rows.length) {
    console.log("No hay datos a importar.");
    return;
  }

  let importedCount = 0;
  let duplicateCount = 0;

  for (const row of rows) {
    const rowPadded = Array(11).fill("").map((_, i) => row[i] || "");
    const [
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      titulo,
      lugar,
      departamento,
      nombreOrganizador,
      emailOrganizador,
      grupos,
      profesorAcompanante
    ] = rowPadded;

    const inicioIso = combineDateAndTime(convFecha(fechaInicio), convHora(horaInicio));
    const finIso = combineDateAndTime(convFecha(fechaFin), convHora(horaFin));

    const existingQuery = db.collection("actividades")
      .where("inicio_iso", "==", inicioIso)
      .where("titulo", "==", titulo)
      .where("nombreLugar", "==", lugar)
      .limit(1);

    const existingSnap = await existingQuery.get();

    if (!existingSnap.empty) {
      duplicateCount++;
      console.log("Duplicada, NO se importa:", titulo, inicioIso, lugar);
      continue;
    }

    try {
      const newDoc = await db.collection("actividades").add({
        titulo,
        descripcion: "",
        nombreGrupo: grupos,
        profesorAcompanante,
        nombreLugar: lugar,
        inicio_iso: inicioIso,
        fin_iso: finIso,
        departamento,
        nombreOrganizador,
        emailOrganizador,
        tipo: "complementaria",
        teacherId: "importado-script"
      });
      importedCount++;
      console.log("Importada:", titulo, inicioIso, lugar);

      // Procesar envío email
      await procesarNuevaActividad({ 
        id: newDoc.id,
        titulo,
        departamento,
        nombreGrupo: grupos,
        nombreLugar: lugar,
        inicio_iso: inicioIso,
        fin_iso: finIso,
        profesorAcompanante: profesorAcompanante,
        nombreOrganizador,
        emailOrganizador
      });
    } catch (e) {
      console.error("Error importando:", titulo, e);
    }
  }
  console.log(
    `Importación terminada. Actividades importadas: ${importedCount}, Actividades duplicadas y no añadidas: ${duplicateCount}`
  );
}

async function procesarNuevaActividad(actividad) {
  
  // Ruta donde guardar los PDF
  /*
  const autorizacionPdfFile = `/opt/importador-actividades/autorizaciones/${actividad.titulo}-autorizacion.pdf`;
  const anexoPdfFile = `/opt/importador-actividades/anexosI/${actividad.titulo}-anexoI.pdf`;
  
  // Generar autorización en PDF
  generarAutorizacionPDF({
    titulo: actividad.titulo,
    departamento: actividad.departamento,
    lugar: actividad.nombreLugar,
    fecha: new Date(actividad.inicio_iso).toLocaleDateString("es-ES"),
    horaInicio: new Date(actividad.inicio_iso).toLocaleTimeString("es-ES", {
      hour: "2-digit", minute: "2-digit"
    }),
    horaFin: new Date(actividad.fin_iso).toLocaleTimeString("es-ES", {
      hour: "2-digit", minute: "2-digit"
    }),
    coste: actividad.coste || "0",
    salida: autorizacionPdfFile
  });
  */

  // Generar anexo en PDF
  /*generarAnexoPDF({
    titulo: actividad.titulo,
    departamento: actividad.departamento,
    lugar: actividad.nombreLugar,
    grupos: actividad.nombreGrupo,
    fecha: new Date(actividad.inicio_iso).toLocaleDateString("es-ES"),
    horaInicio: new Date(actividad.inicio_iso).toLocaleTimeString("es-ES", {
      hour: "2-digit", minute: "2-digit"
    }),
    horaFin: new Date(actividad.fin_iso).toLocaleTimeString("es-ES", {
      hour: "2-digit", minute: "2-digit"
    }),
    profesorAcompanante: actividad.profesorAcompanante,
    coste: actividad.coste || "0",
    salida: anexoPdfFile
  });
  

  // Enviar email al organizador
  await enviarEmailConPDF({
    emailOrganizador: actividad.emailOrganizador, pdfPaths: [autorizacionPdfFile, anexoPdfFile]
  });
  */

   // Enviar email al organizador
  await enviarEmail({
    emailOrganizador: actividad.emailOrganizador,
    titulo: actividad.titulo
  });
  
}

importarDeHoja();
