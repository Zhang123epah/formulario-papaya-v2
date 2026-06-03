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

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_TO) {
      return res.status(500).json({
        erro: "Faltam variáveis de ambiente no Vercel: EMAIL_USER, EMAIL_PASS ou EMAIL_TO."
      });
    }

    if (!linksFotos || linksFotos.length === 0) {
      return res.status(400).json({
        erro: "Nenhum link de foto foi recebido."
      });
    }

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
    from: `"Candidaturas Papaya" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `Nova candidatura de modelo - ${nome}`,
    text: mensagem
  });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Email enviado com sucesso."
    });

  } catch (erro) {
    console.error("Erro ao enviar email:", erro);

    return res.status(500).json({
      erro: erro.message || "Erro ao enviar email."
    });
  }
}