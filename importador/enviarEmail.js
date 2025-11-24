const nodemailer = require("nodemailer");
const fs = require("fs");

async function enviarEmailConPDF({ emailOrganizador, pdfPath }) {
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

  const mailOptions = {
    from: '"IES Augustóbriga" <tmonteror04@educarex.es>',
    to: emailOrganizador,
    subject: "IES Augustóbriga - Organización de nueva actividad.",
    text: `Buenos días.

Se ha dado de alta una nueva actividad complementaria o extraescolar. 
Se adjunta la autorización para imprimir y repartir entre el alumnado para su firma y posterior gestión administrativa.

Un saludo.`,
    attachments: [
      {
        filename: "autorizacion.pdf",
        path: pdfPath,
        contentType: "application/pdf"
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email enviado correctamente a:", emailOrganizador);
  } catch (err) {
    console.error("❌ Error enviando email:", err);
  }
}

module.exports = enviarEmailConPDF;