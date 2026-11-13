// Mini-demonstração do caesi-help: chat simulado, sem backend e sem API.
// Edite as perguntas e respostas aqui. Trechos entre colchetes começando
// com [PREENCHER aparecem destacados em amarelo no site.
(function () {
  "use strict";

  var PERGUNTAS = [
    {
      pergunta: "Como faço pra trancar uma disciplina?",
      resposta: "Os prazos mudam a cada semestre. Confira o calendário acadêmico da UFCG e, na dúvida, fale com a coordenação do curso."
    },
    {
      pergunta: "Quando abre a matrícula?",
      resposta: "As datas saem no calendário acadêmico do semestre. Vale ficar de olho nos avisos da coordenação e do CAESI."
    },
    {
      pergunta: "Como aproveito horas complementares?",
      resposta: "As regras estão nos documentos do curso. Guarde os certificados e confira com a coordenação o que conta como hora complementar."
    },
    {
      pergunta: "Quem procuro pra pedir dispensa de disciplina?",
      resposta: "Comece pela coordenação do curso, que explica o processo e os documentos necessários."
    }
  ];

  var VELOCIDADE = 18; // ms por caractere

  var caixa = document.getElementById("chat-mensagens");
  var grupo = document.getElementById("chat-perguntas");
  if (!caixa || !grupo) return;

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ocupado = false;
  var botoes = [];

  PERGUNTAS.forEach(function (item) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chat__pergunta";
    b.textContent = item.pergunta;
    b.addEventListener("click", function () { responder(item); });
    grupo.appendChild(b);
    botoes.push(b);
  });

  function mensagem(classe) {
    var p = document.createElement("p");
    p.className = "msg " + classe;
    caixa.appendChild(p);
    caixa.scrollTop = caixa.scrollHeight;
    return p;
  }

  // Divide a resposta em trechos normais e marcadores [PREENCHER...]
  function trechos(texto) {
    return texto.split(/(\[PREENCHER[^\]]*\])/).filter(Boolean).map(function (t) {
      return { texto: t, todo: /^\[PREENCHER/.test(t) };
    });
  }

  function montar(alvo, partes, completo) {
    partes.forEach(function (parte) {
      var el = parte.todo ? document.createElement("mark") : document.createElement("span");
      if (parte.todo) el.className = "todo";
      el.textContent = completo ? parte.texto : "";
      parte.el = el;
      alvo.appendChild(el);
    });
  }

  function responder(item) {
    if (ocupado) return;
    ocupado = true;
    botoes.forEach(function (b) { b.disabled = true; });

    mensagem("msg--eu").textContent = item.pergunta;

    var bot = mensagem("msg--bot");
    var partes = trechos(item.resposta);

    // Texto completo para leitores de tela; a digitação é só visual.
    var leitor = document.createElement("span");
    leitor.className = "sr-only";
    leitor.textContent = item.resposta;
    bot.appendChild(leitor);

    var visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    bot.appendChild(visual);

    if (reduzido) {
      montar(visual, partes, true);
      terminar();
      return;
    }

    montar(visual, partes, false);
    var i = 0, j = 0;
    (function passo() {
      if (i >= partes.length) { terminar(); return; }
      var parte = partes[i];
      var chars = Array.from(parte.texto);
      j++;
      parte.el.textContent = chars.slice(0, j).join("");
      caixa.scrollTop = caixa.scrollHeight;
      if (j >= chars.length) { i++; j = 0; }
      setTimeout(passo, VELOCIDADE);
    })();

    function terminar() {
      ocupado = false;
      botoes.forEach(function (b) { b.disabled = false; });
      caixa.scrollTop = caixa.scrollHeight;
    }
  }
})();
