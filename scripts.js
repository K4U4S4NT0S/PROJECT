const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Smooth scroll (Lenis) =====
if (window.Lenis && !prefersReducedMotion) {
  const lenis = new Lenis({ smoothWheel: true, duration: 1.05 });
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

// ===== Page transition (Barba) =====
if (window.barba && document.querySelector('[data-barba="container"]')) {
  barba.init({
    transitions: [{
      name: 'fade',
      leave(data) {
        return anime({ targets: data.current.container, opacity: [1, 0], duration: 240, easing: 'easeOutQuad' }).finished;
      },
      enter(data) {
        return anime({ targets: data.next.container, opacity: [0, 1], duration: 320, easing: 'easeOutQuad' }).finished;
      }
    }]
  });
}

// ===== Custom cursor =====
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

if (dot && ring) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  const updateRing = () => {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(updateRing);
  };
  requestAnimationFrame(updateRing);

  document.querySelectorAll('a, button, .card').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });
}

// ===== Scroll reveal =====
const animateIn = (target, extra = {}) => {
  anime({
    targets: target,
    opacity: [0, 1],
    translateY: [22, 0],
    duration: 700,
    easing: 'easeOutCubic',
    ...extra
  });
};

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateIn(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));

  anime({
    targets: '#hero-image',
    translateY: [-8, 10],
    rotate: [-2, 2],
    direction: 'alternate',
    duration: 2600,
    easing: 'easeInOutSine',
    loop: true
  });
} else {
  document.querySelectorAll('[data-animate]').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

// ===== Interactive background =====
const canvas = document.getElementById('fx-bg');
const ctx = canvas?.getContext('2d');
let particles = [];

if (canvas && ctx && !prefersReducedMotion) {
  const resizeCanvas = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  };

  const initParticles = () => {
    particles = Array.from({ length: Math.min(90, Math.floor(innerWidth / 20)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.8
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      const d = Math.hypot(mouseX - p.x, mouseY - p.y);
      if (d < 140) {
        p.x += (mouseX - p.x) * 0.002;
        p.y += (mouseY - p.y) * 0.002;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff88';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };

  resizeCanvas();
  initParticles();
  draw();
  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });
}

// ===== Menu filters + cart =====
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.card');

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');

    const filter = chip.dataset.filter;
    cards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.type === filter;
      card.hidden = !visible;
    });
  });
});

let cart = 0;
const cartCount = document.getElementById('cart-count');
document.querySelectorAll('.add').forEach((btn) => {
  btn.addEventListener('click', () => {
    cart += 1;
    if (cartCount) cartCount.textContent = String(cart);
    anime({ targets: '#cart-btn', scale: [1, 1.12, 1], duration: 300, easing: 'easeOutBack' });
  });
});

const surpriseBtn = document.getElementById('surprise-btn');
if (surpriseBtn) {
  surpriseBtn.addEventListener('click', () => {
    const visibleCards = Array.from(cards).filter((card) => !card.hidden);
    const random = visibleCards[Math.floor(Math.random() * visibleCards.length)] || cards[0];
    random.scrollIntoView({ behavior: 'smooth', block: 'center' });
    anime({ targets: random, scale: [1, 1.04, 1], duration: 500, easing: 'easeOutElastic(1, .7)' });
  });
}
