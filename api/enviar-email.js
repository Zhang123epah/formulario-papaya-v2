import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido." });
  }

  try {
    const {
      nome,
      idade,
      telefone,
      email,
      altura,
      rgpd,
      linksFotos
    } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const listaFotos = linksFotos
      .map((link, index) => `Foto ${index + 1}: ${link}`)
      .join("\n");

    const mensagem = `
Nova candidatura recebida:

Nome: ${nome}
Idade: ${idade}
Telefone: ${telefone}
Email: ${email}
Altura: ${altura}
Consentimento RGPD: ${rgpd ? "Sim" : "Não"}

Fotos:
${listaFotos}
`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Nova candidatura de modelo",
      text: mensagem
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Email enviado com sucesso."
    });

  } catch (erro) {
    console.error("Erro ao enviar email:", erro);

    return res.status(500).json({
      erro: "Erro ao enviar email."
    });
  }
}