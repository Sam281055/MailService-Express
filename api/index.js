require("dotenv").config();
const cors = require("cors");

const express = require("express");
const nodemailer = require("nodemailer");

const allowedOrigins = ["https://yvagacore.tech"];

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ruta para enviar el correo
app.post("/send-email", async (req, res) => {
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
    res.status(200).send("Correo enviado exitosamente");
  } catch (error) {
    console.error("Error enviando correo:", error);
    res.status(500).send("Error enviando correo");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose`);
});
