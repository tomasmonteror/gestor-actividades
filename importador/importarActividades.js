const { google } = require("googleapis");
const admin = require("firebase-admin");

const enviarEmail = require("./enviarEmail");

// Firebase
admin.initializeApp({
  credential: admin.credential.cert(
    require("/opt/importador-actividades/firebase-service-account.json")
  ),
});
const db = admin.firestore();

/* =========================
   Utilidades
========================= */

function combineDateAndTime(date, time) {
  if (!date || !time) return "";
  return new Date(`${date}T${time}`).toISOString();
}

function convFecha(fechaExcel) {
  if (!fechaExcel) return "";
  const [d, m, y] = fechaExcel.split("/");
  return `${y.padStart(4, "20")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function convHora(horaExcel) {
  if (!horaExcel) return "";
  const [h, m] = horaExcel.split(":");
  return `${h.padStart(2, "0")}:${m}`;
}

function tieneCamposObligatorios(row) {
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
  ] = row;

  return [
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
  ].every(v => typeof v === "string" && v.trim() !== "");
}

/* =========================
   Importación
========================= */

async function importarDeHoja() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "/opt/importador-actividades/credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "1ZGF0gM6zAZmlKY52jdMZeCDnyZ0aBEBbVxmJ4WCU7vc";
  const range = "Actividades25-26!A2:K";

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
  let skippedCount = 0;

  for (const row of rows) {
    const rowPadded = Array(11).fill("").map((_, i) => row[i] || "");

    // Validación obligatoria
    if (!tieneCamposObligatorios(rowPadded)) {
      skippedCount++;
      console.log("❌ Actividad incompleta. No se importa:", rowPadded[4]);
      continue;
    }

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
      profesorAcompanante,
    ] = rowPadded;

    if (!emailOrganizador.includes("@")) {
      skippedCount++;
      console.log("❌ Email inválido:", emailOrganizador);
      continue;
    }

    const inicioIso = combineDateAndTime(
      convFecha(fechaInicio),
      convHora(horaInicio)
    );
    const finIso = combineDateAndTime(
      convFecha(fechaFin),
      convHora(horaFin)
    );

    if (!inicioIso || !finIso) {
      skippedCount++;
      console.log("❌ Fechas/horas inválidas:", titulo);
      continue;
    }

    // Duplicados
    const existingSnap = await db
      .collection("actividades")
      .where("inicio_iso", "==", inicioIso)
      .where("titulo", "==", titulo)
      .where("nombreLugar", "==", lugar)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      duplicateCount++;
      console.log("⏩ Duplicada, no se importa:", titulo);
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
        teacherId: "importado-script",
      });

      importedCount++;
      console.log("✅ Importada:", titulo);

      // Envío de email SOLO si todo está OK
      await enviarEmail({
        emailOrganizador,
        titulo,
      });
    } catch (e) {
      console.error("🔥 Error importando:", titulo, e);
    }
  }

  console.log("===== RESUMEN =====");
  console.log("Importadas:", importedCount);
  console.log("Duplicadas:", duplicateCount);
  console.log("Saltadas por error:", skippedCount);
}

importarDeHoja();
