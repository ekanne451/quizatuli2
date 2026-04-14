// =============================================
//  QuizCaju — app.js
//  Construído ao vivo / tasks semana 1.
// =============================================


// ------------------------------------------------------------
// 1. ESTADO
// ------------------------------------------------------------

const estado = {
    jogadorAtual: null,
    pontuacao: 0,
    perguntasJogo: [],
    indiceAtual: 0,
    acertos: 0,
    erros: 0,
    timerSegundos: 20,
    timerInterval: null,
    respondeu: false,
};

// ------------------------------------------------------------
// 2. REFERÊNCIAS DAS TELAS
// ------------------------------------------------------------

const telas = {
    home: document.getElementById("tela-home"),
    questao: document.getElementById("tela-questao"),
    feedback: document.getElementById("tela-feedback"),
    resultado: document.getElementById("tela-resultado"),
};

// ------------------------------------------------------------
// 3. REFERÊNCIAS DO DOM
// ------------------------------------------------------------

const els = {
    // home
    inputNickname: document.getElementById("input-nickname"),
    erroNickname: document.getElementById("erro-nickname"),
    btnIniciar: document.getElementById("btn-iniciar"),
    totalPerguntas: document.getElementById("total-perguntas"),
    totalCategorias: document.getElementById("total-categorias"),

    // questão
    questaoAtual: document.getElementById("questao-atual"),
    questaoTotal: document.getElementById("questao-total"),
    barraFill: document.getElementById("barra-fill"),
    timerArco: document.getElementById("timer-arco"),
    timerNum: document.getElementById("timer-num"),
    categoriaTag: document.getElementById("categoria-tag"),
    questaoTexto: document.getElementById("questao-texto"),
    opcoesGrid: document.getElementById("opcoes-grid"),

    // feedback
    feedbackIcone: document.getElementById("feedback-icone"),
    feedbackTitulo: document.getElementById("feedback-titulo"),
    feedbackExplic: document.getElementById("feedback-explicacao"),
    feedbackPontos: document.getElementById("feedback-pontos"),
    placarParcial: document.getElementById("placar-parcial"),
    btnProxima: document.getElementById("btn-proxima"),

    // resultado
    resultadoMedalha: document.getElementById("resultado-medalha"),
    resultadoNome: document.getElementById("resultado-nome"),
    scoreFinal: document.getElementById("score-final"),
    statAcertos: document.getElementById("stat-acertos"),
    statErros: document.getElementById("stat-erros"),
    statPorcento: document.getElementById("stat-porcento"),
    resultadoMsg: document.getElementById("resultado-mensagem"),
    btnJogarNovamente: document.getElementById("btn-jogar-novamente"),
};


// ------------------------------------------------------------
// 4. FUNÇÕES UTILITÁRIAS
// ------------------------------------------------------------

// mostrarTela(nomeTela)
// Remove "ativa" de todas as telas e adiciona só na escolhida.
function mostrarTela(nomeTela) {
    Object.values(telas).forEach(tela => {
        tela.classList.remove("ativa");
    });
    telas[nomeTela].classList.add("ativa");
}


// embaralhar(array)
// Retorna uma cópia embaralhada do array recebido (Fisher-Yates).
function embaralhar(array) {
    const copia = array.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}


// calcularPontos(segundosRestantes)
// Retorna: 500 + (segundosRestantes * 25)
function calcularPontos(segundosRestantes) {
    return 500 + (segundosRestantes * 25);
}


// ------------------------------------------------------------
// 5. LÓGICA DO JOGO
// ------------------------------------------------------------

// iniciarJogo()
// Valida nickname (mínimo 2 chars).
// Reseta o estado. Embaralha as perguntas.
// Chama mostrarTela("questao") e mostrarPergunta().
function iniciarJogo() {
    const nickname = els.inputNickname.value.trim();
    
    if (nickname.length < 2) {
        els.erroNickname.textContent = "Digite pelo menos 2 caracteres";
        return;
    }
    
    els.erroNickname.textContent = "";
    
    // Reseta o estado
    estado.jogadorAtual = nickname;
    estado.pontuacao = 0;
    estado.indiceAtual = 0;
    estado.acertos = 0;
    estado.erros = 0;
    estado.perguntasJogo = embaralhar(perguntas);
    
    mostrarTela("questao");
    mostrarPergunta();
}


// mostrarPergunta()
// Pega estado.perguntasJogo[estado.indiceAtual].
// Atualiza progresso, categoria e texto no DOM.
// Limpa opcoes-grid e cria os botões com createElement.
function mostrarPergunta() {
    const pergunta = estado.perguntasJogo[estado.indiceAtual];
    const total = estado.perguntasJogo.length;
    
    estado.respondeu = false;
    
    // Atualiza progresso
    els.questaoAtual.textContent = estado.indiceAtual + 1;
    els.questaoTotal.textContent = total;
    els.barraFill.style.width = ((estado.indiceAtual + 1) / total * 100) + "%";
    
    // Atualiza categoria e texto
    els.categoriaTag.textContent = pergunta.categoria;
    els.questaoTexto.textContent = pergunta.pergunta;
    
    // Limpa e cria opções
    els.opcoesGrid.innerHTML = "";
    const letras = ["A", "B", "C", "D"];
    
    for (let i = 0; i < pergunta.opcoes.length; i++) {
        const btn = document.createElement("button");
        btn.className = "opcao-btn";
        btn.innerHTML = `
            <span class="opcao-letra">${letras[i]}</span>
            <span class="opcao-texto">${pergunta.opcoes[i]}</span>
        `;
        btn.addEventListener("click", () => responder(i));
        els.opcoesGrid.appendChild(btn);
    }
    
    iniciarTimer();
}


// iniciarTimer()
// Reseta timerSegundos para 20.
// clearInterval antes de criar um novo setInterval.
function iniciarTimer() {
    estado.timerSegundos = 20;
    els.timerNum.textContent = estado.timerSegundos;
    els.timerArco.style.strokeDashoffset = 0;
    
    if (estado.timerInterval) {
        clearInterval(estado.timerInterval);
    }
    
    estado.timerInterval = setInterval(() => {
        estado.timerSegundos--;
        els.timerNum.textContent = estado.timerSegundos;
        
        // Atualiza o arco SVG (107 é o comprimento total)
        const offset = 107 - (estado.timerSegundos / 20 * 107);
        els.timerArco.style.strokeDashoffset = offset;
        
        if (estado.timerSegundos <= 0) {
            clearInterval(estado.timerInterval);
            responder(-1); // Tempo esgotado
        }
    }, 1000);
}


// responder(indiceEscolhido)
// Guarda de segurança: if (estado.respondeu) return.
// clearInterval do timer.
// Compara indiceEscolhido com pergunta.correta.
function responder(indiceEscolhido) {
    if (estado.respondeu) return;
    estado.respondeu = true;
    
    clearInterval(estado.timerInterval);
    
    const pergunta = estado.perguntasJogo[estado.indiceAtual];
    const botoes = els.opcoesGrid.querySelectorAll(".opcao-btn");
    const acertou = indiceEscolhido === pergunta.correta;
    
    // Desabilita todos os botões
    botoes.forEach((btn, index) => {
        btn.disabled = true;
        if (index === pergunta.correta) {
            btn.classList.add("correta");
        } else if (index === indiceEscolhido && !acertou) {
            btn.classList.add("errada");
        }
    });
    
    // Calcula pontos
    let pontosGanhos = 0;
    if (acertou) {
        pontosGanhos = calcularPontos(estado.timerSegundos);
        estado.pontuacao += pontosGanhos;
        estado.acertos++;
    } else {
        estado.erros++;
    }
    
    // Mostra feedback após 1 segundo
    setTimeout(() => {
        mostrarFeedback(acertou, pontosGanhos, pergunta.explicacao);
    }, 1000);
}


// mostrarFeedback(acertou, pontosGanhos, explicacao)
// Atualiza ícone, título, pontos e explicação.
function mostrarFeedback(acertou, pontosGanhos, explicacao) {
    if (acertou) {
        els.feedbackIcone.textContent = "✅";
        els.feedbackTitulo.textContent = "Correto!";
        els.feedbackTitulo.className = "feedback-titulo acerto";
    } else {
        els.feedbackIcone.textContent = "❌";
        els.feedbackTitulo.textContent = "Errado!";
        els.feedbackTitulo.className = "feedback-titulo erro";
    }
    
    els.feedbackExplic.textContent = explicacao;
    els.feedbackPontos.textContent = "+" + pontosGanhos;
    els.placarParcial.textContent = estado.pontuacao;
    
    mostrarTela("feedback");
}


// proximaPergunta()
// indiceAtual++
// Se ainda há perguntas → mostrarPergunta().
// Senão → mostrarResultado().
function proximaPergunta() {
    estado.indiceAtual++;
    
    if (estado.indiceAtual < estado.perguntasJogo.length) {
        mostrarTela("questao");
        mostrarPergunta();
    } else {
        mostrarResultado();
    }
}


// mostrarResultado()
// Calcula aproveitamento. Define medalha e mensagem.
// Atualiza DOM da tela de resultado.
function mostrarResultado() {
    const total = estado.perguntasJogo.length;
    const porcento = Math.round((estado.acertos / total) * 100);
    
    // Define medalha e mensagem baseado no desempenho
    let medalha, mensagem;
    if (porcento >= 90) {
        medalha = "🏆";
        mensagem = "Incrível! Você é um mestre!";
    } else if (porcento >= 70) {
        medalha = "🥇";
        mensagem = "Muito bem! Excelente desempenho!";
    } else if (porcento >= 50) {
        medalha = "🥈";
        mensagem = "Bom trabalho! Continue praticando!";
    } else if (porcento >= 30) {
        medalha = "🥉";
        mensagem = "Você consegue melhorar! Tente novamente!";
    } else {
        medalha = "📚";
        mensagem = "Hora de estudar mais! Não desista!";
    }
    
    els.resultadoMedalha.textContent = medalha;
    els.resultadoNome.textContent = estado.jogadorAtual;
    els.scoreFinal.textContent = estado.pontuacao;
    els.statAcertos.textContent = estado.acertos;
    els.statErros.textContent = estado.erros;
    els.statPorcento.textContent = porcento + "%";
    els.resultadoMsg.textContent = mensagem;
    
    mostrarTela("resultado");
}


// reiniciarJogo()
// Limpa o campo de nickname.
// Chama mostrarTela("home").
function reiniciarJogo() {
    els.inputNickname.value = "";
    mostrarTela("home");
}


// ------------------------------------------------------------
// 6. EVENTOS
// ------------------------------------------------------------

els.btnIniciar.addEventListener("click", iniciarJogo);

els.inputNickname.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        iniciarJogo();
    }
});

els.btnProxima.addEventListener("click", proximaPergunta);

els.btnJogarNovamente.addEventListener("click", reiniciarJogo);


// ------------------------------------------------------------
// 7. INICIALIZAÇÃO
// ------------------------------------------------------------

function init() {
    // Preenche totalPerguntas
    els.totalPerguntas.textContent = perguntas.length;
    
    // Calcula categorias únicas
    const categoriasUnicas = [...new Set(perguntas.map(p => p.categoria))];
    els.totalCategorias.textContent = categoriasUnicas.length;
}

// Chama init quando a página carregar
init()