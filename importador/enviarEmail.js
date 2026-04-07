const nodemailer = require("nodemailer");
const fs = require("fs");

async function enviarEmail({ emailOrganizador, titulo }) {
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
      user: "MI_USUARIO@CORREO.es",
      pass: "bkni kggq czrn ympn" // OJO: contraseña de aplicación
    }
  });

  const mailOptions = {
    from: '"IES Augustóbriga" MI_USUARIO@CORREO.es>',
    to: emailOrganizador,
    cc: "ORGANIZADORA@CORREO.es",
    subject: "IES Augustóbriga - Publicación de nueva actividad.",
    text: `    Buenos días.

    Se ha dado de alta en el Gestor de actividades una nueva actividad extraescolar o complementaria con título ${titulo}. 
    A partir de ahora estará disponible, dentro de la red Educarex, en http://reservas/actividades/web/tablero. Además, se visualizará en la TV de la sala de profesores cuando estemos en la semana de su realización.
    
    Un saludo.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Email enviado correctamente a:", emailOrganizador);
  } catch (err) {
    console.error("❌ Error enviando email:", err);
  }
}

module.exports = enviarEmail;
