require("dotenv").config();
const nodemailer = require("nodemailer");

const allowedOrigins = ["https://www.yvagacore.tech"];

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const origin = req.headers.origin;
    if (!allowedOrigins.includes(origin)) {
      res.status(403).json({ message: "No permitido por CORS" });
      return;
    }

    const { name, lastName, email, phone, description, companyName, type } =
      req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Formulario Cliente",
      text: `
        Nombre: ${name} ${lastName}
        Email: ${email}
        Teléfono: ${phone}
        Tipo de contacto: ${type}
        Empresa: ${companyName || "N/A"}
        Descripción: ${description}
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Correo enviado exitosamente" });
    } catch (error) {
      console.error("Error enviando correo:", error);
      res.status(500).json({ message: "Error enviando correo" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
