// ========== DADOS SIMULADOS INICIAIS ==========
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
let usuarioLogado = null;
let saldo = 1000000.00;

let ativos = [
  { nome: 'PETR4', preco: 32.00 },
  { nome: 'VALE3', preco: 67.28 },
  { nome: 'ITUB4', preco: 30.01 },
  { nome: 'ABEV3', preco: 16.50 },
  { nome: 'BBDC4', preco: 22.75 },
  { nome: 'BBAS3', preco: 32.90 },
  { nome: 'BRFS3', preco: 19.80 },
  { nome: 'CIEL3', preco: 5.50 },
  { nome: 'GGBR4', preco: 29.10 },
  { nome: 'LREN3', preco: 45.30 },
  { nome: 'MGLU3', preco: 12.70 },
  { nome: 'USIM5', preco: 13.60 },
  { nome: 'WEGE3', preco: 35.40 },
  { nome: 'RADL3', preco: 24.50 },
  { nome: 'TIMS3', preco: 8.75 }
];


// ================== TRANSFERÊNCIAS ==================
let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

// ========== UTILITÁRIOS ==========
function salvarUsuarios() {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function atualizarLocalStorageUsuario() {
  const index = usuarios.findIndex(u => u.cpf === usuarioLogado.cpf);
  if (index !== -1) {
    usuarios[index] = usuarioLogado;
    salvarUsuarios();
  }
}

// ========== LOGIN ==========
function login() {
  let cpfInput = document.getElementById("cpf").value.trim();
let cpf = cpfInput.replace(/[^\d]/g, ''); // remove pontos e traço

  const senha = document.getElementById("senha").value;
  const msg = document.getElementById("loginMsg");

  const user = usuarios.find(u => u.cpf === cpf && u.senha === senha);
  if (user) {
    usuarioLogado = user;
    usuarioLogado.saldo = 1000000.00; // Resetar saldo ao logar
    msg.textContent = "";
    mostrarPortal();
  } else {
    msg.textContent = "CPF ou senha inválidos.";
  }
}

// ========== CADASTRO ==========
function mostrarCadastro() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("cadastroSection").classList.remove("hidden");
}

function mostrarLogin() {
  document.getElementById("cadastroSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}
function cadastrarUsuario() {
  const nome = document.getElementById("nome").value.trim();
  let cpfOriginal = document.getElementById("novoCpf").value.trim();
let cpf = cpfOriginal.replace(/[^\d]/g, ''); // remove . e -

// CPF precisa ter exatamente 11 dígitos
if (cpf.length !== 11) {
  msg.textContent = "CPF inválido. Deve conter 11 números.";
  return;
}

  const senha = document.getElementById("novaSenhaCadastro").value;
  const confirmar = document.getElementById("confirmaSenha").value;
  const msg = document.getElementById("cadastroMsg");
  if (!senha || !confirmar) {
    msg.textContent = "A senha e a confirmação são obrigatórias.";
    return;
  }
  
  if (senha.length < 3) {
    msg.textContent = "A senha deve ter pelo menos 3 caracteres.";
    return;
  }
  
  if (senha !== confirmar) {
    msg.textContent = "As senhas não coincidem.";
    return;
  }
  

  // Lista de nomes proibidos (minúsculos)
  const nomesProibidos = ['teste', 'admin', 'usuario', 'senha', '123456'];

  // Verifica o comprimento
  if (nome.length < 6 || nome.length > 30) {
    msg.textContent = "Usuário deve conter entre 6 e 30 caracteres.";
    return;
  }

const regexPermitido = /^[A-Za-zÀ-ú\s]+$/;
if (!regexPermitido.test(nome)) {
  msg.textContent = "Nome deve conter apenas letras e espaços, sem números ou caracteres especiais.";
  return;
}
  // Verifica nome proibido (insensível a maiúsculas)
  if (nomesProibidos.includes(nome.toLowerCase())) {
    msg.textContent = "Esse nome de usuário não é permitido.";
    return;
  }

  // Verifica se nome já existe (case sensitive)
  if (usuarios.some(u => u.nome === nome)) {
    msg.textContent = "Nome de usuário já existe.";
    return;
  }

  // Verifica senha
  if (senha !== confirmar) {
    msg.textContent = "As senhas não coincidem.";
    return;
  }

  // Verifica CPF duplicado
  if (usuarios.some(u => u.cpf === cpf)) {
    msg.textContent = "Usuário já cadastrado com esse CPF.";
    return;
  }

  // Cadastro válido
  const novoUsuario = {
    nome,
    cpf,
    senha,
    saldo: 1000000.00,
    carteira: { PETR4: 700, VALE3: 400, ITUB4: 300 },
    ordens: [],
    extrato: []
  };

  usuarios.push(novoUsuario);
  salvarUsuarios();
  msg.textContent = "Usuário cadastrado com sucesso!";
  msg.classList.remove("mensagem");
  msg.classList.add("success");
}





// ========== PORTAL ==========
function mostrarPortal() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("cadastroSection").classList.add("hidden");
  document.getElementById("portal").classList.remove("hidden");

  document.getElementById("username").textContent = usuarioLogado.nome;
  document.getElementById("saldo").textContent = usuarioLogado.saldo.toFixed(2);

  atualizarCarteira();
  atualizarBook();
  atualizarSelectAtivos();
  atualizarExtrato();
  atualizarOrdens();
}

// ========== LOGOUT ==========
function logout() {
  if (usuarioLogado) usuarioLogado.saldo = 1000000.00;
  usuarioLogado = null;
  document.getElementById("portal").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}

// ========== ATUALIZAÇÕES ==========
function atualizarCarteira() {
  const corpo = document.querySelector("#carteira tbody");
  corpo.innerHTML = "";
  for (let ativo in usuarioLogado.carteira) {
    const qtd = usuarioLogado.carteira[ativo];
    const tr = `<tr><td>${ativo}</td><td>${qtd}</td></tr>`;
    corpo.innerHTML += tr;
  }
}

function atualizarBook() {
  const corpo = document.querySelector("#book tbody");
  corpo.innerHTML = "";
  ativos.forEach(a => {
    const precoAnterior = parseFloat(localStorage.getItem(`precoAnterior_${a.nome}`)) || a.preco;
    const variacao = a.preco - precoAnterior;
    const classe = variacao > 0 ? "alta" : variacao < 0 ? "baixa" : "";

    localStorage.setItem(`precoAnterior_${a.nome}`, a.preco);

    const tr = `<tr><td>${a.nome}</td><td class="book-preco ${classe}">${a.preco.toFixed(2)}</td></tr>`;
    corpo.innerHTML += tr;
  });
}

function atualizarSelectAtivos() {
  const select = document.getElementById("ativo");
  select.innerHTML = "";
  ativos.forEach(a => {
    const option = document.createElement("option");
    option.value = a.nome;
    option.textContent = a.nome;
    select.appendChild(option);
  });
}

function atualizarExtrato() {
  const corpo = document.querySelector("#extrato tbody");
  corpo.innerHTML = "";
  usuarioLogado.extrato.forEach(e => {
    const tr = `<tr><td>${e.tipo}</td><td>${e.ativo}</td><td>${e.qtd}</td><td>${(e.qtd * e.valor).toFixed(2)}</td></tr>`;
    corpo.innerHTML += tr;
  });
}

function atualizarOrdens() {
  const corpo = document.querySelector("#ordens tbody");
  corpo.innerHTML = "";
  usuarioLogado.ordens.forEach((o, i) => {
    const tr = `<tr><td>${o.tipo}</td><td>${o.ativo}</td><td>${o.qtd}</td><td>${o.valor.toFixed(2)}</td><td>${o.cotacao.toFixed(2)}</td><td>${o.status}</td><td><button onclick="cancelarOrdem(${i})">Cancelar</button></td></tr>`;
    corpo.innerHTML += tr;
  });
}

// ========== OPERAÇÕES ==========
function executarOperacao() {
  const tipo = document.getElementById("tipo").value;
  const ativo = document.getElementById("ativo").value;
  const qtd = parseInt(document.getElementById("quantidade").value);
  const valor = parseFloat(document.getElementById("valor").value);
  const msg = document.getElementById("mensagem");

  if (!ativo || isNaN(qtd) || qtd <= 0 || isNaN(valor) || valor <= 0) {
    msg.textContent = "Preencha todos os campos corretamente.";
    return;
  }

  if (qtd % 100 !== 0) {
    msg.textContent = "A quantidade deve ser múltipla de 100 (lote padrão).";
    return;
  }

  const cotacao = ativos.find(a => a.nome === ativo)?.preco || 0;
  const total = qtd * valor;
  const diferenca = Math.abs(valor - cotacao);
  let status = "";

  if (diferenca > 5) {
    status = "Rejeitado";
    msg.textContent = "Ordem rejeitada. Diferença superior a R$5 da cotação.";
  } else if (diferenca === 0) {
    status = "Executado";
  } else {
    status = "Aceito";
  }

  if (tipo === "Compra") {
    if (usuarioLogado.saldo < total) {
      msg.textContent = "Saldo insuficiente.";
      return;
    }
    if (status === "Executado") {
      usuarioLogado.saldo -= total;
      usuarioLogado.carteira[ativo] = (usuarioLogado.carteira[ativo] || 0) + qtd;
      usuarioLogado.extrato.push({ tipo, ativo, qtd, valor });
      msg.textContent = "Ordem executada com sucesso!";
    } else {
      msg.textContent = (status === "Aceito")
        ? "Ordem aceita e aguardando execução."
        : msg.textContent;
    }
  } else { // Venda
    if (!usuarioLogado.carteira[ativo] || usuarioLogado.carteira[ativo] < qtd) {
      msg.textContent = "Quantidade insuficiente na carteira.";
      return;
    }
    if (status === "Executado") {
      usuarioLogado.carteira[ativo] -= qtd;
      usuarioLogado.saldo += total;
      usuarioLogado.extrato.push({ tipo, ativo, qtd, valor });
      msg.textContent = "Ordem executada com sucesso!";
    } else {
      msg.textContent = (status === "Aceito")
        ? "Ordem aceita e aguardando execução."
        : msg.textContent;
    }
  }

  usuarioLogado.ordens.push({
    tipo,
    ativo,
    qtd,
    valor,
    cotacao,
    status
  });

  atualizarCarteira();
  atualizarExtrato();
  atualizarOrdens();
  document.getElementById("saldo").textContent = usuarioLogado.saldo.toFixed(2);
  atualizarLocalStorageUsuario();
}

function cancelarOrdem(index) {
  const ordem = usuarioLogado.ordens[index];
  const msg = document.getElementById("mensagem");
  if (ordem.status === "Aceito") {
    ordem.status = "Cancelada";
    atualizarOrdens();
    atualizarLocalStorageUsuario();
    msg.textContent = "Ordem cancelada com sucesso!";
  } else {
    msg.textContent = "Só é possível cancelar ordens com status 'Aceito'.";
  }
}

// ========== ESQUECI SENHA ==========
function esqueciSenha() {
  let cpf = prompt("Digite o CPF cadastrado:");
  if (!cpf) {
    alert("CPF inválido.");
    return;
  }
  cpf = cpf.replace(/[^\d]/g, ''); // limpar o CPF

  const usuario = usuarios.find(u => u.cpf === cpf);

  if (!usuario) {
    alert("CPF não encontrado.");
    return;
  }

  const novaSenha = prompt("Digite a nova senha:");
  if (!novaSenha || novaSenha.length < 3) {
    alert("Senha inválida. Tente novamente.");
    return;
  }

  usuario.senha = novaSenha;
  salvarUsuarios();
  alert("Senha redefinida com sucesso! Faça o login com a nova senha.");
}


// ========== TRANSFERÊNCIAS ==========

function mostrarTransferencia() {
  document.getElementById('portal').classList.add('hidden');
  document.getElementById('transferSection').classList.remove('hidden');
  listarAgendamentos();
}

function voltarPortal() {
  document.getElementById('transferSection').classList.add('hidden');
  document.getElementById('portal').classList.remove('hidden');
}

document.getElementById('agendar').addEventListener('change', function(){
  document.getElementById('agendamentoCampos').classList.toggle('hidden', !this.checked);
});

// Função para validar dados da transferência
function validarTransferencia(banco, agencia, conta, cidade, estado) {
  if (!banco || banco.trim().length < 3) return 'Informe um banco válido.';
  if (!/^\d{3,5}$/.test(agencia)) return 'Agência inválida.';
  if (!/^\d{4,10}(-\d+)?$/.test(conta)) return 'Conta inválida.'; // regex atualizada
  if (!cidade || cidade.trim().length < 2) return 'Cidade inválida.';
  if (!estado || !/^[A-Z]{2}$/.test(estado)) return 'Estado inválido (use sigla, ex: SP).';
  return null;
}

function realizarTransferencia() {
  const banco = document.getElementById('banco').value.trim();
  const agencia = document.getElementById('agencia').value.trim();
  const conta = document.getElementById('contaDestino').value.trim();
  const cidade = document.getElementById('cidade').value.trim();
  const estado = document.getElementById('estado').value.trim().toUpperCase();

  const valor = parseFloat(document.getElementById('valorTransferencia').value);
  const agendar = document.getElementById('agendar').checked;
  const dataHora = document.getElementById('dataHora').value;
  const repetir = document.getElementById('repetirMes').value;
  const msg = document.getElementById('transferMsg');

  msg.textContent = "";

  // Validação dos dados da transferência
  const erroValidacao = validarTransferencia(banco, agencia, conta, cidade, estado);
  if (erroValidacao) {
    msg.textContent = erroValidacao;
    return;
  }

  if (isNaN(valor) || valor <= 0) {
    msg.textContent = "Informe um valor válido para transferência.";
    return;
  }

  if (agendar) {
    if (!dataHora) {
      msg.textContent = "Informe data e hora para agendamento.";
      return;
    }
    const dt = new Date(dataHora);
    if (dt < new Date()) {
      msg.textContent = "Data/hora inválida (deve ser futura).";
      return;
    }
    const ag = {
      banco,
      agencia,
      conta,
      cidade,
      estado,
      valor,
      dataHora,
      repetir,
      status: 'Pendente'
    };
    agendamentos.push(ag);
    salvarAgendamentos();
    msg.textContent = "✅ Transferência agendada!";
    listarAgendamentos();
    return;
  }

  if (usuarioLogado.saldo < valor) {
    msg.textContent = "Saldo insuficiente.";
    return;
  }

  document.getElementById('loader').classList.remove('hidden');
  setTimeout(() => {
    usuarioLogado.saldo -= valor;
    atualizarLocalStorageUsuario();
    document.getElementById('saldo').textContent = usuarioLogado.saldo.toFixed(2);
    document.getElementById('loader').classList.add('hidden');
    msg.textContent = "✅ Transferência realizada com sucesso!";
  }, 1500);
}

function listarAgendamentos() {
  const corpo = document.querySelector('#tabelaAgendamentos tbody');
  corpo.innerHTML = "";
  agendamentos.forEach((ag, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ag.banco || '-'}</td>
      <td>${ag.agencia || '-'}</td>
      <td>${ag.conta}</td>
      <td>${ag.cidade || '-'}</td>
      <td>${ag.estado || '-'}</td>
      <td>${ag.valor.toFixed(2)}</td>
      <td>${ag.dataHora}</td>
      <td>${ag.repetir}</td>
      <td>${ag.status}</td>
      <td>${ag.status === 'Pendente' ? `<button onclick="cancelarAgendamento(${i})">Cancelar</button>` : ''}</td>
    `;
    corpo.appendChild(tr);
  });
}

function cancelarAgendamento(i) {
  if (agendamentos[i].status === 'Pendente') {
    agendamentos[i].status = 'Cancelado';
    salvarAgendamentos();
    listarAgendamentos();
  }
}

function salvarAgendamentos() {
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

// ========== ATUALIZAÇÃO DE BOOK AO VIVO ==========
setInterval(() => {
  ativos.forEach(ativo => {
    // Escolhe +0.01 ou -0.01 aleatoriamente
    const variacao = Math.random() < 0.5 ? 0.01 : -0.01;
    ativo.preco = Math.max(1, (ativo.preco + variacao).toFixed(2));
  });
  if (usuarioLogado) atualizarBook();
}, 10000);  // a cada 10 segundos

//========ATUALIZAÇÃO DO CADASTRO COM REGRA
const nomesProibidos = ['teste', 'admin', 'usuario', 'senha', '123456'];


