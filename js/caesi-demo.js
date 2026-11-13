// Mini-demonstração do caesi-help: chat simulado, sem backend e sem API.
// Edite as perguntas e respostas aqui. Trechos entre colchetes começando
// com [PREENCHER aparecem destacados em amarelo no site.
(function () {
  "use strict";

  var PERGUNTAS = [
    {
      pergunta: "Como faço pra trancar uma disciplina?",
      resposta: "[PREENCHER: resposta sobre trancamento de disciplina, prazos e onde pedir]"
    },
    {
      pergunta: "Quando abre a matrícula?",
      resposta: "[PREENCHER: resposta sobre o período de matrícula e onde acompanhar o calendário]"
    },
    {
      pergunta: "Como aproveito horas complementares?",
      resposta: "[PREENCHER: resposta sobre como registrar e aproveitar horas complementares]"
    },
    {
      pergunta: "Quem procuro pra pedir dispensa de disciplina?",
      resposta: "[PREENCHER: resposta sobre dispensa de disciplina e quem procurar]"
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
