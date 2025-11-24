const nodemailer = require("nodemailer");
const fs = require("fs");

async function enviarEmailConPDF({ emailOrganizador, pdfPaths }) {
  if (!emailOrganizador) {
    console.log("❌ No se envía email: emailOrganizador vacío.");
    return;
  }

  // Configura tu servidor SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // cambia si usas otro SMTP
    port: 465,
    secure: true,
    auth: {
      user: "tmonteror04@educarex.es",
      pass: "bkni kggq czrn ympn" // OJO: contraseña de aplicación
    }
  });

  // pdfPaths DEBE SER UN ARRAY DE STRINGS
  const attachments = pdfPaths.map(path => ({
    filename: path.split("/").pop(),  // nombre del archivo
    path: path                        // ruta completa
  }));

  const mailOptions = {
    from: '"IES Augustóbriga" <tmonteror04@educarex.es>',
    to: emailOrganizador,
    subject: "IES Augustóbriga - Organización de nueva actividad.",
    text: `    Buenos días.

    Se ha dado de alta una nueva actividad extraescolar o complementaria.
    Para facilitar la gestión administrativa, se adjunta la autorización lista para imprimir y repartir entre el alumnado. También se adjunta el Anexo I que se debe terminar de cumplimentar.

    Un saludo.`,
    attachments
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email enviado correctamente a:", emailOrganizador);
  } catch (err) {
    console.error("❌ Error enviando email:", err);
  }
}

module.exports = enviarEmailConPDF;