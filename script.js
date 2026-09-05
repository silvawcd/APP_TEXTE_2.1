/* =========================================================
   CONFIGURAÇÃO DO FIREBASE (NUVEM) - UTIL_FACIL
========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyCJ4b_c3aHTa-X0waHmJHqukNL8hshGfNg",
  authDomain: "utilfacil-ec62e.firebaseapp.com",
  projectId: "utilfacil-ec62e",
  storageBucket: "utilfacil-ec62e.firebasestorage.app",
  messagingSenderId: "43492388150",
  appId: "1:43492388150:web:b9a0361393cefcfff15797"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Correção do idioma para envios de e-mail do Firebase em Português
auth.languageCode = 'pt-BR';

const PORCENTAGEM_DIZIMO = 0.10;

let produtos = [];
let vendas = [];
let historico = [];

// ELEMENTOS DOM
const formProduto = document.getElementById("formProduto");
const formVenda = document.getElementById("formVenda");
const listaProdutos = document.getElementById("listaProdutos");
const listaVendas = document.getElementById("listaVendas");
const listaHistorico = document.getElementById("listaHistorico");
const produtoVenda = document.getElementById("produtoVenda");
const quantidadeVenda = document.getElementById("quantidadeVenda");
const produtoId = document.getElementById("produtoId");
const nomeProduto = document.getElementById("nomeProduto");
const custoProduto = document.getElementById("custoProduto");
const precoProduto = document.getElementById("precoProduto");
const estoqueProduto = document.getElementById("estoqueProduto");
const cancelarEdicao = document.getElementById("cancelarEdicao");
const tituloFormularioProduto = document.getElementById("tituloFormularioProduto");

// BUSCA RÁPIDA
const inputBuscaProduto = document.getElementById("inputBuscaProduto");
const resultadoBuscaContainer = document.getElementById("resultadoBuscaContainer");
const alertaSemProduto = document.getElementById("alertaSemProduto");
const btnCadastrarDaBusca = document.getElementById("btnCadastrarDaBusca");

// ELEMENTOS DE AUTENTICAÇÃO E MODAL
const modalSenha = document.getElementById("modalSenha");
const formSenha = document.getElementById("formSenha");
const formCadastro = document.getElementById("formCadastro");
const campoEmail = document.getElementById("campoEmail");
const campoSenha = document.getElementById("campoSenha");
const campoEmailCadastro = document.getElementById("campoEmailCadastro");
const campoSenhaCadastro = document.getElementById("campoSenhaCadastro");
const erroSenha = document.getElementById("erroSenha");
const sucessoSenha = document.getElementById("sucessoSenha");
const btnEsqueciSenha = document.getElementById("btnEsqueciSenha");
const btnSair = document.getElementById("btnSair");

const btnAbaLogin = document.getElementById("btnAbaLogin");
const btnAbaCadastro = document.getElementById("btnAbaCadastro");

// GERENCIAMENTO DAS ABAS (LOGIN / CADASTRO)
btnAbaLogin.addEventListener("click", () => {
  formSenha.style.display = "block";
  formCadastro.style.display = "none";
  btnAbaLogin.classList.add("ativo");
  btnAbaCadastro.classList.remove("ativo");
  ocultarMensagens();
});

btnAbaCadastro.addEventListener("click", () => {
  formSenha.style.display = "none";
  formCadastro.style.display = "block";
  btnAbaCadastro.classList.add("ativo");
  btnAbaLogin.classList.remove("ativo");
  ocultarMensagens();
});

function ocultarMensagens() {
  erroSenha.hidden = true;
  sucessoSenha.hidden = true;
}

// 1. LOGIN INDIVIDUAL VIA FIREBASE AUTH
formSenha.addEventListener("submit", async (e) => {
  e.preventDefault();
  ocultarMensagens();

  const emailDigitado = campoEmail.value.trim();
  const senhaDigitada = campoSenha.value;

  try {
    await auth.signInWithEmailAndPassword(emailDigitado, senhaDigitada);

    modalSenha.style.display = "none";
    campoEmail.value = "";
    campoSenha.value = "";
  } catch (erro) {
    let mensagem = "Erro ao realizar login.";
    if (erro.code === "auth/user-not-found" || erro.code === "auth/wrong-password" || erro.code === "auth/invalid-credential") {
      mensagem = "E-mail ou senha incorretos.";
    } else if (erro.code === "auth/invalid-email") {
      mensagem = "Endereço de e-mail inválido.";
    }
    erroSenha.textContent = mensagem;
    erroSenha.hidden = false;
  }
});

// 2. CADASTRO DE NOVO USUÁRIO VIA FIREBASE AUTH
formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();
  ocultarMensagens();

  const email = campoEmailCadastro.value.trim();
  const senha = campoSenhaCadastro.value;

  try {
    await auth.createUserWithEmailAndPassword(email, senha);

    modalSenha.style.display = "none";
    campoEmailCadastro.value = "";
    campoSenhaCadastro.value = "";
  } catch (erro) {
    let mensagem = "Erro ao criar conta.";
    if (erro.code === "auth/email-already-in-use") {
      mensagem = "Este e-mail já está cadastrado! Faça login ou recupere a senha.";
    } else if (erro.code === "auth/weak-password") {
      mensagem = "A senha deve conter pelo menos 6 caracteres.";
    } else if (erro.code === "auth/invalid-email") {
      mensagem = "Endereço de e-mail inválido.";
    }
    erroSenha.textContent = mensagem;
    erroSenha.hidden = false;
  }
});

// 3. RECUPERAÇÃO DE SENHA POR E-MAIL
btnEsqueciSenha.addEventListener("click", async () => {
  ocultarMensagens();
  const email = prompt("Digite o seu e-mail cadastrado para redefinir a senha:");
  if (!email || email.trim() === "") return;

  try {
    await auth.sendPasswordResetEmail(email.trim());
    sucessoSenha.textContent = "✅ Link de redefinição enviado para o seu e-mail!";
    sucessoSenha.hidden = false;
  } catch (erro) {
    alert("Não foi possível enviar o e-mail: " + erro.message);
  }
});

// 4. BOTÃO DE SAIR / LOGOUT
if (btnSair) {
  btnSair.addEventListener("click", async () => {
    if (confirm("Deseja realmente sair da sua conta?")) {
      await auth.signOut();
    }
  });
}

// OBSERVADOR DE ESTADO DA AUTENTICAÇÃO (Sessão mantida nativamente pelo Firebase)
auth.onAuthStateChanged((usuario) => {
  if (usuario) {
    modalSenha.style.display = "none";
  } else {
    modalSenha.style.display = "flex";
  }
});

// AUXILIARES
function moeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function obterDataHoje() {
  return new Date().toLocaleDateString("pt-BR");
}

// SINCRONIZAÇÃO EM TEMPO REAL COM A NUVEM
function escutarNuvem() {
  db.collection("produtos").onSnapshot(snapshot => {
    produtos = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    renderizarProdutos();
    atualizarSelectProdutos();
  });

  db.collection("vendas").onSnapshot(snapshot => {
    vendas = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    renderizarVendas();
    atualizarDashboard();
  });

  db.collection("historico").onSnapshot(snapshot => {
    historico = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    renderizarHistorico();
  });
}

// NAVEGAÇÃO
const botoesMenu = document.querySelectorAll(".menu-btn");
const telas = document.querySelectorAll(".tela");

botoesMenu.forEach(botao => {
  botao.addEventListener("click", () => {
    const nomeTela = botao.dataset.tela;
    botoesMenu.forEach(btn => btn.classList.remove("ativo"));
    botao.classList.add("ativo");
    telas.forEach(tela => tela.classList.remove("ativa"));
    document.getElementById(nomeTela).classList.add("ativa");
  });
});

// GESTÃO DE PRODUTOS
formProduto.addEventListener("submit", async function(event) {
  event.preventDefault();
  const nome = nomeProduto.value.trim();
  const custo = Number(custoProduto.value);
  const preco = Number(precoProduto.value);
  const estoque = Number(estoqueProduto.value);

  if (nome === "" || custo < 0 || preco < 0 || estoque < 0) {
    alert("Preencha os dados corretamente.");
    return;
  }

  if (produtoId.value) {
    const docId = produtoId.value;
    await db.collection("produtos").doc(docId).update({ nome, custo, preco, estoque });
  } else {
    await db.collection("produtos").add({
      id: Date.now(),
      nome, custo, preco, estoque
    });
  }

  limparFormularioProduto();
});

function renderizarProdutos(listaFiltrada = null) {
  const listaParaRenderizar = listaFiltrada !== null ? listaFiltrada : produtos;

  if (listaParaRenderizar.length === 0) {
    listaProdutos.innerHTML = `<p class="vazio">Nenhum produto encontrado.</p>`;
    return;
  }

  listaProdutos.innerHTML = "";
  listaParaRenderizar.forEach(produto => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="item-info">
        <strong>📦 ${produto.nome}</strong>
        <small>Custo: ${moeda(produto.custo)} | Venda: ${moeda(produto.preco)} | Estoque: ${produto.estoque}</small>
      </div>
      <div class="item-acoes">
        <button class="editar" onclick="editarProduto('${produto.docId}')">✏️</button>
        <button class="excluir" onclick="excluirProduto('${produto.docId}', '${produto.nome}')">🗑️</button>
      </div>
    `;
    listaProdutos.appendChild(div);
  });
}

// LÓGICA DA BARRA DE BUSCA EM TEMPO REAL
inputBuscaProduto.addEventListener("input", () => {
  const termo = inputBuscaProduto.value.trim().toLowerCase();

  if (termo === "") {
    resultadoBuscaContainer.hidden = true;
    alertaSemProduto.hidden = true;
    renderizarProdutos();
    return;
  }

  const produtosEncontrados = produtos.filter(p => p.nome.toLowerCase().includes(termo));

  if (produtosEncontrados.length === 0) {
    resultadoBuscaContainer.hidden = false;
    alertaSemProduto.hidden = false;
    renderizarProdutos([]);
  } else {
    resultadoBuscaContainer.hidden = true;
    alertaSemProduto.hidden = true;
    renderizarProdutos(produtosEncontrados);
  }
});

btnCadastrarDaBusca.addEventListener("click", () => {
  nomeProduto.value = inputBuscaProduto.value.trim();
  document.getElementById("painelFormProduto").scrollIntoView({ behavior: "smooth" });
  custoProduto.focus();
});

function editarProduto(docId) {
  const produto = produtos.find(p => p.docId === docId);
  if (!produto) return;

  produtoId.value = produto.docId;
  nomeProduto.value = produto.nome;
  custoProduto.value = produto.custo;
  precoProduto.value = produto.preco;
  estoqueProduto.value = produto.estoque;

  tituloFormularioProduto.textContent = "✏️ Editar Produto";
  cancelarEdicao.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelarEdicao.addEventListener("click", limparFormularioProduto);

function limparFormularioProduto() {
  formProduto.reset();
  produtoId.value = "";
  tituloFormularioProduto.textContent = "➕ Cadastrar Produto";
  cancelarEdicao.hidden = true;
}

async function excluirProduto(docId, nome) {
  if (!confirm(`Deseja excluir "${nome}"?`)) return;
  await db.collection("produtos").doc(docId).delete();
}

function atualizarSelectProdutos() {
  produtoVenda.innerHTML = `<option value="">Selecione um produto</option>`;
  produtos.forEach(produto => {
    const option = document.createElement("option");
    option.value = produto.docId;
    option.textContent = `${produto.nome} — Estoque: ${produto.estoque}`;
    produtoVenda.appendChild(option);
  });
}

// VENDAS
formVenda.addEventListener("submit", async function(event) {
  event.preventDefault();
  const docIdProduto = produtoVenda.value;
  const quantidade = Number(quantidadeVenda.value);

  if (!docIdProduto || quantidade <= 0) {
    alert("Informe dados válidos.");
    return;
  }

  const produto = produtos.find(p => p.docId === docIdProduto);
  if (!produto || quantidade > produto.estoque) {
    alert(`Estoque insuficiente. Disponível: ${produto ? produto.estoque : 0}`);
    return;
  }

  await db.collection("vendas").add({
    id: Date.now(),
    data: obterDataHoje(),
    produtoId: produto.docId,
    produto: produto.nome,
    quantidade: quantidade,
    custoUnitario: produto.custo,
    precoUnitario: produto.preco,
    totalVenda: produto.preco * quantidade,
    capital: produto.custo * quantidade
  });

  await db.collection("produtos").doc(produto.docId).update({
    estoque: produto.estoque - quantidade
  });

  formVenda.reset();
  quantidadeVenda.value = 1;
});

function obterVendasHoje() {
  const hoje = obterDataHoje();
  return vendas.filter(venda => venda.data === hoje);
}

function renderizarVendas() {
  const vendasHoje = obterVendasHoje();
  if (vendasHoje.length === 0) {
    listaVendas.innerHTML = `<p class="vazio">Nenhuma venda registrada hoje.</p>`;
    return;
  }

  listaVendas.innerHTML = "";
  vendasHoje.forEach(venda => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="item-info">
        <strong>🛒 ${venda.produto}</strong>
        <small>${venda.quantidade}x | Total: ${moeda(venda.totalVenda)} | Custo: ${moeda(venda.capital)}</small>
      </div>
      <div class="item-acoes">
        <button class="excluir" onclick="excluirVenda('${venda.docId}', '${venda.produtoId}', ${venda.quantidade})">🗑️ Excluir</button>
      </div>
    `;
    listaVendas.appendChild(div);
  });
}

async function excluirVenda(docIdVenda, docIdProduto, quantidade) {
  if (!confirm("Cancelar esta venda?")) return;

  const produto = produtos.find(p => p.docId === docIdProduto);
  if (produto) {
    await db.collection("produtos").doc(docIdProduto).update({
      estoque: produto.estoque + quantidade
    });
  }

  await db.collection("vendas").doc(docIdVenda).delete();
}

// DASHBOARD E FECHAMENTO
function calcularDia() {
  const vendasHoje = obterVendasHoje();
  let totalVendas = 0, capital = 0;

  vendasHoje.forEach(venda => {
    totalVendas += venda.totalVenda;
    capital += venda.capital;
  });

  const lucro = totalVendas - capital;
  const dizimo = lucro > 0 ? lucro * PORCENTAGEM_DIZIMO : 0;
  const lucroFinal = lucro - dizimo;

  return { totalVendas, capital, lucro, dizimo, lucroFinal };
}

function atualizarDashboard() {
  const v = calcularDia();
  document.getElementById("totalVendas").textContent = moeda(v.totalVendas);
  document.getElementById("capitalUtilizado").textContent = moeda(v.capital);
  document.getElementById("lucroBruto").textContent = moeda(v.lucro);
  document.getElementById("valorDizimo").textContent = moeda(v.dizimo);
  document.getElementById("lucroFinal").textContent = moeda(v.lucroFinal);

  document.getElementById("fechamentoVendas").textContent = moeda(v.totalVendas);
  document.getElementById("fechamentoCapital").textContent = moeda(v.capital);
  document.getElementById("fechamentoLucro").textContent = moeda(v.lucro);
  document.getElementById("fechamentoDizimo").textContent = moeda(v.dizimo);
  document.getElementById("fechamentoFinal").textContent = moeda(v.lucroFinal);
}

document.getElementById("fecharDia").addEventListener("click", async function() {
  const hoje = obterDataHoje();
  const vendasHoje = obterVendasHoje();

  if (vendasHoje.length === 0) {
    alert("Não existem vendas registradas hoje.");
    return;
  }

  if (historico.some(item => item.data === hoje)) {
    alert("⚠️ O dia de hoje já foi fechado.");
    return;
  }

  const v = calcularDia();
  await db.collection("historico").add({
    id: Date.now(),
    data: hoje,
    ...v,
    quantidadeVendas: vendasHoje.length
  });

  alert("✅ Fechamento do dia salvo na nuvem!");
});

function renderizarHistorico() {
  if (historico.length === 0) {
    listaHistorico.innerHTML = `<p class="vazio">Nenhum fechamento registrado.</p>`;
    return;
  }

  listaHistorico.innerHTML = "";
  [...historico].reverse().forEach(item => {
    const div = document.createElement("div");
    div.className = "historico-item";
    div.innerHTML = `
      <h4>📅 ${item.data}</h4>
      <div class="historico-grid">
        <span>Vendas: <strong>${moeda(item.totalVendas)}</strong></span>
        <span>Capital: <strong>${moeda(item.capital)}</strong></span>
        <span>Lucro Bruto: <strong>${moeda(item.lucro)}</strong></span>
        <span>Dízimo: <strong>${moeda(item.dizimo)}</strong></span>
        <span>Lucro Líquido: <strong>${moeda(item.lucroFinal)}</strong></span>
        <span>Qtd. Vendas: <strong>${item.quantidadeVendas}</strong></span>
      </div>
      <button class="btn excluir" style="padding: 6px 12px; font-size: 0.8rem;" onclick="excluirHistorico('${item.docId}')">Excluir Registro</button>
    `;
    listaHistorico.appendChild(div);
  });
}

async function excluirHistorico(docId) {
  if (!confirm("Remover este histórico?")) return;
  await db.collection("historico").doc(docId).delete();
}

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  const elemData = document.getElementById("dataAtual");
  if (elemData) {
    elemData.textContent = obterDataHoje();
  }
  
  escutarNuvem();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("✅ Service Worker registrado com sucesso!"))
      .catch((erro) => console.error("❌ Erro ao registrar Service Worker:", erro));
  }
});
