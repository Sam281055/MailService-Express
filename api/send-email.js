require("dotenv").config();
const nodemailer = require("nodemailer");
const cors = require("cors");

// Orígenes permitidos para CORS
const allowedOrigins = [
  "https://www.yvagacore.tech",
  "yvagacore.tech",
  "https://landing-page-lime-zeta.vercel.app",
];

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); // Permite solicitudes de estos orígenes
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"], // Permite los métodos GET, POST y OPTIONS
  allowedHeaders: ["Content-Type"], // Permite encabezados personalizados
  preflightContinue: false, // Evita que la solicitud OPTIONS sea procesada por otros middlewares
};

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  // Habilitar CORS para las solicitudes entrantes
  cors(corsOptions)(req, res, async () => {
    // Manejar solicitudes POST
    if (req.method === "POST") {
      const origin = req.headers.origin;
      if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ message: "No permitido por CORS" });
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
      res.setHeader("Allow", ["POST", "OPTIONS"]);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  });
}
