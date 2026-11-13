// Portfólio da Rebeca · caminhada ligada ao scroll, cenas, balões, mini-mapa.
// Todo o texto está no HTML; este arquivo só cuida do movimento.
(function () {
  "use strict";

  var html = document.documentElement;
  html.classList.add("js");

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mqMovel = window.matchMedia("(max-width: 759px)");

  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var andarilha = $("#andarilha");
  var sprite = $("#rebeca-sprite");
  var rebeca = $("#rebeca");
  var mapaPonto = $("#mapa-ponto");
  var trilha = $("#trilha");
  var caminho = $("#trilha-caminho");
  var principal = $("main");
  var quadrinhos = Array.prototype.slice.call(document.querySelectorAll(".quadrinho"));
  var secMala = $('[data-modo="mala"]');
  var secCostas = $('[data-modo="costas"]');

  var QUADROS = 7;          // quadros no sprite
  var PX_POR_QUADRO = 22;   // pixels rolados por quadro
  var QUADRO_PARADO = 0;    // quadro "de pé"
  var ALTURA_REBECA = 0.55; // posição vertical da Rebeca na tela (fração da altura)
  var VELOCIDADE = 30;      // ms por caractere nos balões

  var ROSTO_ALT = {
    neutro: "Rebeca com expressão neutra",
    piscadinha: "Rebeca dando uma piscadinha",
    pensando: "Rebeca pensativa, com a mão no queixo",
    rindo: "Rebeca rindo",
    surpresa: "Rebeca surpresa, de boca aberta",
    "mao-no-rosto": "Rebeca com a mão no rosto"
  };

  /* ---------------- Balões com efeito de digitação ---------------- */

  function digitar(balao) {
    if (balao.dataset.digitado) return;
    balao.dataset.digitado = "1";
    if (reduzido) { disparar(balao); return; }

    var span = $(".balao__texto", balao);
    var texto = span.textContent;
    var chars = Array.from(texto);

    // O texto completo continua no DOM para leitores de tela.
    span.classList.add("sr-only");
    var visual = document.createElement("span");
    visual.className = "balao__digitado";
    visual.setAttribute("aria-hidden", "true");
    balao.appendChild(visual);
    balao.classList.add("balao--digitando");

    var i = 0, timer;
    function passo() {
      i++;
      visual.textContent = chars.slice(0, i).join("");
      if (i < chars.length) timer = setTimeout(passo, VELOCIDADE);
      else fim();
    }
    function fim() {
      clearTimeout(timer);
      visual.textContent = texto;
      balao.classList.remove("balao--digitando");
      balao.removeEventListener("click", fim);
      balao.removeEventListener("keydown", tecla);
      disparar(balao);
    }
    function tecla(e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fim(); }
    }
    balao.addEventListener("click", fim);
    balao.addEventListener("keydown", tecla);
    passo();
  }

  // Ao terminar a fala, troca o rosto se a cena pedir (data-rosto-depois).
  function disparar(balao) {
    var q = balao.closest(".quadrinho");
    var depois = q && q.dataset.rostoDepois;
    if (!depois) return;
    var avatar = $(".avatar", q);
    avatar.src = "assets/rebeca/rosto-" + depois + ".webp";
    avatar.alt = ROSTO_ALT[depois] || "";
  }

  /* ---------------- Ativação dos quadrinhos ---------------- */

  var ativo = null;

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      var q = e.target;
      if (e.isIntersecting) {
        q.classList.add("quadrinho--visto");
        ativo = q;
        var balao = $(".balao", q);
        if (balao) digitar(balao);
      } else if (ativo === q) {
        ativo = null;
      }
    });
    agendar();
  }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });

  quadrinhos.forEach(function (q) { observador.observe(q); });

  /* ---------------- Caminho tracejado ---------------- */

  var amostrasX = [], amostrasY = [];
  var alturaDoc = 0, vh = window.innerHeight, largRebeca = 0;

  function construirTrilha() {
    vh = window.innerHeight;
    alturaDoc = html.scrollHeight;
    if (reduzido) return; // sem caminhada: só o mini-mapa usa estas medidas
    largRebeca = andarilha.offsetWidth;
    trilha.setAttribute("width", window.innerWidth);
    trilha.setAttribute("height", alturaDoc);
    trilha.style.height = alturaDoc + "px";

    if (mqMovel.matches) {
      var xm = 38;
      caminho.setAttribute("d", "M" + xm + " 0 V" + alturaDoc);
      amostrasX = [xm, xm];
      amostrasY = [0, alturaDoc];
      return;
    }

    var r = principal.getBoundingClientRect();
    var cs = getComputedStyle(principal);
    var colEsq = r.left + parseFloat(cs.paddingLeft);
    var colLarg = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var y0 = window.scrollY;

    var pontos = [];
    quadrinhos.forEach(function (q) {
      if (q.closest('[data-modo="sumiu"]')) return; // no contato ela já foi embora
      var rebecaEsq = q.classList.contains("quadrinho--dir"); // quadrinho à direita → Rebeca à esquerda
      var afast = q.classList.contains("quadrinho--largo") ? 0.08
        : q.classList.contains("quadrinho--abertura") ? 0.12 : 0.22;
      var x = Math.round(colEsq + colLarg * (rebecaEsq ? afast : 1 - afast));
      var qr = q.getBoundingClientRect();
      pontos.push([x, Math.round(qr.top + y0)], [x, Math.round(qr.bottom + y0)]);
    });

    var d = "M" + pontos[0][0] + " 0";
    for (var i = 0; i < pontos.length; i++) {
      var p = pontos[i];
      if (i > 0 && pontos[i - 1][0] !== p[0]) {
        var meio = (pontos[i - 1][1] + p[1]) / 2;
        d += " C" + pontos[i - 1][0] + " " + meio + " " + p[0] + " " + meio + " " + p[0] + " " + p[1];
      } else {
        d += " L" + p[0] + " " + p[1];
      }
    }
    caminho.setAttribute("d", d);

    // Amostra o caminho para achar x a partir de y rapidamente.
    var total = caminho.getTotalLength();
    var N = 600;
    amostrasX = []; amostrasY = [];
    for (var k = 0; k <= N; k++) {
      var pt = caminho.getPointAtLength(total * k / N);
      amostrasX.push(pt.x); amostrasY.push(pt.y);
    }
  }

  function xNoCaminho(y) {
    var fim = amostrasY.length - 1;
    if (fim < 1) return 0;
    if (y <= amostrasY[0]) return amostrasX[0];
    if (y >= amostrasY[fim]) return amostrasX[fim];
    var lo = 0, hi = fim;
    while (hi - lo > 1) {
      var m = (lo + hi) >> 1;
      if (amostrasY[m] <= y) lo = m; else hi = m;
    }
    var t = (y - amostrasY[lo]) / ((amostrasY[hi] - amostrasY[lo]) || 1);
    return amostrasX[lo] + (amostrasX[hi] - amostrasX[lo]) * t;
  }

  /* ---------------- Loop ligado ao scroll ---------------- */

  var ultimoY = window.scrollY, pedido = false, timerParada;
  var rolando = false, quadroAtual = -1, modoAtual = "";
  var distancia = 0;      // distância total rolada (alvo dos passos)
  var fase = 0;           // distância "andada" pela Rebeca, persegue o alvo com suavidade
  var xAtual = null;      // posição horizontal suavizada
  var direcao = 1;        // 1 = olhando para a direita, -1 = para a esquerda

  function agendar() {
    if (!pedido) { pedido = true; requestAnimationFrame(atualizar); }
  }

  function progressoAbaixo(el, alcance) {
    // 0 quando a base do elemento está na altura da Rebeca, 1 depois de "alcance" px
    var r = el.getBoundingClientRect();
    return clamp((vh * ALTURA_REBECA - r.bottom) / alcance, 0, 1);
  }

  function olhar(d) {
    if (d === direcao) return;
    direcao = d;
    andarilha.classList.toggle("andarilha--voltando", d < 0);
  }

  function atualizar() {
    pedido = false;
    var y = window.scrollY;
    var delta = y - ultimoY;
    ultimoY = y;

    atualizarMapa(y);
    if (reduzido) return;

    var continuar = false;

    // Passos: avançam pela distância rolada (nos dois sentidos), sem depender do tempo.
    distancia += Math.abs(delta);
    if (distancia - fase > PX_POR_QUADRO * QUADROS) fase = distancia - PX_POR_QUADRO * QUADROS;
    fase += (distancia - fase) * 0.25;
    if (distancia - fase < 0.5) fase = distancia; else continuar = true;

    // Posição horizontal ao longo do caminho, com um leve atraso para não "teletransportar"
    var yRebeca = y + vh * ALTURA_REBECA;
    var alvoX = xNoCaminho(yRebeca) - largRebeca / 2;
    if (xAtual === null) xAtual = alvoX;
    var xAntes = xAtual;
    xAtual += (alvoX - xAtual) * 0.2;
    if (Math.abs(alvoX - xAtual) < 0.3) xAtual = alvoX; else continuar = true;
    if (fase === distancia && Math.abs(xAtual - xAntes) > 0.5) { distancia += Math.abs(xAtual - xAntes); continuar = true; }
    andarilha.style.setProperty("--x", xAtual.toFixed(1) + "px");

    // Ela anda enquanto se desloca e para de pé quando a rolagem termina
    var andando = fase !== distancia || Math.abs(alvoX - xAtual) > 2;

    // Para onde olhar
    var dx = xAtual - xAntes;
    if (Math.abs(dx) > 0.4) {
      olhar(dx > 0 ? 1 : -1);
    } else if (!andando && ativo && !mqMovel.matches) {
      olhar(ativo.classList.contains("quadrinho--esq") ? -1 : 1); // de frente para o quadrinho
    } else if (delta !== 0) {
      olhar(delta < 0 ? -1 : 1);
    }

    // Quadro do sprite e um balanço sutil a cada passo
    var ciclo = fase / (PX_POR_QUADRO * QUADROS);
    var quadro = andando ? Math.floor(fase / PX_POR_QUADRO) % QUADROS : QUADRO_PARADO;
    if (quadro !== quadroAtual) {
      quadroAtual = quadro;
      sprite.style.setProperty("--quadro", quadro);
    }
    var bob = andando ? -Math.abs(Math.sin(ciclo * Math.PI * 2)) * 3 : 0;
    andarilha.style.setProperty("--bob", bob.toFixed(2) + "px");

    // Modos especiais: mala (cena 3), costas (fim da cena 10), sumiu (contato)
    var modo = "";
    if (secMala) {
      var rm = secMala.getBoundingClientRect();
      var topo = rm.top + y, base = rm.bottom + y;
      if (yRebeca >= topo && yRebeca <= base) {
        modo = "mala";
        var p = (yRebeca - topo) / (base - topo);
        andarilha.style.setProperty("--desliza", ((p - 0.5) * (mqMovel.matches ? 16 : 60)).toFixed(1) + "px");
      }
    }
    if (secCostas) {
      var pc = progressoAbaixo($(".quadrinho", secCostas), vh * 0.5);
      if (pc >= 1) {
        modo = "sumiu";
      } else if (pc > 0) {
        modo = "costas";
        andarilha.style.setProperty("--sobe", (-pc * vh * 0.35).toFixed(1) + "px");
        andarilha.style.setProperty("--escala", (1 - pc * 0.45).toFixed(3));
      }
    }
    if (modo !== "costas") {
      andarilha.style.setProperty("--sobe", "0px");
      andarilha.style.setProperty("--escala", "1");
    }
    if (modo !== modoAtual) {
      modoAtual = modo;
      andarilha.classList.toggle("andarilha--mala", modo === "mala");
      andarilha.classList.toggle("andarilha--costas", modo === "costas");
      andarilha.classList.toggle("andarilha--escondida", modo === "sumiu");
      rebeca.tabIndex = modo === "sumiu" ? -1 : 0;
    }

    if (continuar) agendar();
  }

  /* ---------------- Mini-mapa: Floriano → Campina Grande ---------------- */

  var mapaTrilho = mapaPonto.parentNode;

  function atualizarMapa(y) {
    var fim = Math.max(1, alturaDoc - vh);
    var s = clamp(y / fim, 0, 1);
    var p = s;
    if (secMala) {
      var rm = secMala.getBoundingClientRect();
      var sTopo = clamp((rm.top + y - vh * ALTURA_REBECA) / fim, 0.01, 0.99);
      var sBase = clamp((rm.bottom + y - vh * ALTURA_REBECA) / fim, sTopo + 0.01, 1);
      if (s < sTopo) p = 0.4 * s / sTopo;
      else if (s < sBase) p = 0.4 + 0.2 * (s - sTopo) / (sBase - sTopo);
      else p = 0.6 + 0.4 * (s - sBase) / (1 - sBase);
    }
    var curso = mapaTrilho.clientWidth - mapaPonto.offsetWidth;
    mapaPonto.style.transform = "translateX(" + (p * curso).toFixed(1) + "px)";
  }

  /* ---------------- Easter egg: clique na Rebeca ---------------- */

  var reacao = $("#reacao"), reacaoRosto = $("#reacao-rosto"), reacaoTexto = $("#reacao-texto");
  var ultimaFrase = -1, ultimoRosto = -1, timerReacao;

  function sortear(n, evitar) {
    if (n < 2) return 0;
    var i;
    do { i = Math.floor(Math.random() * n); } while (i === evitar);
    return i;
  }

  rebeca.addEventListener("click", function () {
    var R = window.REACOES || { frases: ["Oi! 👋"], rostos: ["piscadinha"] };
    ultimaFrase = sortear(R.frases.length, ultimaFrase);
    ultimoRosto = sortear(R.rostos.length, ultimoRosto);
    var rosto = R.rostos[ultimoRosto];
    reacaoRosto.src = "assets/rebeca/rosto-" + rosto + ".webp";
    reacaoRosto.alt = ROSTO_ALT[rosto] || "";
    reacao.hidden = true;
    void reacao.offsetWidth; // reinicia a animação
    reacaoTexto.textContent = R.frases[ultimaFrase];
    reacao.hidden = false;
    clearTimeout(timerReacao);
    timerReacao = setTimeout(function () { reacao.hidden = true; }, 3000);
  });

  /* ---------------- Vôlei: a bola dá um pulinho ---------------- */

  var volei = $("#volei");
  if (volei) {
    volei.addEventListener("click", function () {
      volei.classList.remove("pulando");
      void volei.offsetWidth;
      volei.classList.add("pulando");
    });
    volei.addEventListener("animationend", function () { volei.classList.remove("pulando"); });
  }

  /* ---------------- Eventos ---------------- */

  window.addEventListener("scroll", function () {
    rolando = true;
    clearTimeout(timerParada);
    timerParada = setTimeout(function () { rolando = false; agendar(); }, 140);
    agendar();
  }, { passive: true });

  var timerResize;
  function reconstruir() {
    clearTimeout(timerResize);
    timerResize = setTimeout(function () { construirTrilha(); agendar(); }, 120);
  }
  window.addEventListener("resize", reconstruir);
  window.addEventListener("load", reconstruir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reconstruir);
  if ("ResizeObserver" in window) new ResizeObserver(reconstruir).observe(document.body);

  construirTrilha();
  agendar();
})();
