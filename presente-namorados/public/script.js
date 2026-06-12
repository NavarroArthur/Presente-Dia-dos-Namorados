(async function () {
  const $ = (id) => document.getElementById(id);

  const res = await fetch('data.json');
  const data = await res.json();

  let idx = 0;
  let carouselIdx = 0;
  let carouselTimer = null;
  let bgTimer = null;

  // Coleta todas fotos pra fundo + galeria final
  const allPhotos = data.perguntas.flatMap(p => p.fotos || []);

  // === Tela inicial ===
  $('titulo').textContent = data.titulo;
  $('subtitulo').textContent = data.subtitulo;
  $('btn-start').textContent = data.botaoInicio;

  $('btn-start').addEventListener('click', () => {
    show('screen-question');
    renderQuestion();
  });

  $('btn-next').addEventListener('click', () => {
    idx++;
    if (idx >= data.perguntas.length) {
      renderFinal();
      show('screen-final');
    } else {
      show('screen-question');
      renderQuestion();
    }
  });

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    $(id).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // === Pergunta ===
  function renderQuestion() {
    const q = data.perguntas[idx];
    const total = data.perguntas.length;

    $('progress-bar').style.width = `${(idx / total) * 100}%`;
    $('step').textContent = `Pergunta ${idx + 1} de ${total}`;
    $('question').textContent = q.pergunta;

    const opts = $('options');
    opts.innerHTML = '';
    q.opcoes.forEach((opc) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.textContent = opc;
      btn.addEventListener('click', () => renderReveal());
      opts.appendChild(btn);
    });
  }

  // === Reveal + carrossel ===
  function renderReveal() {
    const q = data.perguntas[idx];
    const fotos = q.fotos || [];

    const track = $('carousel-track');
    track.innerHTML = '';
    fotos.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
      const img = document.createElement('img');
      img.src = src;
      img.alt = q.legenda || '';
      img.loading = 'lazy';
      slide.appendChild(img);
      track.appendChild(slide);
    });

    const dots = $('carousel-dots');
    dots.innerHTML = '';
    fotos.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goToSlide(i));
      dots.appendChild(d);
    });

    // Esconde botões se só uma foto
    const single = fotos.length <= 1;
    $('carousel-prev').classList.toggle('hidden', single);
    $('carousel-next').classList.toggle('hidden', single);
    dots.style.display = single ? 'none' : 'flex';

    carouselIdx = 0;
    startCarousel(fotos.length);

    $('caption').textContent = q.legenda || '';
    $('answer').textContent = q.resposta;

    const total = data.perguntas.length;
    $('progress-bar').style.width = `${((idx + 1) / total) * 100}%`;

    show('screen-reveal');
  }

  function goToSlide(i) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if (!slides.length) return;
    carouselIdx = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === carouselIdx));
    dots.forEach((d, k) => d.classList.toggle('active', k === carouselIdx));
    restartCarouselTimer(slides.length);
  }

  function startCarousel(n) {
    clearInterval(carouselTimer);
    if (n <= 1) return;
    carouselTimer = setInterval(() => goToSlide(carouselIdx + 1), 3500);
  }

  function restartCarouselTimer(n) {
    clearInterval(carouselTimer);
    if (n <= 1) return;
    carouselTimer = setInterval(() => goToSlide(carouselIdx + 1), 3500);
  }

  $('carousel-prev').addEventListener('click', () => goToSlide(carouselIdx - 1));
  $('carousel-next').addEventListener('click', () => goToSlide(carouselIdx + 1));

  // === Final ===
  function renderFinal() {
    $('final-titulo').textContent = data.final.titulo;
    $('final-msg').textContent = data.final.mensagem;
    $('final-sig').textContent = data.final.assinatura;

    const gallery = $('gallery');
    gallery.innerHTML = '';
    allPhotos.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('click', () => openLightbox(i));
      gallery.appendChild(img);
    });
  }

  // === Lightbox ===
  let lbIdx = 0;
  const lb = $('lightbox');
  const lbImg = $('lightbox-img');
  const lbCounter = $('lightbox-counter');

  function openLightbox(i) {
    lbIdx = i;
    updateLightbox();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function updateLightbox() {
    lbImg.src = allPhotos[lbIdx];
    lbCounter.textContent = `${lbIdx + 1} / ${allPhotos.length}`;
  }
  function lbPrev() {
    lbIdx = (lbIdx - 1 + allPhotos.length) % allPhotos.length;
    updateLightbox();
  }
  function lbNext() {
    lbIdx = (lbIdx + 1) % allPhotos.length;
    updateLightbox();
  }

  $('lightbox-close').addEventListener('click', closeLightbox);
  $('lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); lbPrev(); });
  $('lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); lbNext(); });
  lbImg.addEventListener('click', (e) => e.stopPropagation());
  lb.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') lbPrev();
    else if (e.key === 'ArrowRight') lbNext();
  });

  // === Fundo slideshow ===
  function initBackground() {
    if (!allPhotos.length) return;
    const container = $('bg-slideshow');
    // Cria 2 slides pra alternar (suaviza transição)
    const slideA = document.createElement('div');
    const slideB = document.createElement('div');
    slideA.className = 'bg-slide active';
    slideB.className = 'bg-slide';
    container.appendChild(slideA);
    container.appendChild(slideB);

    let bgIdx = 0;
    const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);
    slideA.style.backgroundImage = `url('${shuffled[0]}')`;

    let activeIsA = true;
    bgTimer = setInterval(() => {
      bgIdx = (bgIdx + 1) % shuffled.length;
      const next = activeIsA ? slideB : slideA;
      const cur = activeIsA ? slideA : slideB;
      next.style.backgroundImage = `url('${shuffled[bgIdx]}')`;
      next.classList.add('active');
      cur.classList.remove('active');
      activeIsA = !activeIsA;
    }, 5000);
  }

  // === Corações flutuando ===
  function initHearts() {
    const heartsContainer = document.querySelector('.hearts');
    const emojis = ['💜', '💗', '💖', '🌸', '✨'];
    for (let i = 0; i < 18; i++) {
      const h = document.createElement('span');
      h.className = 'heart';
      h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      h.style.left = `${Math.random() * 100}%`;
      h.style.animationDuration = `${10 + Math.random() * 14}s`;
      h.style.animationDelay = `${Math.random() * 12}s`;
      h.style.fontSize = `${1 + Math.random() * 1.4}rem`;
      heartsContainer.appendChild(h);
    }
  }

  initBackground();
  initHearts();
})();
