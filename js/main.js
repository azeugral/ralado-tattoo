(function () {
  var d = document;
  var WA = '5585998346964';

  /* ---------- hero "galeria no chão" (modelo Veríssimo): as peças dele em quadros; cada uma cobre a anterior
     em tinta, um quadro depois do outro. WebGL no PC, MP4 no celular em pé ---------- */
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = d.querySelector('.gal'), cena = d.querySelector('.gal-cena'), V = '?v=2', INTRO = 2.4, orn = new Image();
  orn.src = 'img/orn/chao.webp' + V;
  var baixa = function () { return innerHeight <= 520 && innerWidth > innerHeight; };
  var celPe = function () { return innerWidth <= 860 && !baixa(); };
  function estatico() { cena.classList.add('est'); }
  function iniciaGL(celular) {
    if (!window.galeria || !window.GALERIA) return false;
    if (!d.createElement('canvas').getContext('webgl')) return false;
    var cv = d.querySelector('.g-gl'), imgs = {}, faltam = 0, G = null, falhou = false;
    var lay = celular ? 'cel' : baixa() ? 'baixa' : 'pc', nomes = {};
    window.GALERIA[lay].forEach(function (q) { q.arts.forEach(function (n) { nomes[n] = 1; }); });
    function pronto() {
      if (falhou || faltam) return;
      var fd = celular ? [.9, 1] : lay === 'baixa' ? [.5, .9] : [.66, 1];
      try { G = window.galeria(cv, { imgs: imgs, quadros: window.GALERIA[lay].map(function (q) { return Object.assign({}, q); }), fundo: fd,
        orn: orn ? Object.assign({ img: orn }, window.GALERIA.orn[lay]) : null }); } catch (e) { G = null; }
      if (!G) { falhou = true; if (!celular) iniciaVideo(); else estatico(); return; }
      cena.classList.add('gl');
      var t0 = 0, vis = true, raf = 0, pausa = 0, tp = 0;
      function quadro(ts) {
        if (!t0) t0 = ts;
        if (pausa) { t0 += ts - pausa; pausa = 0; }
        G.desenha((ts - t0) / 1000, devicePixelRatio || 1);
        tp = ts;
        raf = vis ? requestAnimationFrame(quadro) : 0;
      }
      new IntersectionObserver(function (es) {
        vis = es[0].isIntersecting;
        if (!vis) pausa = tp;
        if (vis && !raf) raf = requestAnimationFrame(quadro);
      }).observe(cena);
      raf = requestAnimationFrame(quadro);
    }
    faltam++;
    function ornOk() { faltam--; pronto(); }
    if (orn.complete && orn.naturalWidth) faltam--; else { orn.addEventListener('load', ornOk); orn.addEventListener('error', function () { orn = null; ornOk(); }); }
    Object.keys(nomes).forEach(function (n) {
      faltam++;
      var im = new Image(); im.decoding = 'async'; im.src = 'img/galeria/' + n + '.webp' + V; imgs[n] = im;
      im.onload = function () { faltam--; pronto(); };
      im.onerror = function () { if (!falhou) { falhou = true; if (!celular) iniciaVideo(); else estatico(); } };
    });
    return true;
  }
  var videoTentado = false;
  function iniciaVideo() {
    if (videoTentado) return; videoTentado = true;
    var v = d.querySelector('.g-video');
    v.src = 'img/galeria/galeria.mp4' + V; v.preload = 'auto';
    var p = v.play();
    if (p && p.catch) p.catch(function () { if (!cena.classList.contains('gl') && !iniciaGL(true)) estatico(); });
    v.addEventListener('playing', function () { cena.classList.add('vd'); }, { once: true });
    v.addEventListener('ended', function () { v.currentTime = INTRO; v.play().catch(function () {}); });
    v.addEventListener('error', function () { if (!iniciaGL(true)) estatico(); });
    d.addEventListener('visibilitychange', function () { if (!d.hidden && cena.classList.contains('vd')) v.play().catch(function () {}); });
  }
  if (hero) {
    if (reduz) estatico();
    else if (celPe()) iniciaVideo();
    else if (!iniciaGL(false)) iniciaVideo();
    requestAnimationFrame(function () { hero.classList.add('pronto'); });
  }

  /* ---------- topo e gaveta ---------- */
  var topo = d.getElementById('topo'), gav = d.getElementById('gaveta'), burger = d.getElementById('burger');
  function rolar() { topo.classList.toggle('solido', scrollY > 30 || !gav.hidden); }
  addEventListener('scroll', rolar, { passive: true }); rolar();
  function gaveta(a) { gav.hidden = !a; burger.setAttribute('aria-expanded', a); d.body.style.overflow = a ? 'hidden' : ''; rolar(); }
  burger.addEventListener('click', function () { gaveta(gav.hidden); });
  gav.addEventListener('click', function (e) { if (e.target.closest('a')) gaveta(false); });

  /* ---------- entrada ao rolar ---------- */
  var io = new IntersectionObserver(function (es) {
    var meio = innerWidth / 2;
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var r = e.boundingClientRect, dist = Math.abs(r.left + r.width / 2 - meio) / meio;
      e.target.style.transitionDelay = Math.round(Math.min(1, dist) * 240) + 'ms';
      e.target.classList.add('vis'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  function observar() { d.querySelectorAll('.rev:not(.vis),.item:not(.vis):not(.sai)').forEach(function (el) { io.observe(el); }); }

  /* ---------- trabalhos ---------- */
  var grade = d.getElementById('grade'), mais = d.getElementById('mais'), filtro = 'todos';
  var passoN = 24, limite = passoN;

  PECAS.forEach(function (p, i) {
    var f = d.createElement('figure'); f.className = 'item'; f.tabIndex = 0; f.dataset.i = i;
    f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Ampliar: ' + p.l);
    f.innerHTML = '<div class="fr"><img src="img/p/' + p.c + '.webp" alt="' + p.l + ', tatuagem do Ralado Tattoo" width="720" height="900" draggable="false"></div>';
    grade.appendChild(f);
  });
  var itens = [].slice.call(grade.children);
  function visiveis() { return itens.filter(function (el) { return filtro === 'todos' || PECAS[el.dataset.i].t === filtro; }); }
  function aplicar() {
    var v = visiveis();
    itens.forEach(function (el) { el.classList.add('sai'); });
    v.forEach(function (el, k) { if (k < limite) el.classList.remove('sai'); });
    mais.hidden = v.length <= limite;
    observar();
  }
  aplicar(); observar();
  d.querySelectorAll('.filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      d.querySelectorAll('.filtros button').forEach(function (x) { x.classList.toggle('on', x === b); });
      filtro = b.dataset.f; limite = passoN; aplicar();
      itens.forEach(function (el) { if (!el.classList.contains('sai')) el.classList.add('vis'); });
      grade.animate && grade.animate([{ opacity: .2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,.84,.32,1)' });
    });
  });
  mais.addEventListener('click', function () { limite += passoN; aplicar(); });

  /* lightbox */
  var lb = d.getElementById('lb'), lbImg = d.getElementById('lbImg'), atualLb = 0, lista = [];
  function abrirLb(i) { lista = visiveis().map(function (el) { return +el.dataset.i; }); atualLb = Math.max(0, lista.indexOf(i)); mostrar(); lb.hidden = false; d.body.style.overflow = 'hidden'; }
  function mostrar() { var p = PECAS[lista[atualLb]]; lbImg.src = 'img/g/' + p.c + '.webp'; lbImg.alt = p.l + ', tatuagem do Ralado Tattoo'; }
  function passo(n) { atualLb = (atualLb + n + lista.length) % lista.length; mostrar(); }
  function fechar() { lb.hidden = true; d.body.style.overflow = ''; }
  grade.addEventListener('click', function (e) { var f = e.target.closest('.item'); if (f) abrirLb(+f.dataset.i); });
  grade.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var f = e.target.closest('.item'); if (f) { e.preventDefault(); abrirLb(+f.dataset.i); } } });
  d.getElementById('lbX').onclick = fechar;
  d.getElementById('lbP').onclick = function () { passo(-1); };
  d.getElementById('lbS').onclick = function () { passo(1); };
  d.getElementById('lbQuero').onclick = function () {
    var p = PECAS[lista[atualLb]], ideia = d.getElementById('ideia');
    ideia.value = 'Quero uma peça como esta do portfólio: ' + p.l + '.';
    var mapa = { pb: 'Realismo preto e cinza', fe: 'Religiosa (fé)', hom: 'Homenagem ou retrato', cor: 'Colorida' };
    var r = d.querySelector('input[name="tema"][value="' + mapa[p.t] + '"]'); if (r) r.checked = true;
    fechar();
    d.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  lb.addEventListener('click', function (e) { if (e.target === lb) fechar(); });
  addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechar(); if (e.key === 'ArrowLeft') passo(-1); if (e.key === 'ArrowRight') passo(1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45) passo(dx < 0 ? 1 : -1); tx = null; });

  /* botões que já escolhem o estilo (ex.: orçamento do evento) */
  d.querySelectorAll('[data-tam]').forEach(function (a) {
    a.addEventListener('click', function () { var s = d.getElementById('tamanho'); if (s) s.value = a.dataset.tam; });
  });
  d.querySelectorAll('[data-tema]').forEach(function (a) {
    a.addEventListener('click', function () { var r = d.querySelector('input[name="tema"][value="' + a.dataset.tema + '"]'); if (r) r.checked = true; });
  });

  /* ---------- pedido de orçamento pelo WhatsApp ---------- */
  var form = d.getElementById('form'), erro = d.getElementById('erro');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), nomeC = (f.get('nome') || '').trim();
    if (!nomeC) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var l = ['Olá, Ralado! Sou *' + nomeC + '* e quero um orçamento.', '',
      '*Estilo:* ' + f.get('tema'), '*Cobertura:* ' + f.get('cob'),
      '*Local do corpo:* ' + ((f.get('local') || '').trim() || 'a definir'),
      '*Tamanho:* ' + f.get('tamanho'), '*Disponibilidade:* ' + f.get('quando')];
    var ideia = (f.get('ideia') || '').trim();
    if (ideia) l.push('', '*Ideia:* ' + ideia);
    l.push('', 'Vou mandar a referência e a foto do local aqui na conversa.', '(pedido enviado pelo site)');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
  });
})();
