/* ── Caramello Cakestry — JavaScript ── */
const API_BASE_URL = 'https://caremello-7.onrender.com';

// ── Navbar scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Hamburger menu ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
  })
);

// ── Scroll helpers ──
function scrollToMenu() { document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }); }
function scrollToContact() { document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); }

// ── Order form ──
async function handleOrder(e) {
  e.preventDefault();
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  if (!name || !phone) return;
  const button = e.target.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        phone,
        category: document.getElementById('cakeCategory').value,
        note: document.getElementById('orderNote').value.trim()
      })
    });
    if (!response.ok) throw new Error('order failed');
    showToast(`🎉 Thank you, ${name}! We'll call you at ${phone} shortly.`);
    e.target.reset();
  } catch (error) {
    showToast('Unable to send your enquiry. Please try again.');
  } finally {
    button.disabled = false;
  }
}

// ── Toast ──
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Scroll reveal ──
const revealTargets = document.querySelectorAll(
  '.menu-category, .occasion-card, .bite-card, .section-header, .midnight-banner, .contact-grid > *, .specials-col, .reviews-summary'
);
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  observer.observe(el);
});

// ── Highlight active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      navAnchors.forEach(a => a.classList.remove('active-link'));
      const match = document.querySelector(`.nav-links a[href="#${section.id}"]`);
      if (match) match.classList.add('active-link');
    }
  });
}, { passive: true });

// ── Reviews Slider (one at a time, fade transition) ──
(function initReviewsSlider() {
  const slider = document.getElementById('revSlider');
  const dotsWrap = document.getElementById('revDots');
  const btnPrev = document.getElementById('revPrev');
  const btnNext = document.getElementById('revNext');
  if (!slider) return;

  const cards = Array.from(slider.querySelectorAll('.review-card'));
  let current = 0;
  let autoTimer;
  let isAnimating = false;

  // Set correct min-height based on tallest card
  function setSliderHeight() {
    slider.style.minHeight = '';
    let maxH = 0;
    cards.forEach(c => {
      c.style.position = 'relative';
      c.style.opacity = '1';
      c.style.transform = 'none';
      const h = c.offsetHeight;
      if (h > maxH) maxH = h;
      c.style.position = '';
      c.style.opacity = '';
      c.style.transform = '';
    });
    slider.style.minHeight = (maxH || 300) + 'px';
  }

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'rev-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Review ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    });
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.rev-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
  }

  function goTo(next, dir) {
    if (isAnimating || next === current) return;
    isAnimating = true;

    const prev = current;
    current = (next + cards.length) % cards.length;

    // Exit old card
    cards[prev].classList.remove('active');
    cards[prev].classList.add('exit-left');

    // Enter new card
    cards[current].style.transition = 'none';
    cards[current].style.transform = dir === 'prev' ? 'translateX(-28px)' : 'translateX(28px)';
    cards[current].style.opacity = '0';

    // Force reflow
    cards[current].offsetHeight;

    cards[current].style.transition = '';
    cards[current].style.transform = '';
    cards[current].style.opacity = '';
    cards[current].classList.add('active');

    setTimeout(() => {
      cards[prev].classList.remove('exit-left');
      isAnimating = false;
    }, 460);

    updateDots();
    btnPrev.disabled = false;
    btnNext.disabled = false;
    resetAuto();
  }

  function next() { goTo((current + 1) % cards.length, 'next'); }
  function prev() { goTo((current - 1 + cards.length) % cards.length, 'prev'); }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 6000);
  }

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  // Touch swipe
  let tx = 0;
  slider.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 45) { d > 0 ? next() : prev(); }
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  window.addEventListener('resize', setSliderHeight, { passive: true });

  // Init
  buildDots();
  cards[0].classList.add('active');
  setTimeout(setSliderHeight, 50);
  resetAuto();
})();


/* ── NEW MENU JS ── */
/* FALLBACK_PRODUCTS is the built-in seed data.
   At runtime `products` is loaded from localStorage so admin edits
   are reflected here immediately — no rebuild needed. */
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Vanilla Cake",
    categories: ["regular"],
    description: "Simple, elegant, and irresistibly delicious — our Vanilla Cake is made with soft and fluffy sponge layered with smooth vanilla-flavoured cream. Decorated with delicate floral piping, this cake brings the perfect balance of sweetness and aroma in every bite. A timeless favourite for birthdays, celebrations, and every special moment.",
    price: "₹600",
    originalPrice: null,
    images: ["all items/VANILA Cake/Screenshot 2026-06-21 190732.png"],
    mainImage: "all items/VANILA Cake/Screenshot 2026-06-21 190732.png"
  },
  {
    id: 2,
    name: "Classic Mango",
    categories: ["regular"],
    description: "Indulge in seasonal mango goodness with fresh fruit layers and delicate cream.",
    price: "₹700",
    originalPrice: "₹750",
    images: ["all items/CLASSIC MANGO/Screenshot 2026-06-21 190254.png"],
    mainImage: "all items/CLASSIC MANGO/Screenshot 2026-06-21 190254.png"
  },
  {
    id: 3,
    name: "White Forest",
    categories: ["regular", "chocolate"],
    description: "A heavenly white chocolate classic cake layered with premium cherries and vanilla cream.",
    price: "₹700",
    originalPrice: "₹750",
    images: ["all items/WHITE  FOREST/Screenshot 2026-06-21 190436.png", "all items/WHITE  FOREST/Screenshot 2026-06-21 190451.png"],
    mainImage: "all items/WHITE  FOREST/Screenshot 2026-06-21 190436.png"
  },
  {
    id: 4,
    name: "Classic Strawberry",
    categories: ["regular"],
    description: "Sweet and appetizing strawberry fruit blast filling inside fluffy cake layers.",
    price: "₹700",
    originalPrice: "₹750",
    images: ["all items/CLASSIC  Strawberry cake/Screenshot 2026-06-21 190631.png"],
    mainImage: "all items/CLASSIC  Strawberry cake/Screenshot 2026-06-21 190631.png"
  },
  {
    id: 5,
    name: "Black Forest",
    categories: ["regular", "chocolate"],
    description: "Experience the classic charm of our Black Forest Cake — soft, moist chocolate sponge layered with rich whipped cream, filled with sweet cherry compote, and beautifully decorated with chocolate shavings and juicy red cherries on top. Every slice is a delicious combination of chocolate and cherries, creating a timeless dessert loved by all.",
    price: "₹700",
    originalPrice: "₹750",
    images: ["all items/BLACK FOREST/Screenshot 2026-06-21 185200.png", "all items/BLACK FOREST/Screenshot 2026-06-21 191434.png"],
    mainImage: "all items/BLACK FOREST/Screenshot 2026-06-21 185200.png"
  },
  {
    id: 6,
    name: "Butter Scotch",
    categories: ["regular", "creamcheese"],
    description: "Sweet and buttery fudge sauce layered with crunchy butterscotch praline nuts.",
    price: "₹1,000",
    originalPrice: null,
    images: ["all items/Butter Scotch/Screenshot 2026-06-21 201129.png"],
    mainImage: "all items/Butter Scotch/Screenshot 2026-06-21 201129.png"
  },
  {
    id: 7,
    name: "Blueberry Cake (fruit blast)",
    categories: ["musttry"],
    description: "Moist, fluffy cake layers give way to a sweet blueberry filling, while the blueberries dance on your taste buds, leaving a delightful sweetness that lingers.",
    price: "₹1,050",
    originalPrice: "₹1,100",
    images: ["all items/BLUEBERRY CAKE ( FRUIT BLAST)/Screenshot 2026-06-21 194933.png"],
    mainImage: "all items/BLUEBERRY CAKE ( FRUIT BLAST)/Screenshot 2026-06-21 194933.png"
  },
  {
    id: 8,
    name: "Choco Truffle",
    categories: ["chocolate"],
    description: "Decadent chocolate sponge filled and frosted with a rich, silky dark chocolate ganache.",
    price: "₹900",
    originalPrice: null,
    images: ["all items/Choco truffle/Screenshot 2026-06-21 184457.png", "all items/Choco truffle/Screenshot 2026-06-21 184504.png"],
    mainImage: "all items/Choco truffle/Screenshot 2026-06-21 184457.png"
  },
  {
    id: 9,
    name: "Choco Chip",
    categories: ["chocolate"],
    description: "Premium chocolate chips folded into rich chocolate cream layers for ultimate texture.",
    price: "₹1,150",
    originalPrice: null,
    images: ["all items/Choco chip/Screenshot 2026-06-21 184641.png", "all items/Choco chip/Screenshot 2026-06-21 184653.png", "all items/Choco chip/Screenshot 2026-06-21 184702.png"],
    mainImage: "all items/Choco chip/Screenshot 2026-06-21 184641.png"
  },
  {
    id: 10,
    name: "Oreo Classic",
    categories: ["chocolate", "kids"],
    description: "Crunchy Oreo cookies crushed and folded into fluffy cookies & cream layers.",
    price: "₹1,150",
    originalPrice: null,
    images: ["all items/Oreo Classic/Screenshot 2026-06-21 184800.png"],
    mainImage: "all items/Oreo Classic/Screenshot 2026-06-21 184800.png"
  },
  {
    id: 11,
    name: "Red Choco",
    categories: ["chocolate"],
    description: "Gorgeous red-tinted chocolate sponge layers with a velvety smooth cream coating.",
    price: "₹1,200",
    originalPrice: "₹1,247",
    images: ["all items/Red choco/Screenshot 2026-06-21 184901.png", "all items/Red choco/Screenshot 2026-06-21 184911.png"],
    mainImage: "all items/Red choco/Screenshot 2026-06-21 184901.png"
  },
  {
    id: 12,
    name: "Choco Nut (Spcl)",
    categories: ["chocolate", "nutdryfruit"],
    description: "Rich chocolate loaded with premium nuts.",
    price: "₹1,250",
    originalPrice: null,
    images: [
      "all items/Choco nut ★★ (spcl)/Screenshot 2026-06-21 185027.png",
      "all items/Choco nut ★★ (spcl)/Screenshot 2026-06-21 185039.png",
      "all items/Choco nut ★★ (spcl)/Screenshot 2026-06-21 185047.png",
      "all items/Choco nut ★★ (spcl)/Screenshot 2026-06-21 185058.png"
    ],
    mainImage: "all items/Choco nut ★★ (spcl)/Screenshot 2026-06-21 185027.png"
  },
  {
    id: 13,
    name: "Belgium Chocolate",
    categories: ["chocolate"],
    description: "Full dark chocolate premium cake.",
    price: "₹1,399",
    originalPrice: "₹1,499",
    images: ["all items/Belgium chocolate cake/Screenshot 2026-06-21 195745.png"],
    mainImage: "all items/Belgium chocolate cake/Screenshot 2026-06-21 195745.png"
  },
  {
    id: 14,
    name: "Choco Scotch",
    categories: ["chocolate"],
    description: "Caramello special choco-butterscotch blend.",
    price: "₹1,100",
    originalPrice: null,
    images: ["all items/Choco  scotch/Screenshot 2026-06-21 185339.png", "all items/Choco  scotch/Screenshot 2026-06-21 185355.png"],
    mainImage: "all items/Choco  scotch/Screenshot 2026-06-21 185339.png"
  },
  {
    id: 15,
    name: "Nutty Caramel",
    categories: ["chocolate", "nutdryfruit"],
    description: "Nutty caramel fresh cream cake is a delicious treat that combines the rich, buttery flavor of caramel with the crunch of nuts and the light, creamy texture of our signature cake.",
    price: "₹1,000",
    originalPrice: "₹1,100",
    images: ["all items/Nutty Caramel/Screenshot 2026-06-21 195948.png", "all items/Nutty Caramel/Screenshot 2026-06-21 200007.png"],
    mainImage: "all items/Nutty Caramel/Screenshot 2026-06-21 195948.png"
  },
  {
    id: 16,
    name: "Bubbly Nutz",
    categories: ["chocolate", "nutdryfruit"],
    description: "The Bubbly Nutz Cake is a tangy, creamy delight loaded with nuts and choco-nuts! The chocolate cake base has milk, sugar, eggs and chocolate which gives this moist sponge a distinct brownie flavour.",
    price: "₹1,100",
    originalPrice: null,
    images: ["all items/Bubbly Nutz/Screenshot 2026-06-21 200118.png"],
    mainImage: "all items/Bubbly Nutz/Screenshot 2026-06-21 200118.png"
  },
  {
    id: 17,
    name: "Golden Honey",
    categories: ["musttry"],
    description: "Golden Honey – A Taste of Pure Indulgence. Crafted with our exclusive signature recipe, Golden Honey is a soft, velvety cake layered with rich cream and coated in a delicate golden crumb. Every bite carries the warm sweetness of honey, creating a perfectly balanced flavour that melts effortlessly in your mouth. A simple yet luxurious treat—made to delight, made to impress.",
    price: "₹1,500",
    originalPrice: "₹1,550",
    images: ["all items/GOLDEN  HONEY/Screenshot 2026-06-21 193102.png"],
    mainImage: "all items/GOLDEN  HONEY/Screenshot 2026-06-21 193102.png"
  },
  {
    id: 18,
    name: "Kulfi Almond",
    categories: ["musttry", "nutdryfruit"],
    description: "Experience the magic of kulfi in cake form! Our Kulfi Almond Cake is creamy, nutty and irresistibly delicious — layered with kulfi flavour and covered in crunchy almonds. A celebration of classic taste with a modern twist!",
    price: "₹1,350",
    originalPrice: "₹1,450",
    images: ["all items/KULFI ALMOND/Screenshot 2026-06-21 193156.png"],
    mainImage: "all items/KULFI ALMOND/Screenshot 2026-06-21 193156.png"
  },
  {
    id: 19,
    name: "Pistachio Malai",
    categories: ["musttry", "nutdryfruit"],
    description: "Discover the luxury of rich malai cream paired with the nutty goodness of pistachios. Our Pistachio Malai Cake is smooth, velvety, and perfectly balanced with crunchy pistachio flakes around the edges. A royal treat that melts in your mouth with every bite.",
    price: "₹1,400",
    originalPrice: "₹1,447",
    images: ["all items/PISTACHIO MALAI/Screenshot 2026-06-21 193307.png"],
    mainImage: "all items/PISTACHIO MALAI/Screenshot 2026-06-21 193307.png"
  },
  {
    id: 20,
    name: "Vancho",
    categories: ["musttry", "chocolate", "creamcheese"],
    description: "Combines white & dark chocolate sponge.",
    price: "₹1,000",
    originalPrice: null,
    images: [
      "all items/Vancho/Screenshot 2026-06-21 194114.png",
      "all items/Vancho/Screenshot 2026-06-21 194122.png",
      "all items/Vancho/Screenshot 2026-06-21 194132.png",
      "all items/Vancho/Screenshot 2026-06-21 194141.png"
    ],
    mainImage: "all items/Vancho/Screenshot 2026-06-21 194114.png"
  },
  {
    id: 21,
    name: "Red Velvet (Cream Cheese Filling Type)",
    categories: ["musttry", "regular", "creamcheese"],
    description: "A classic Red Velvet with a luscious cream cheese filling and a rich chocolate truffle addition — the perfect balance of velvety sponge and indulgent cream in every slice.",
    price: "₹1,200",
    originalPrice: null,
    images: [
      "all items/Red velvet (cream chees ) filling type/Screenshot 2026-06-21 194256.png",
      "all items/Red velvet (cream chees ) filling type/Screenshot 2026-06-21 194312.png"
    ],
    mainImage: "all items/Red velvet (cream chees ) filling type/Screenshot 2026-06-21 194256.png"
  },
  {
    id: 22,
    name: "Kit Kat Cake",
    categories: ["musttry", "chocolate", "kids"],
    description: "A fun-filled chocolate treat every kid loves! Soft, creamy chocolate cake wrapped in crunchy KitKat bars and topped with a colorful pool of Gems. A vibrant, joyful cake made to brighten birthdays and bring big smiles to little faces!",
    price: "₹1,450",
    originalPrice: "₹1,500",
    images: [
      "all items/Kit kat  Cake/Screenshot 2026-06-21 194420.png",
      "all items/Kit kat  Cake/Screenshot 2026-06-21 194432.png",
      "all items/Kit kat  Cake/Screenshot 2026-06-21 194442.png"
    ],
    mainImage: "all items/Kit kat  Cake/Screenshot 2026-06-21 194420.png"
  },
  {
    id: 23,
    name: "Honey Almond",
    categories: ["musttry", "nutdryfruit"],
    description: "Caramello special premium honey almond.",
    price: "₹1,200",
    originalPrice: null,
    images: [
      "all items/Honey  Almond/Screenshot 2026-06-21 200529.png",
      "all items/Honey  Almond/Screenshot 2026-06-21 200539.png",
      "all items/Honey  Almond/Screenshot 2026-06-21 200549.png",
      "all items/Honey  Almond/Screenshot 2026-06-21 200557.png"
    ],
    mainImage: "all items/Honey  Almond/Screenshot 2026-06-21 200529.png"
  },
  {
    id: 24,
    name: "Milky Mix",
    categories: ["musttry", "creamcheese"],
    description: "Special white-chocolate & milk-fudge item.",
    price: "₹1,150",
    originalPrice: null,
    images: ["all items/Milky mix/Screenshot 2026-06-21 200650.png", "all items/Milky mix/Screenshot 2026-06-21 200659.png"],
    mainImage: "all items/Milky mix/Screenshot 2026-06-21 200650.png"
  },
  {
    id: 25,
    name: "Milk Nut",
    categories: ["musttry", "creamcheese"],
    description: "Caramello special premium milk nut.",
    price: "₹1,200",
    originalPrice: null,
    images: [
      "all items/Milk nut/Screenshot 2026-06-21 200806.png",
      "all items/Milk nut/Screenshot 2026-06-21 200816.png",
      "all items/Milk nut/Screenshot 2026-06-21 200825.png",
      "all items/Milk nut/Screenshot 2026-06-21 200837.png"
    ],
    mainImage: "all items/Milk nut/Screenshot 2026-06-21 200806.png"
  },
  {
    id: 26,
    name: "Rainbow",
    categories: ["musttry", "kids"],
    description: "Premium type colorful layers.",
    price: "₹1,400",
    originalPrice: null,
    images: [
      "all items/Rainbow/Screenshot 2026-06-21 200943.png",
      "all items/Rainbow/Screenshot 2026-06-21 200953.png",
      "all items/Rainbow/Screenshot 2026-06-21 201002.png",
      "all items/Rainbow/Screenshot 2026-06-21 201012.png",
      "all items/Rainbow/Screenshot 2026-06-21 201020.png"
    ],
    mainImage: "all items/Rainbow/Screenshot 2026-06-21 200943.png"
  },
  {
    id: 27,
    name: "Minions face",
    categories: ["kids", "customized"],
    description: "Fun Minions face custom designed cake.",
    price: "Price on request",
    originalPrice: null,
    images: ["all items/Minions face/Screenshot 2026-06-21 192102.png"],
    mainImage: "all items/Minions face/Screenshot 2026-06-21 192102.png"
  },
  {
    id: 28,
    name: "Cocomelon Cuztomized design cake",
    categories: ["kids", "customized"],
    description: "Popular Cocomelon theme design cake.",
    price: "Price on request",
    originalPrice: null,
    images: ["all items/Cocomelon Cuztomized design cake/Screenshot 2026-06-21 191859.png"],
    mainImage: "all items/Cocomelon Cuztomized design cake/Screenshot 2026-06-21 191859.png"
  },
  {
    id: 29,
    name: "Cuztomized jungle Theme",
    categories: ["kids", "customized"],
    description: "Jungle animal theme celebration cake.",
    price: "Price on request",
    originalPrice: null,
    images: ["all items/Cuztomized jungle Theme/Screenshot 2026-06-21 192714.png"],
    mainImage: "all items/Cuztomized jungle Theme/Screenshot 2026-06-21 192714.png"
  },
  {
    id: 30,
    name: "2 tire Cartoon Print Design Cake",
    categories: ["kids", "customized"],
    description: "Kids birthday cartoon print 2 tier cake.",
    price: "Price on request",
    originalPrice: null,
    images: [
      "all items/2 tire Cartoon Print Design Cake/Screenshot 2026-06-21 183838.png",
      "all items/2 tire Cartoon Print Design Cake/Screenshot 2026-06-21 183847.png"
    ],
    mainImage: "all items/2 tire Cartoon Print Design Cake/Screenshot 2026-06-21 183838.png"
  },
  {
    id: 31,
    name: "barbie design",
    categories: ["kids", "customized"],
    description: "Barbie design cake for princesses.",
    price: "Price on request",
    originalPrice: null,
    images: [
      "all items/barbie design/Screenshot 2026-06-21 174559.png",
      "all items/barbie design/Screenshot 2026-06-21 174649.png",
      "all items/barbie design/Screenshot 2026-06-21 174703.png",
      "all items/barbie design/Screenshot 2026-06-21 174715.png",
      "all items/barbie design/Screenshot 2026-06-21 174726.png",
      "all items/barbie design/Screenshot 2026-06-21 174743.png",
      "all items/barbie design/Screenshot 2026-06-21 174757.png",
      "all items/barbie design/Screenshot 2026-06-21 174811.png",
      "all items/barbie design/Screenshot 2026-06-21 174828.png",
      "all items/barbie design/Screenshot 2026-06-21 174839.png"
    ],
    mainImage: "all items/barbie design/Screenshot 2026-06-21 174559.png"
  },
  {
    id: 32,
    name: "heart shaped",
    categories: ["customized"],
    description: "Heart shaped romantic cake design.",
    price: "Price on request",
    originalPrice: null,
    images: [
      "all items/heart shaped/Screenshot 2026-06-21 175415.png",
      "all items/heart shaped/Screenshot 2026-06-21 175451.png",
      "all items/heart shaped/Screenshot 2026-06-21 175505.png"
    ],
    mainImage: "all items/heart shaped/Screenshot 2026-06-21 175415.png"
  },
  {
    id: 33,
    name: "Design with Edible print Cakes",
    categories: ["customized"],
    description: "Personalized photos and edible logo prints.",
    price: "Price on request",
    originalPrice: null,
    images: [
      "all items/Design with Edible print Cakes/Screenshot 2026-06-21 175719.png",
      "all items/Design with Edible print Cakes/Screenshot 2026-06-21 175736.png"
    ],
    mainImage: "all items/Design with Edible print Cakes/Screenshot 2026-06-21 175719.png"
  },
  {
    id: 34,
    name: "2  tire  Cream with Fondant Design Cake",
    categories: ["customized"],
    description: "Tiered celebration cake with custom icing.",
    price: "Price on request",
    originalPrice: null,
    images: ["all items/2  tire  Cream with Fondant Design Cake/Screenshot 2026-06-21 175936.png"],
    mainImage: "all items/2  tire  Cream with Fondant Design Cake/Screenshot 2026-06-21 175936.png"
  },
  {
    id: 35,
    name: "2 Tire Cuztomized  Design cake",
    categories: ["customized"],
    description: "Two-tiered custom theme design cake.",
    price: "Price on request",
    originalPrice: null,
    images: ["all items/2 Tire Cuztomized  Design cake/Screenshot 2026-06-21 192823.png"],
    mainImage: "all items/2 Tire Cuztomized  Design cake/Screenshot 2026-06-21 192823.png"
  },
  {
    id: 36,
    name: "Cream with Fondent Design Cake",
    categories: ["customized"],
    description: "Cream icing with delicate fondant details.",
    price: "Price on request",
    originalPrice: null,
    images: [
      "all items/Cream with Fondent Design Cake/Screenshot 2026-06-21 184215.png",
      "all items/Cream with Fondent Design Cake/Screenshot 2026-06-21 184226.png",
      "all items/Cream with Fondent Design Cake/Screenshot 2026-06-21 184239.png"
    ],
    mainImage: "all items/Cream with Fondent Design Cake/Screenshot 2026-06-21 184215.png"
  },
  {
    id: 37,
    name: "Cuztomized design cake",
    categories: ["customized"],
    description: "Theme and custom concept cakes.",
    price: "Price on request",
    originalPrice: null,
    images: [
      "all items/Cuztomized design cake/Screenshot 2026-06-21 192445.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200245.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200252.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200305.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200314.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200322.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200331.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200341.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200351.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200403.png",
      "all items/Cuztomized design cake/Screenshot 2026-06-21 200415.png"
    ],
    mainImage: "all items/Cuztomized design cake/Screenshot 2026-06-21 192445.png"
  },
  {
    id: 38,
    name: "Simple Design Cakes",
    categories: ["customized"],
    description: "Clean, elegant and simple custom cake designs.",
    price: "Price on request",
    originalPrice: null,
    images: [
      "all items/Simple Design Cakes/Screenshot 2026-06-21 183449.png",
      "all items/Simple Design Cakes/Screenshot 2026-06-21 183503.png",
      "all items/Simple Design Cakes/Screenshot 2026-06-21 183517.png",
      "all items/Simple Design Cakes/Screenshot 2026-06-21 183527.png",
      "all items/Simple Design Cakes/Screenshot 2026-06-21 183540.png",
      "all items/Simple Design Cakes/Screenshot 2026-06-21 183553.png",
      "all items/Simple Design Cakes/Screenshot 2026-06-21 183602.png",
      "all items/Simple Design Cakes/Screenshot 2026-06-21 183620.png"
    ],
    mainImage: "all items/Simple Design Cakes/Screenshot 2026-06-21 183449.png"
  },
  {
    id: 39,
    name: "Two Tire Design  Cakes",
    categories: ["customized"],
    description: "Double tier beautiful celebration cake.",
    price: "Price on request",
    originalPrice: null,
    images: ["all items/Two Tire Design  Cakes/Screenshot 2026-06-21 192159.png"],
    mainImage: "all items/Two Tire Design  Cakes/Screenshot 2026-06-21 192159.png"
  },
  {
    id: 40,
    name: "Design cake",
    categories: ["customized"],
    description: "Stunning custom designs tailored to your celebrations.",
    price: "Price on request",
    originalPrice: null,
    images: ["all items/Design cake/Screenshot 2026-06-21 192617.png"],
    mainImage: "all items/Design cake/Screenshot 2026-06-21 192617.png"
  },
  {
    id: 41,
    name: "Photo  print  or  Brand  logo print cakes",
    categories: ["customized"],
    description: "High-quality edible photo or brand logo prints.",
    price: "Price on request",
    originalPrice: null,
    images: [
      "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201347.png",
      "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201357.png",
      "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201414.png",
      "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201459.png",
      "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201511.png",
      "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201518.png",
      "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201525.png"
    ],
    mainImage: "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201347.png"
  },
  {
    id: 42,
    name: "Customized",
    categories: ["customized"],
    description: "Premium handcrafted customized cakes.",
    price: "Price on request",
    originalPrice: null,
    images: ["all items/Customized/Screenshot 2026-06-21 191725.png"],
    mainImage: "all items/Customized/Screenshot 2026-06-21 191725.png"
  },
  {
    id: 43,
    name: "Extra Charge",
    categories: ["extras"],
    description: "Covers additional custom toppings, midnight delivery fees, and customized decoration items.",
    price: "Ask us",
    originalPrice: null,
    images: ["all items/Extra Charge/Screenshot 2026-06-21 201251.png"],
    mainImage: "all items/Extra Charge/Screenshot 2026-06-21 201251.png"
  }
];

/* ── Admin-sync: load products from localStorage (written by admin.js) ── */
(function seedAdminStorage() {
  const KEY = 'caramello_products';
  const VER_KEY = 'caramello_data_version';
  const CURRENT_VERSION = 'v2';

  const savedVersion = localStorage.getItem(VER_KEY);
  const stored = localStorage.getItem(KEY);

  // If version mismatch or no data → reset to fresh FALLBACK_PRODUCTS
  if (!stored || savedVersion !== CURRENT_VERSION) {
    localStorage.setItem(KEY, JSON.stringify(FALLBACK_PRODUCTS));
    localStorage.setItem(VER_KEY, CURRENT_VERSION);
    return;
  }

  // Existing data with correct version — merge missing products & sanitize paths
  try {
    const parsed = JSON.parse(stored);

    // Sanitize: strip any rogue 'products/' prefix from stored image paths
    // (admin panel may have saved full physical paths back into storage)
    parsed.forEach(p => {
      if (p.mainImage && p.mainImage.startsWith('products/')) {
        p.mainImage = p.mainImage.slice('products/'.length);
      }
      if (Array.isArray(p.images)) {
        p.images = p.images.map(img =>
          img.startsWith('products/') ? img.slice('products/'.length) : img
        );
      }
    });

    // Merge any new fallback products missing from stored data
    const storedIds = new Set(parsed.map(p => p.id));
    FALLBACK_PRODUCTS.forEach(fp => {
      if (!storedIds.has(fp.id)) parsed.push(fp);
    });

    localStorage.setItem(KEY, JSON.stringify(parsed));
  } catch (e) {
    // Corrupted data — reset to fallback
    localStorage.setItem(KEY, JSON.stringify(FALLBACK_PRODUCTS));
  }
})();

// Live products — always reflects latest admin saves
function getLiveProducts() {
  try {
    const stored = localStorage.getItem('caramello_products');
    return stored ? JSON.parse(stored) : FALLBACK_PRODUCTS;
  } catch (e) {
    return FALLBACK_PRODUCTS;
  }
}

// `products` starts from localStorage/fallback. We'll try to pull from server
const products = getLiveProducts();

// Try to fetch authoritative data from backend and replace local copy
(async function tryLoadFromServer() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`);
    if (!res.ok) return;
    const server = await res.json();
    if (!Array.isArray(server) || !server.length) return;
    // Update localStorage so admin tab and other clients pick it up
    try { localStorage.setItem('caramello_products', JSON.stringify(server)); } catch (e) { }
    // Mutate existing products array in-place so references remain valid
    products.splice(0, products.length, ...server);
    // Rebuild menu UI with server data
    if (typeof rebuildMenuFromStorage === 'function') rebuildMenuFromStorage();
  } catch (e) {
    // server not available — keep using fallback/localStorage
  }
})();

// If admin saves in another tab, reload this page to reflect changes
window.addEventListener('storage', function (e) {
  if (e.key === 'caramello_products') {
    // Soft-reload: rebuild the menu sections with fresh data
    rebuildMenuFromStorage();
  }
});

// Helper to map folder name to disk directory layout due to whitespaces
function getPhysicalImagePath(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('/') || imagePath.startsWith('http')) return imagePath;
  // Avoid double-prefixing if path already starts with 'products/'
  let physical = imagePath.startsWith('products/') ? imagePath : 'products/' + imagePath;
  physical = physical.replace('2 Tire Cuztomized  Design cake', '2 Tire Cuztomized   Design cake')
    .replace('Choco nut ★★ (spcl)', 'Choco nut  ★★ (spcl)')
    .replace('Honey  Almond', 'Honey   Almond');
  return physical;
}

// Categories list in exact requested order
const categories = [
  {
    id: "regular",
    label: "Regular Cakes",
    shortLabel: "Regular",
    icon: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z"></path><path d="M5 14h14"></path><path d="M12 10V6"></path><circle cx="12" cy="4" r="1" fill="currentColor"></circle></svg>`
  },
  {
    id: "chocolate",
    label: "Chocolate Type",
    shortLabel: "Chocolate",
    icon: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M12 3v18"></path><path d="M5 8h14"></path><path d="M5 13h14"></path><path d="M5 18h14"></path></svg>`
  },
  {
    id: "creamcheese",
    label: "Cream & Cheese Based Cakes",
    shortLabel: "Cream & Cheese",
    icon: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18v-3L3 12z"></path><circle cx="9" cy="18" r="1.5" fill="currentColor"></circle><circle cx="15" cy="19" r="1" fill="currentColor"></circle><circle cx="12" cy="16" r="1" fill="currentColor"></circle></svg>`
  },
  {
    id: "nutdryfruit",
    label: "Nut & Dry Fruit Cakes",
    shortLabel: "Nut & Dry Fruit",
    icon: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2A4 4 0 0 0 8 6c0 1.66.84 3 2 4a5.002 5.002 0 0 1 0 4 5 5 0 0 0-2 4 4 4 0 0 0 8 0 5 5 0 0 0-2-4 5.002 5.002 0 0 1 0-4c1.16-1 2-2.34 2-4a4 4 0 0 0-4-4z"></path></svg>`
  },
  {
    id: "musttry",
    label: "Must Try",
    shortLabel: "Must Try",
    icon: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
  },
  {
    id: "kids",
    label: "Kids Choice",
    shortLabel: "Kids Choice",
    icon: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="6"></circle><circle cx="6.5" cy="7.5" r="2"></circle><circle cx="17.5" cy="7.5" r="2"></circle><circle cx="10" cy="11.5" r="0.75" fill="currentColor"></circle><circle cx="14" cy="11.5" r="0.75" fill="currentColor"></circle><path d="M11 14.5a1 1 0 0 1 2 0v0.5a1 1 0 0 1-2 0z" fill="currentColor"></path></svg>`
  },
  {
    id: "customized",
    label: "Customized Designs",
    shortLabel: "Customized",
    icon: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5 22 22 17.5 22 12S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"></path><circle cx="7.5" cy="10.5" r="1" fill="currentColor"></circle><circle cx="11.5" cy="7.5" r="1" fill="currentColor"></circle><circle cx="16.5" cy="9.5" r="1" fill="currentColor"></circle><circle cx="15.5" cy="14.5" r="1" fill="currentColor"></circle><circle cx="10.5" cy="16.5" r="1.5"></circle></svg>`
  },
  {
    id: "extras",
    label: "Extras & Add-ons",
    shortLabel: "Extras",
    icon: `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><rect x="5" y="12" width="14" height="9" rx="1"></rect><path d="M12 8v13"></path><path d="M5 16h14"></path><path d="M12 8c-2-2.5-4-2.5-4 0s2 2.5 4 0c2 2.5 4 2.5 4 0s-2-2.5-4 0z"></path></svg>`
  }
];

// Render navigation pills dynamically
const navContainer = document.getElementById('menu-pills-nav');
categories.forEach(cat => {
  const btn = document.createElement('button');
  btn.className = 'menu-pill';
  btn.dataset.category = cat.id;
  btn.innerHTML = `${cat.icon} <span>${cat.shortLabel || cat.label}</span>`;
  btn.addEventListener('click', () => {
    const targetSec = document.getElementById(`sec-${cat.id}`);
    if (targetSec) {
      isManualScrolling = true;
      targetSec.scrollIntoView({ behavior: 'smooth' });
      document.querySelectorAll('.menu-pill').forEach(pill => pill.classList.remove('active'));
      btn.classList.add('active');
      setTimeout(() => { isManualScrolling = false; }, 800);
    }
  });
  navContainer.appendChild(btn);
});

// Setup desktop horizontal mouse scroll & edge-hover scroll helpers
(function setupNavScroll() {
  const navWrapper = navContainer.parentElement;
  if (!navWrapper) return;

  // 1. Mouse wheel horizontal scroll translation
  navWrapper.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      navWrapper.scrollLeft += e.deltaY * 0.7;
    }
  }, { passive: false });

  // 2. Edge-hover smooth scrolling
  let scrollInterval = null;
  navWrapper.addEventListener('mousemove', (e) => {
    const rect = navWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const edgeSize = 65;
    let speed = 0;

    if (x < edgeSize) {
      speed = -1 * (edgeSize - x) * 0.12;
    } else if (x > width - edgeSize) {
      speed = 1 * (x - (width - edgeSize)) * 0.12;
    }

    if (speed !== 0) {
      if (!scrollInterval) {
        scrollInterval = setInterval(() => {
          navWrapper.scrollLeft += speed;
        }, 16);
      }
    } else {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  });

  navWrapper.addEventListener('mouseleave', () => {
    clearInterval(scrollInterval);
    scrollInterval = null;
  });
})();

// Set active navigation pill highlighting on click or scroll
let isManualScrolling = false;
const sectionObserver = new IntersectionObserver((entries) => {
  if (isManualScrolling) return;
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const catId = entry.target.id.replace('sec-', '');
      document.querySelectorAll('.menu-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.category === catId);
      });
      const activePill = document.querySelector(`.menu-pill[data-category="${catId}"]`);
      if (activePill && navContainer) {
        const navWrapper = navContainer.parentElement;
        const pillLeft = activePill.offsetLeft;
        const pillWidth = activePill.offsetWidth;
        const wrapperWidth = navWrapper.offsetWidth;
        navWrapper.scrollTo({
          left: pillLeft - (wrapperWidth / 2) + (pillWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  });
}, { threshold: 0.15, rootMargin: '-10% 0px -60% 0px' });

// Render sections and products grid dynamically
const sectionsContainer = document.getElementById('menu-sections-container');
categories.forEach((cat) => {
  const section = document.createElement('div');
  section.className = 'menu-cat-section';
  section.id = `sec-${cat.id}`;

  const titleWrap = document.createElement('div');
  titleWrap.className = 'menu-cat-title-wrap';
  titleWrap.innerHTML = `
    <div class="menu-cat-decor-line"></div>
    <h3 class="menu-cat-title"><span class="icon-wrap">${cat.icon}</span> ${cat.label}</h3>
    <div class="menu-cat-decor-line"></div>
  `;
  section.appendChild(titleWrap);

  const grid = document.createElement('div');
  grid.className = 'menu-products-grid';

  const catProducts = products.filter(p => p.categories.includes(cat.id));

  if (cat.id === 'extras') {
    const extraItem = catProducts[0];
    if (extraItem) {
      const card = document.createElement('div');
      card.className = 'extras-info-card reveal';
      card.innerHTML = `
        <div class="extras-info-content">
          <span class="extras-info-icon icon-wrap">${cat.icon}</span>
          <h4 class="extras-info-title">${extraItem.name}</h4>
          <p class="extras-info-desc">${extraItem.description}</p>
          <span class="extras-price-tag">${extraItem.price}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        scrollToContact();
      });
      grid.appendChild(card);
    }
  } else {
    catProducts.forEach(product => {
      const card = document.createElement('div');
      card.className = 'menu-product-card reveal';
      card.dataset.id = product.id;

      const badgeHtml = product.images.length > 1 ? `
        <div class="menu-gallery-badge">
          📸 +${product.images.length - 1} Images
        </div>
      ` : '';

      const origPriceHtml = product.originalPrice ? `<span class="menu-product-price-original">${product.originalPrice}</span>` : '';
      const src = getPhysicalImagePath(product.mainImage);

      card.innerHTML = `
        <div class="menu-product-img-wrap">
          ${badgeHtml}
          <img src="${src}" alt="${product.name}" loading="lazy" />
        </div>
        <div class="menu-product-info">
          <h4 class="menu-product-name">${product.name}</h4>
          <p class="menu-product-desc">${product.description}</p>
          <div class="menu-product-meta">
            <div class="menu-product-price-badge">
              <span>${product.price}</span>
              ${origPriceHtml}
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openProductModal(product);
      });

      grid.appendChild(card);
    });
  }

  section.appendChild(grid);
  sectionsContainer.appendChild(section);

  sectionObserver.observe(section);
});

/* ── rebuildMenuFromStorage: called when admin saves data in another tab ── */
function rebuildMenuFromStorage() {
  // Refresh the live products array from localStorage
  const fresh = getLiveProducts();
  // Splice in-place so the same reference stays valid for search handlers
  products.splice(0, products.length, ...fresh);

  // Re-render all category sections
  sectionsContainer.innerHTML = '';

  categories.forEach((cat) => {
    const section = document.createElement('div');
    section.className = 'menu-cat-section';
    section.id = `sec-${cat.id}`;

    const titleWrap = document.createElement('div');
    titleWrap.className = 'menu-cat-title-wrap';
    titleWrap.innerHTML = `
      <div class="menu-cat-decor-line"></div>
      <h3 class="menu-cat-title"><span class="icon-wrap">${cat.icon}</span> ${cat.label}</h3>
      <div class="menu-cat-decor-line"></div>
    `;
    section.appendChild(titleWrap);

    const grid = document.createElement('div');
    grid.className = 'menu-products-grid';

    const catProducts = products.filter(p => p.categories.includes(cat.id));

    if (cat.id === 'extras') {
      const extraItem = catProducts[0];
      if (extraItem) {
        const card = document.createElement('div');
        card.className = 'extras-info-card reveal';
        card.innerHTML = `
          <div class="extras-info-content">
            <span class="extras-info-icon icon-wrap">${cat.icon}</span>
            <h4 class="extras-info-title">${extraItem.name}</h4>
            <p class="extras-info-desc">${extraItem.description}</p>
            <span class="extras-price-tag">${extraItem.price}</span>
          </div>
        `;
        card.addEventListener('click', () => scrollToContact());
        grid.appendChild(card);
      }
    } else {
      catProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'menu-product-card reveal';
        card.dataset.id = product.id;

        const badgeHtml = product.images && product.images.length > 1
          ? `<div class="menu-gallery-badge">📸 +${product.images.length - 1} Images</div>` : '';
        const origPriceHtml = product.originalPrice
          ? `<span class="menu-product-price-original">${product.originalPrice}</span>` : '';
        const src = getPhysicalImagePath(product.mainImage);

        card.innerHTML = `
          <div class="menu-product-img-wrap">
            ${badgeHtml}
            <img src="${src}" alt="${product.name}" loading="lazy" />
          </div>
          <div class="menu-product-info">
            <h4 class="menu-product-name">${product.name}</h4>
            <p class="menu-product-desc">${product.description}</p>
            <div class="menu-product-meta">
              <div class="menu-product-price-badge">
                <span>${product.price}</span>
                ${origPriceHtml}
              </div>
            </div>
          </div>
        `;
        card.addEventListener('click', () => openProductModal(product));
        grid.appendChild(card);
      });
    }

    section.appendChild(grid);
    sectionsContainer.appendChild(section);
    sectionObserver.observe(section);
  });

  // Re-wire scroll reveal
  document.querySelectorAll('.menu-product-card, .extras-info-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.05}s`;
    if (typeof observer !== 'undefined') observer.observe(el);
  });
}

// Setup dynamic scroll reveal observer integration
document.querySelectorAll('.menu-product-card, .extras-info-card').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.05}s`;
  if (typeof observer !== 'undefined') {
    observer.observe(el);
  }
});


// Implement real-time search input filter
const searchInput = document.getElementById('menu-search');
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  let anyVisible = false;

  categories.forEach(cat => {
    const section = document.getElementById(`sec-${cat.id}`);
    if (!section) return;

    if (cat.id === 'extras') {
      const card = section.querySelector('.extras-info-card');
      const item = products.find(p => p.categories.includes('extras'));
      const match = item ? (item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) : false;
      if (card) {
        card.style.display = match ? 'block' : 'none';
      }
      section.style.display = match ? 'block' : 'none';
      if (match) anyVisible = true;
    } else {
      const cards = section.querySelectorAll('.menu-product-card');
      let sectionVisible = false;

      cards.forEach(card => {
        const prodId = parseInt(card.dataset.id);
        const product = products.find(p => p.id === prodId);
        if (!product) { card.style.display = 'none'; return; }
        const match = product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
        card.style.display = match ? 'flex' : 'none';
        if (match) sectionVisible = true;
      });

      section.style.display = sectionVisible ? 'block' : 'none';
      if (sectionVisible) anyVisible = true;
    }
  });

  let noResults = document.getElementById('menu-no-results-msg');
  if (!anyVisible) {
    if (!noResults) {
      noResults = document.createElement('div');
      noResults.id = 'menu-no-results-msg';
      noResults.className = 'menu-no-results';
      noResults.textContent = '🍰 No cakes found matching your search. Try another flavor!';
      sectionsContainer.appendChild(noResults);
    }
  } else {
    if (noResults) {
      noResults.remove();
    }
  }
});

// Modal Gallery Variables & Functions
const modal = document.getElementById('product-gallery-modal');
const modalBackdrop = modal.querySelector('.product-modal-backdrop');
const modalCloseBtn = modal.querySelector('.product-modal-close');
const modalMainImg = document.getElementById('product-modal-main-img');
const modalThumbsContainer = document.getElementById('product-modal-thumbs');
const modalTitle = document.getElementById('product-modal-title');
const modalDesc = document.getElementById('product-modal-desc');
const modalPrice = document.getElementById('product-modal-price');
const modalOriginalPrice = document.getElementById('product-modal-original-price');
const modalOrderBtn = document.getElementById('product-modal-order-btn');
const arrowLeft = modal.querySelector('.arrow-left');
const arrowRight = modal.querySelector('.arrow-right');

let currentProduct = null;
let currentImageIndex = 0;

function openProductModal(product) {
  currentProduct = product;
  currentImageIndex = 0;

  modalTitle.textContent = product.name;
  modalDesc.textContent = product.description;
  modalPrice.textContent = product.price;

  if (product.originalPrice) {
    modalOriginalPrice.textContent = product.originalPrice;
    modalOriginalPrice.style.display = 'inline';
  } else {
    modalOriginalPrice.style.display = 'none';
  }

  updateModalImage();
  buildModalThumbnails();

  if (product.images.length > 1) {
    arrowLeft.style.display = 'flex';
    arrowRight.style.display = 'flex';
    modalThumbsContainer.style.display = 'flex';
  } else {
    arrowLeft.style.display = 'none';
    arrowRight.style.display = 'none';
    modalThumbsContainer.style.display = 'none';
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentProduct = null;
}

function updateModalImage() {
  if (!currentProduct) return;
  const path = currentProduct.images[currentImageIndex];
  modalMainImg.src = getPhysicalImagePath(path);

  modalThumbsContainer.querySelectorAll('.product-thumb-item').forEach((thumb, idx) => {
    thumb.classList.toggle('active', idx === currentImageIndex);
  });
}

function buildModalThumbnails() {
  modalThumbsContainer.innerHTML = '';
  if (!currentProduct) return;
  currentProduct.images.forEach((img, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'product-thumb-item' + (idx === 0 ? ' active' : '');
    thumb.innerHTML = `<img src="${getPhysicalImagePath(img)}" alt="Thumbnail" />`;
    thumb.addEventListener('click', () => {
      currentImageIndex = idx;
      updateModalImage();
    });
    modalThumbsContainer.appendChild(thumb);
  });
}

function nextModalImage() {
  if (!currentProduct) return;
  currentImageIndex = (currentImageIndex + 1) % currentProduct.images.length;
  updateModalImage();
}

function prevModalImage() {
  if (!currentProduct) return;
  currentImageIndex = (currentImageIndex - 1 + currentProduct.images.length) % currentProduct.images.length;
  updateModalImage();
}

// Modal Event Listeners
arrowRight.addEventListener('click', nextModalImage);
arrowLeft.addEventListener('click', prevModalImage);
modalCloseBtn.addEventListener('click', closeProductModal);
modalBackdrop.addEventListener('click', closeProductModal);
modalOrderBtn.addEventListener('click', () => {
  closeProductModal();
  scrollToContact();
});

// Modal Keyboard navigation handler
document.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('open')) return;
  if (e.key === 'Escape') {
    closeProductModal();
  } else if (e.key === 'ArrowRight') {
    nextModalImage();
  } else if (e.key === 'ArrowLeft') {
    prevModalImage();
  }
});
/* ── END NEW MENU JS ── */

/* ══════════════════════════════════════════
   ENHANCEMENTS — Scroll Top, Search Clear,
   Results Count, WhatsApp Modal, Sale Ribbons,
   Hero Particles
   ══════════════════════════════════════════ */

// ── Scroll-to-Top Button ──
(function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 320);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ── Search Clear Button & Results Count ──
(function initSearchEnhancements() {
  const input = document.getElementById('menu-search');
  const clearBtn = document.getElementById('searchClearBtn');
  const countBadge = document.getElementById('searchResultsCount');
  if (!input || !clearBtn || !countBadge) return;

  function updateClearBtn() {
    if (input.value.trim().length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
  }

  function updateResultsCount(query) {
    if (!query) {
      countBadge.classList.remove('visible');
      countBadge.textContent = '';
      return;
    }
    const q = query.toLowerCase();
    let count = 0;
    products.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        count++;
      }
    });
    countBadge.textContent = count === 1 ? '1 cake found' : `${count} cakes found`;
    countBadge.classList.add('visible');
  }

  input.addEventListener('input', () => {
    updateClearBtn();
    updateResultsCount(input.value.trim());
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    updateClearBtn();
    countBadge.classList.remove('visible');
    countBadge.textContent = '';
  });
})();

// ── WhatsApp "Order on WhatsApp" CTA in Modal ──
(function initModalWhatsApp() {
  const waBtn = document.getElementById('product-modal-wa-btn');
  if (!waBtn) return;

  // Update WA link when modal opens
  const originalOpen = window.openProductModal;
  window.openProductModal = function (product) {
    if (typeof originalOpen === 'function') originalOpen(product);
    const msg = encodeURIComponent(`Hi Caramello! I'd like to order: *${product.name}* (${product.price}). Please share details.`);
    waBtn.href = `https://wa.me/918089798979?text=${msg}`;
  };

  // Patch the openProductModal defined earlier in this file
  // (since it's defined as a regular function, we need to intercept via the modal open mechanism)
  const modalOrderBtn = document.getElementById('product-modal-order-btn');
  if (modalOrderBtn) {
    // Re-observe clicks from all product cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-product-card');
      if (!card) return;
      const prodId = parseInt(card.dataset.id);
      const product = products.find(p => p.id === prodId);
      if (!product) return;
      const msg = encodeURIComponent(`Hi Caramello! I'd like to order: *${product.name}* (${product.price}). Please share details.`);
      waBtn.href = `https://wa.me/918089798979?text=${msg}`;
    });
  }
})();

// ── Sale Ribbons on Cards with originalPrice ──
(function injectSaleRibbons() {
  // Wait for cards to be rendered by the dynamic menu JS
  requestAnimationFrame(() => {
    document.querySelectorAll('.menu-product-card').forEach(card => {
      const prodId = parseInt(card.dataset.id);
      const product = products.find(p => p.id === prodId);
      if (product && product.originalPrice) {
        const imgWrap = card.querySelector('.menu-product-img-wrap');
        if (imgWrap && !imgWrap.querySelector('.sale-ribbon')) {
          const ribbon = document.createElement('div');
          ribbon.className = 'sale-ribbon';
          ribbon.textContent = '🏷 SALE';
          imgWrap.insertBefore(ribbon, imgWrap.firstChild);
        }
      }
    });
  });
})();

// ── Hero Floating Particles ──
(function initHeroParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const container = document.createElement('div');
  container.className = 'hero-particles';
  hero.appendChild(container);

  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 40}%;
      animation-duration: ${Math.random() * 8 + 6}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
})();
