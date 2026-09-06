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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
auth.languageCode = 'pt-BR';

const PORCENTAGEM_DIZIMO = 0.10;
let usuarioAtual = null;
let desinscritosListeners = [];
let produtos = [];
let vendas = [];
let historico = [];
let intervaloTrial = null;

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
const inputBuscaProduto = document.getElementById("inputBuscaProduto");
const resultadoBuscaContainer = document.getElementById("resultadoBuscaContainer");
const alertaSemProduto = document.getElementById("alertaSemProduto");
const btnCadastrarDaBusca = document.getElementById("btnCadastrarDaBusca");

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

// ELEMENTOS DE TESTE/EXPIRAÇÃO
const areaExpirado = document.getElementById("areaExpirado");
const areaLoginNormal = document.getElementById("areaLoginNormal");
const relogioTrial = document.getElementById("relogioTrial");
const btnVoltarLoginExp = document.getElementById("btnVoltarLoginExp");
const cabecalhoApp = document.getElementById("cabecalhoApp");
const menuNavegacao = document.getElementById("menuNavegacao");
const conteudoPrincipal = document.getElementById("conteudoPrincipal");

// GERENCIAMENTO DAS ABAS DE LOGIN
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

// ---------------------------------------------------------
// RELÓGIO DE TESTE 24 HORAS (SaaS)
// ---------------------------------------------------------
function iniciarRelogioTrial(timestampFim) {
  relogioTrial.style.display = "block"; // Mostra o relógio no header
  clearInterval(intervaloTrial);

  intervaloTrial = setInterval(() => {
    const agora = Date.now();
    const diferenca = timestampFim - agora;

    if (diferenca <= 0) {
      clearInterval(intervaloTrial);
      relogioTrial.textContent = "⏱️ EXPIRADO";
      mostrarTelaExpirado();
      return;
    }

    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenca / 1000 / 60) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);

    const horasStr = String(horas).padStart(2, '0');
    const minStr = String(minutos).padStart(2, '0');
    const segStr = String(segundos).padStart(2, '0');

    relogioTrial.textContent = `⏱️ ${horasStr}:${minStr}:${segStr}`;
  }, 1000);
}

function mostrarTelaExpirado() {
  // Esconde o app por baixo
  cabecalhoApp.style.display = "none";
  menuNavegacao.style.display = "none";
  conteudoPrincipal.style.display = "none";
  
  // Mostra a tela de bloqueio
  modalSenha.style.display = "flex";
  areaLoginNormal.style.display = "none";
  areaExpirado.style.display = "block";
}

// Botão Sair da tela de bloqueio
btnVoltarLoginExp.addEventListener("click", async () => {
  await auth.signOut();
  window.location.reload();
});

// 1. LOGIN
formSenha.addEventListener("submit", async (e) => {
  e.preventDefault();
  ocultarMensagens();
  try {
    await auth.signInWithEmailAndPassword(campoEmail.value.trim(), campoSenha.value);
    campoEmail.value = ""; campoSenha.value = "";
  } catch (erro) {
    erroSenha.textContent = "Erro: " + erro.message; erroSenha.hidden = false;
  }
});

// 2. CADASTRO (INICIA O TESTE DE 24H AQUI)
formCadastro.addEventListener("submit", async (e) => {
  e.preventDefault();
  ocultarMensagens();
  try {
    const credencial = await auth.createUserWithEmailAndPassword(campoEmailCadastro.value.trim(), campoSenhaCadastro.value);
    
    // Calcula exatas 24 horas a partir de agora
    const dataFimTeste = Date.now() + (24 * 60 * 60 * 1000);
    
    // Salva no banco de dados do usuário
    await db.collection("usuarios").doc(credencial.user.uid).set({
      trialFim: dataFimTeste
    });

    campoEmailCadastro.value = ""; campoSenhaCadastro.value = "";
  } catch (erro) {
    erroSenha.textContent = "Erro: " + erro.message; erroSenha.hidden = false;
  }
});

// 3. RECUPERAÇÃO DE SENHA
btnEsqueciSenha.addEventListener("click", async () => {
  ocultarMensagens();
  const email = prompt("Digite seu e-mail:");
  if (!email || email.trim() === "") return;
  try {
    await auth.sendPasswordResetEmail(email.trim());
    sucessoSenha.textContent = "✅ Link enviado!"; sucessoSenha.hidden = false;
  } catch (erro) {
    alert("Erro: " + erro.message);
  }
});

// 4. SAIR
if (btnSair) {
  btnSair.addEventListener("click", async () => {
    if (confirm("Deseja sair da conta?")) {
      await auth.signOut();
      window.location.reload();
    }
  });
}

// ---------------------------------------------------------
// OBSERVADOR: VERIFICA O TESTE AO LOGAR
// ---------------------------------------------------------
auth.onAuthStateChanged(async (usuario) => {
  desinscritosListeners.forEach(unsub => unsub());
  desinscritosListeners = [];

  if (usuario) {
    try {
      const docUsuario = await db.collection("usuarios").doc(usuario.uid).get();
      let trialFim = null;

      if (docUsuario.exists && docUsuario.data().trialFim) {
        trialFim = docUsuario.data().trialFim;
      } else {
        // Se por acaso for um usuário antigo que não tinha o sistema de teste:
        // Dá as 24h a partir de agora pra ele não ser bloqueado de cara.
        trialFim = Date.now() + (24 * 60 * 60 * 1000);
        await db.collection("usuarios").doc(usuario.uid).set({ trialFim: trialFim }, { merge: true });
      }

      // Se já passou do tempo
      if (Date.now() >= trialFim) {
        mostrarTelaExpirado();
        return; // Para a execução aqui, ele não entra no app.
      } else {
        // Se ainda tem tempo, inicia o relógio e libera o app
        iniciarRelogioTrial(trialFim);
      }

    } catch (erro) {
      console.error(erro);
    }

    // Libera a tela principal
    usuarioAtual = usuario;
    modalSenha.style.display = "none";
    cabecalhoApp.style.display = "flex";
    menuNavegacao.style.display = "flex";
    conteudoPrincipal.style.display = "block";
    
    escutarNuvemUsuario(usuario.uid);
  } else {
    // Modo deslogado
    usuarioAtual = null;
    produtos = []; vendas = []; historico = [];
    renderizarProdutos(); renderizarVendas(); renderizarHistorico(); atualizarDashboard();
    
    cabecalhoApp.style.display = "none";
    menuNavegacao.style.display = "none";
    conteudoPrincipal.style.display = "none";
    modalSenha.style.display = "flex";
    areaLoginNormal.style.display = "block";
    areaExpirado.style.display = "none";
  }
});

// FUNÇÕES AUXILIARES E DO APLICATIVO DAQUI PRA BAIXO 
function moeda(valor) { return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function obterDataHoje() { return new Date().toLocaleDateString("pt-BR"); }
function colecaoUsuario(nomeColecao) { return db.collection("usuarios").doc(usuarioAtual.uid).collection(nomeColecao); }

// SINCRONIZAÇÃO
function escutarNuvemUsuario(uid) {
  const unsubProdutos = db.collection("usuarios").doc(uid).collection("produtos").onSnapshot(snapshot => {
    produtos = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    renderizarProdutos();
    atualizarSelectProdutos();
  });
  const unsubVendas = db.collection("usuarios").doc(uid).collection("vendas").onSnapshot(snapshot => {
    vendas = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    renderizarVendas();
    atualizarDashboard();
  });
  const unsubHistorico = db.collection("usuarios").doc(uid).collection("historico").onSnapshot(snapshot => {
    historico = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    renderizarHistorico();
  });
  desinscritosListeners.push(unsubProdutos, unsubVendas, unsubHistorico);
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

// PRODUTOS
formProduto.addEventListener("submit", async function(event) {
  event.preventDefault();
  if (!usuarioAtual) return;
  const nome = nomeProduto.value.trim();
  const custo = Number(custoProduto.value);
  const preco = Number(precoProduto.value);
  const estoque = Number(estoqueProduto.value);

  if (nome === "" || custo < 0 || preco < 0 || estoque < 0) return alert("Preencha corretamente.");

  if (produtoId.value) {
    await colecaoUsuario("produtos").doc(produtoId.value).update({ nome, custo, preco, estoque });
  } else {
    await colecaoUsuario("produtos").add({ id: Date.now(), nome, custo, preco, estoque });
  }
  limparFormularioProduto();
});

function renderizarProdutos(listaFiltrada = null) {
  const lista = listaFiltrada !== null ? listaFiltrada : produtos;
  if (lista.length === 0) return listaProdutos.innerHTML = `<p class="vazio">Nenhum produto.</p>`;
  listaProdutos.innerHTML = "";
  lista.forEach(p => {
    const div = document.createElement("div"); div.className = "item";
    div.innerHTML = `
      <div class="item-info"><strong>📦 ${p.nome}</strong><small>Custo: ${moeda(p.custo)} | Venda: ${moeda(p.preco)} | Estoque: ${p.estoque}</small></div>
      <div class="item-acoes"><button class="editar" onclick="editarProduto('${p.docId}')">✏️</button><button class="excluir" onclick="excluirProduto('${p.docId}','${p.nome}')">🗑️</button></div>
    `;
    listaProdutos.appendChild(div);
  });
}

inputBuscaProduto.addEventListener("input", () => {
  const termo = inputBuscaProduto.value.trim().toLowerCase();
  if (termo === "") {
    resultadoBuscaContainer.hidden = true; alertaSemProduto.hidden = true; renderizarProdutos(); return;
  }
  const encontrados = produtos.filter(p => p.nome.toLowerCase().includes(termo));
  if (encontrados.length === 0) {
    resultadoBuscaContainer.hidden = false; alertaSemProduto.hidden = false; renderizarProdutos([]);
  } else {
    resultadoBuscaContainer.hidden = true; alertaSemProduto.hidden = true; renderizarProdutos(encontrados);
  }
});

btnCadastrarDaBusca.addEventListener("click", () => {
  nomeProduto.value = inputBuscaProduto.value.trim();
  document.getElementById("painelFormProduto").scrollIntoView({ behavior: "smooth" });
  custoProduto.focus();
});

window.editarProduto = function(docId) {
  const p = produtos.find(p => p.docId === docId);
  if (!p) return;
  produtoId.value = p.docId; nomeProduto.value = p.nome; custoProduto.value = p.custo;
  precoProduto.value = p.preco; estoqueProduto.value = p.estoque;
  tituloFormularioProduto.textContent = "✏️ Editar Produto"; cancelarEdicao.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
cancelarEdicao.addEventListener("click", limparFormularioProduto);
function limparFormularioProduto() { formProduto.reset(); produtoId.value = ""; tituloFormularioProduto.textContent = "➕ Cadastrar Produto"; cancelarEdicao.hidden = true; }
window.excluirProduto = async function(docId, nome) { if (confirm(`Excluir "${nome}"?`)) await colecaoUsuario("produtos").doc(docId).delete(); }

function atualizarSelectProdutos() {
  produtoVenda.innerHTML = `<option value="">Selecione um produto</option>`;
  produtos.forEach(p => {
    const opt = document.createElement("option"); opt.value = p.docId; opt.textContent = `${p.nome} — Estoque: ${p.estoque}`;
    produtoVenda.appendChild(opt);
  });
}

// VENDAS
formVenda.addEventListener("submit", async function(event) {
  event.preventDefault();
  const docId = produtoVenda.value; const qtd = Number(quantidadeVenda.value);
  if (!docId || qtd <= 0) return;
  const p = produtos.find(p => p.docId === docId);
  if (!p || qtd > p.estoque) return alert("Estoque insuficiente.");
  
  await colecaoUsuario("vendas").add({
    id: Date.now(), data: obterDataHoje(), produtoId: p.docId, produto: p.nome,
    quantidade: qtd, custoUnitario: p.custo, precoUnitario: p.preco, totalVenda: p.preco * qtd, capital: p.custo * qtd
  });
  await colecaoUsuario("produtos").doc(p.docId).update({ estoque: p.estoque - qtd });
  formVenda.reset(); quantidadeVenda.value = 1;
});

function obterVendasHoje() { const hoje = obterDataHoje(); return vendas.filter(v => v.data === hoje); }
function renderizarVendas() {
  const hojeV = obterVendasHoje();
  if (hojeV.length === 0) return listaVendas.innerHTML = `<p class="vazio">Nenhuma venda hoje.</p>`;
  listaVendas.innerHTML = "";
  hojeV.forEach(v => {
    const div = document.createElement("div"); div.className = "item";
    div.innerHTML = `
      <div class="item-info"><strong>🛒 ${v.produto}</strong><small>${v.quantidade}x | Total: ${moeda(v.totalVenda)}</small></div>
      <div class="item-acoes"><button class="excluir" onclick="excluirVenda('${v.docId}', '${v.produtoId}', ${v.quantidade})">🗑️</button></div>
    `;
    listaVendas.appendChild(div);
  });
}
window.excluirVenda = async function(docIdVenda, docIdProduto, qtd) {
  if (!confirm("Cancelar venda?")) return;
  const p = produtos.find(p => p.docId === docIdProduto);
  if (p) await colecaoUsuario("produtos").doc(docIdProduto).update({ estoque: p.estoque + qtd });
  await colecaoUsuario("vendas").doc(docIdVenda).delete();
}

// DASHBOARD
function calcularDia() {
  const hojeV = obterVendasHoje(); let t = 0, c = 0, i = 0;
  hojeV.forEach(v => { t += v.totalVenda; c += v.capital; i += v.quantidade; });
  const l = t - c; const d = l > 0 ? l * PORCENTAGEM_DIZIMO : 0;
  return { totalVendas: t, capital: c, lucro: l, dizimo: d, lucroFinal: l - d, totalItens: i };
}
function atualizarDashboard() {
  const v = calcularDia();
  document.getElementById("totalVendas").textContent = moeda(v.totalVendas); document.getElementById("capitalUtilizado").textContent = moeda(v.capital);
  document.getElementById("lucroBruto").textContent = moeda(v.lucro); document.getElementById("valorDizimo").textContent = moeda(v.dizimo); document.getElementById("lucroFinal").textContent = moeda(v.lucroFinal);
  document.getElementById("fechamentoVendas").textContent = moeda(v.totalVendas); document.getElementById("fechamentoCapital").textContent = moeda(v.capital);
  document.getElementById("fechamentoLucro").textContent = moeda(v.lucro); document.getElementById("fechamentoDizimo").textContent = moeda(v.dizimo); document.getElementById("fechamentoFinal").textContent = moeda(v.lucroFinal);
}

document.getElementById("fecharDia").addEventListener("click", async function() {
  const hoje = obterDataHoje(); const hojeV = obterVendasHoje();
  if (hojeV.length === 0) return alert("Sem vendas hoje.");
  if (historico.some(item => item.data === hoje)) return alert("Dia já fechado.");
  const v = calcularDia();
  await colecaoUsuario("historico").add({ id: Date.now(), data: hoje, ...v, quantidadeVendas: v.totalItens });
  alert("Fechamento salvo!");
});

function renderizarHistorico() {
  if (historico.length === 0) return listaHistorico.innerHTML = `<p class="vazio">Nenhum fechamento.</p>`;
  listaHistorico.innerHTML = "";
  [...historico].reverse().forEach(item => {
    const div = document.createElement("div"); div.className = "historico-item";
    div.innerHTML = `<h4>📅 ${item.data}</h4><div class="historico-grid"><span>Vendas: <strong>${moeda(item.totalVendas)}</strong></span><span>Lucro: <strong>${moeda(item.lucroFinal)}</strong></span></div>
    <button class="btn excluir" style="padding: 6px 12px; font-size: 0.8rem;" onclick="excluirHistorico('${item.docId}')">Excluir Registro</button>`;
    listaHistorico.appendChild(div);
  });
}
window.excluirHistorico = async function(docId) { if (confirm("Remover histórico?")) await colecaoUsuario("historico").doc(docId).delete(); }

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("dataAtual")) document.getElementById("dataAtual").textContent = obterDataHoje();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js");
});
