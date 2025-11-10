const { google } = require("googleapis");
const admin = require("firebase-admin");

// Inicializa Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-service-account.json")),
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
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // Cambia por tu ID de hoja y rango
  const spreadsheetId = "1ZqlU_tDeHa5btkSfeH-Xhz-7m9Xjva6KH9lWA6C-Uuc";
  const range = "Actividades25-26!A2:H"; // columna A a H, desde fila 2

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
    const rowPadded = Array(8).fill("").map((_, i) => row[i] || "");
    const [
      fecha,
      horaInicio,
      horaFin,
      titulo,
      lugar,
      departamento,
      grupos,
      profesorAcompanante
    ] = rowPadded;

    const inicioIso = combineDateAndTime(convFecha(fecha), convHora(horaInicio));
    const finIso = combineDateAndTime(convFecha(fecha), convHora(horaFin));

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
      await db.collection("actividades").add({
        titulo,
        descripcion: "",
        nombreGrupo: grupos,
        profesorAcompanante,
        nombreLugar: lugar,
        inicio_iso: inicioIso,
        fin_iso: finIso,
        departamento,
        estado: "visada",
        teacherId: "importado-script"
      });
      importedCount++;
      console.log("Importada:", titulo, inicioIso, lugar);
    } catch (e) {
      console.error("Error importando:", titulo, e);
    }
  }
  console.log(
    `Importación terminada. Actividades importadas: ${importedCount}, Actividades duplicadas y no añadidas: ${duplicateCount}`
  );
}

importarDeHoja();
