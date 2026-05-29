import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBoqah2bUqHbhzxYXJ9n9sojUpCVliJIQs",
  authDomain: "formulariopapaya.firebaseapp.com",
  projectId: "formulariopapaya",
  storageBucket: "formulariopapaya.firebasestorage.app",
  messagingSenderId: "883416725834",
  appId: "1:883416725834:web:85aac838364f100cd669b3",
  measurementId: "G-4NHZY7QH1J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const formulario = document.getElementById("formulario");
const estado = document.getElementById("estado");
const botao = formulario.querySelector("button[type='submit']");

function mostrarEstado(mensagem, cor) {
  estado.textContent = mensagem;
  estado.style.color = cor;
}

formulario.addEventListener("submit", async function (event) {
  event.preventDefault();

  mostrarEstado("A enviar candidatura...", "black");
  botao.disabled = true;

  try {
    const nome = document.getElementById("nome").value.trim();
    const idade = document.getElementById("idade").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const altura = document.getElementById("altura").value.trim();
    const rgpd = document.getElementById("rgpd").checked;
    const fotos = document.getElementById("fotos").files;

    if (!nome || !idade || !telefone || !email || !altura) {
      mostrarEstado("Preenche todos os campos obrigatórios.", "red");
      return;
    }

    if (!rgpd) {
      mostrarEstado("Tens de autorizar o tratamento dos dados pessoais.", "red");
      return;
    }

    if (fotos.length === 0) {
      mostrarEstado("Escolhe pelo menos uma foto.", "red");
      return;
    }

    const linksFotos = [];
    const nomeSeguro = nome
      .replace(/[^a-z0-9_-]/gi, "_")
      .toLowerCase();

    for (const foto of fotos) {
      if (!foto.type.startsWith("image/")) {
        mostrarEstado("Só podes enviar ficheiros de imagem.", "red");
        return;
      }

      const nomeFicheiro = `${Date.now()}-${foto.name}`;
      const caminho = `candidaturas/${nomeSeguro}/${nomeFicheiro}`;
      const referencia = ref(storage, caminho);

      await uploadBytes(referencia, foto);

      const link = await getDownloadURL(referencia);
      linksFotos.push(link);
    }

    const resposta = await fetch("/api/enviar-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        idade,
        telefone,
        email,
        altura,
        rgpd,
        linksFotos
      })
    });

    let resultado = {};

    try {
      resultado = await resposta.json();
    } catch {
      throw new Error("A API de email não respondeu corretamente.");
    }

    if (!resposta.ok) {
      throw new Error(resultado.erro || "Erro ao enviar email.");
    }

    estado.style.color = "green";
    estado.innerHTML = "Candidatura enviada com sucesso!";
    formulario.reset();

  } catch (erro) {
    console.error("Erro:", erro);
    mostrarEstado(`Erro: ${erro.message}`, "red");
  } finally {
    botao.disabled = false;
  }
});