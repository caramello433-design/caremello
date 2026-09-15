/* ═══════════════════════════════════════════════════════════
   Caramello Admin Panel — JavaScript
   Login + Product CRUD + LocalStorage persistence
═══════════════════════════════════════════════════════════ */

'use strict';
const API_BASE_URL = 'https://caremello-7.onrender.com';

/* ── Admin Credentials (change here to update) ── */
const ADMIN_CREDS = { username: 'admin', password: 'caramello2024' };

/* ── Default product data (seeded from the main site) ── */
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Vanilla Cake", categories: ["regular"], description: "Simple, elegant, and irresistibly delicious — our Vanilla Cake is made with soft and fluffy sponge layered with smooth vanilla-flavoured cream. Decorated with delicate floral piping, this cake brings the perfect balance of sweetness and aroma in every bite. A timeless favourite for birthdays, celebrations, and every special moment.", price: "₹600", originalPrice: null, images: ["all items/VANILA Cake/Screenshot 2026-06-21 190732.png"], mainImage: "all items/VANILA Cake/Screenshot 2026-06-21 190732.png" },
  { id: 2, name: "Classic Mango", categories: ["regular"], description: "Indulge in seasonal mango goodness with fresh fruit layers and delicate cream.", price: "₹700", originalPrice: "₹750", images: ["all items/CLASSIC MANGO/Screenshot 2026-06-21 190254.png"], mainImage: "all items/CLASSIC MANGO/Screenshot 2026-06-21 190254.png" },
  { id: 3, name: "White Forest", categories: ["regular", "chocolate"], description: "A heavenly white chocolate classic cake layered with premium cherries and vanilla cream.", price: "₹700", originalPrice: "₹750", images: ["all items/WHITE  FOREST/Screenshot 2026-06-21 190436.png", "all items/WHITE  FOREST/Screenshot 2026-06-21 190451.png"], mainImage: "all items/WHITE  FOREST/Screenshot 2026-06-21 190436.png" },
  { id: 4, name: "Classic Strawberry", categories: ["regular"], description: "Sweet and appetizing strawberry fruit blast filling inside fluffy cake layers.", price: "₹700", originalPrice: "₹750", images: ["all items/CLASSIC  Strawberry cake/Screenshot 2026-06-21 190631.png"], mainImage: "all items/CLASSIC  Strawberry cake/Screenshot 2026-06-21 190631.png" },
  { id: 5, name: "Black Forest", categories: ["regular", "chocolate"], description: "Experience the classic charm of our Black Forest Cake — soft, moist chocolate sponge layered with rich whipped cream, filled with sweet cherry compote, and beautifully decorated with chocolate shavings and juicy red cherries on top.", price: "₹700", originalPrice: "₹750", images: ["all items/BLACK FOREST/Screenshot 2026-06-21 185200.png", "all items/BLACK FOREST/Screenshot 2026-06-21 191434.png"], mainImage: "all items/BLACK FOREST/Screenshot 2026-06-21 185200.png" },
  { id: 6, name: "Butter Scotch", categories: ["regular", "creamcheese"], description: "Sweet and buttery fudge sauce layered with crunchy butterscotch praline nuts.", price: "₹1,000", originalPrice: null, images: ["all items/Butter Scotch/Screenshot 2026-06-21 201129.png"], mainImage: "all items/Butter Scotch/Screenshot 2026-06-21 201129.png" },
  { id: 7, name: "Blueberry Cake (fruit blast)", categories: ["musttry"], description: "Moist, fluffy cake layers give way to a sweet blueberry filling, while the blueberries dance on your taste buds, leaving a delightful sweetness that lingers.", price: "₹1,050", originalPrice: "₹1,100", images: ["all items/BLUEBERRY CAKE ( FRUIT BLAST)/Screenshot 2026-06-21 194933.png"], mainImage: "all items/BLUEBERRY CAKE ( FRUIT BLAST)/Screenshot 2026-06-21 194933.png" },
  { id: 8, name: "Choco Truffle", categories: ["chocolate"], description: "Decadent chocolate sponge filled and frosted with a rich, silky dark chocolate ganache.", price: "₹900", originalPrice: null, images: ["all items/Choco truffle/Screenshot 2026-06-21 184457.png", "all items/Choco truffle/Screenshot 2026-06-21 184504.png"], mainImage: "all items/Choco truffle/Screenshot 2026-06-21 184457.png" },
  { id: 9, name: "Choco Chip", categories: ["chocolate"], description: "Premium chocolate chips folded into rich chocolate cream layers for ultimate texture.", price: "₹1,150", originalPrice: null, images: ["all items/Choco chip/Screenshot 2026-06-21 184641.png"], mainImage: "all items/Choco chip/Screenshot 2026-06-21 184641.png" },
  { id: 10, name: "Oreo Classic", categories: ["chocolate", "kids"], description: "Crunchy Oreo cookies crushed and folded into fluffy cookies & cream layers.", price: "₹1,150", originalPrice: null, images: ["all items/Oreo Classic/Screenshot 2026-06-21 184800.png"], mainImage: "all items/Oreo Classic/Screenshot 2026-06-21 184800.png" },
  { id: 11, name: "Red Choco", categories: ["chocolate"], description: "Gorgeous red-tinted chocolate sponge layers with a velvety smooth cream coating.", price: "₹1,200", originalPrice: "₹1,247", images: ["all items/Red choco/Screenshot 2026-06-21 184901.png"], mainImage: "all items/Red choco/Screenshot 2026-06-21 184901.png" },
  { id: 12, name: "Choco Nut (Spcl)", categories: ["chocolate", "nutdryfruit"], description: "Rich chocolate loaded with premium nuts.", price: "₹1,250", originalPrice: null, images: ["all items/Choco nut ★★ (spcl)/Screenshot 2026-06-21 185027.png"], mainImage: "all items/Choco nut ★★ (spcl)/Screenshot 2026-06-21 185027.png" },
  { id: 13, name: "Belgium Chocolate", categories: ["chocolate"], description: "Full dark chocolate premium cake.", price: "₹1,399", originalPrice: "₹1,499", images: ["all items/Belgium chocolate cake/Screenshot 2026-06-21 195745.png"], mainImage: "all items/Belgium chocolate cake/Screenshot 2026-06-21 195745.png" },
  { id: 14, name: "Choco Scotch", categories: ["chocolate"], description: "Caramello special choco-butterscotch blend.", price: "₹1,100", originalPrice: null, images: ["all items/Choco  scotch/Screenshot 2026-06-21 185339.png"], mainImage: "all items/Choco  scotch/Screenshot 2026-06-21 185339.png" },
  { id: 15, name: "Nutty Caramel", categories: ["chocolate", "nutdryfruit"], description: "Nutty caramel fresh cream cake combining rich, buttery caramel flavor with the crunch of nuts and the light, creamy texture of our signature cake.", price: "₹1,000", originalPrice: "₹1,100", images: ["all items/Nutty Caramel/Screenshot 2026-06-21 195948.png"], mainImage: "all items/Nutty Caramel/Screenshot 2026-06-21 195948.png" },
  { id: 16, name: "Bubbly Nutz", categories: ["chocolate", "nutdryfruit"], description: "The Bubbly Nutz Cake is a tangy, creamy delight loaded with nuts and choco-nuts! The chocolate cake base has milk, sugar, eggs and chocolate which gives this moist sponge a distinct brownie flavour.", price: "₹1,100", originalPrice: null, images: ["all items/Bubbly Nutz/Screenshot 2026-06-21 200118.png"], mainImage: "all items/Bubbly Nutz/Screenshot 2026-06-21 200118.png" },
  { id: 17, name: "Golden Honey", categories: ["musttry"], description: "Golden Honey – A Taste of Pure Indulgence. Crafted with our exclusive signature recipe, Golden Honey is a soft, velvety cake layered with rich cream and coated in a delicate golden crumb.", price: "₹1,500", originalPrice: "₹1,550", images: ["all items/GOLDEN  HONEY/Screenshot 2026-06-21 193102.png"], mainImage: "all items/GOLDEN  HONEY/Screenshot 2026-06-21 193102.png" },
  { id: 18, name: "Kulfi Almond", categories: ["musttry", "nutdryfruit"], description: "Experience the magic of kulfi in cake form! Our Kulfi Almond Cake is creamy, nutty and irresistibly delicious — layered with kulfi flavour and covered in crunchy almonds.", price: "₹1,350", originalPrice: "₹1,450", images: ["all items/KULFI ALMOND/Screenshot 2026-06-21 193156.png"], mainImage: "all items/KULFI ALMOND/Screenshot 2026-06-21 193156.png" },
  { id: 19, name: "Pistachio Malai", categories: ["musttry", "nutdryfruit"], description: "Discover the luxury of rich malai cream paired with the nutty goodness of pistachios. Our Pistachio Malai Cake is smooth, velvety, and perfectly balanced with crunchy pistachio flakes around the edges.", price: "₹1,400", originalPrice: "₹1,447", images: ["all items/PISTACHIO MALAI/Screenshot 2026-06-21 193307.png"], mainImage: "all items/PISTACHIO MALAI/Screenshot 2026-06-21 193307.png" },
  { id: 20, name: "Vancho", categories: ["musttry", "chocolate", "creamcheese"], description: "Combines white & dark chocolate sponge.", price: "₹1,000", originalPrice: null, images: ["all items/Vancho/Screenshot 2026-06-21 194114.png"], mainImage: "all items/Vancho/Screenshot 2026-06-21 194114.png" },
  { id: 21, name: "Red Velvet (Cream Cheese Filling)", categories: ["musttry", "regular", "creamcheese"], description: "A classic Red Velvet with a luscious cream cheese filling and a rich chocolate truffle addition — the perfect balance of velvety sponge and indulgent cream.", price: "₹1,200", originalPrice: null, images: ["all items/Red velvet (cream chees ) filling type/Screenshot 2026-06-21 194256.png"], mainImage: "all items/Red velvet (cream chees ) filling type/Screenshot 2026-06-21 194256.png" },
  { id: 22, name: "Kit Kat Cake", categories: ["musttry", "chocolate", "kids"], description: "A fun-filled chocolate treat every kid loves! Soft, creamy chocolate cake wrapped in crunchy KitKat bars and topped with a colorful pool of Gems.", price: "₹1,450", originalPrice: "₹1,500", images: ["all items/Kit kat  Cake/Screenshot 2026-06-21 194420.png"], mainImage: "all items/Kit kat  Cake/Screenshot 2026-06-21 194420.png" },
  { id: 23, name: "Honey Almond", categories: ["musttry", "nutdryfruit"], description: "Caramello special premium honey almond.", price: "₹1,200", originalPrice: null, images: ["all items/Honey  Almond/Screenshot 2026-06-21 200529.png"], mainImage: "all items/Honey  Almond/Screenshot 2026-06-21 200529.png" },
  { id: 24, name: "Milky Mix", categories: ["musttry", "creamcheese"], description: "Special white-chocolate & milk-fudge item.", price: "₹1,150", originalPrice: null, images: ["all items/Milky mix/Screenshot 2026-06-21 200650.png"], mainImage: "all items/Milky mix/Screenshot 2026-06-21 200650.png" },
  { id: 25, name: "Milk Nut", categories: ["musttry", "creamcheese"], description: "Caramello special premium milk nut.", price: "₹1,200", originalPrice: null, images: ["all items/Milk nut/Screenshot 2026-06-21 200806.png"], mainImage: "all items/Milk nut/Screenshot 2026-06-21 200806.png" },
  { id: 26, name: "Rainbow", categories: ["musttry", "kids"], description: "Premium type colorful layers.", price: "₹1,400", originalPrice: null, images: ["all items/Rainbow/Screenshot 2026-06-21 200943.png"], mainImage: "all items/Rainbow/Screenshot 2026-06-21 200943.png" },
  { id: 27, name: "Minions face", categories: ["kids", "customized"], description: "Fun Minions face custom designed cake.", price: "Price on request", originalPrice: null, images: ["all items/Minions face/Screenshot 2026-06-21 192102.png"], mainImage: "all items/Minions face/Screenshot 2026-06-21 192102.png" },
  { id: 28, name: "Cocomelon Customized", categories: ["kids", "customized"], description: "Popular Cocomelon theme design cake.", price: "Price on request", originalPrice: null, images: ["all items/Cocomelon Cuztomized design cake/Screenshot 2026-06-21 191859.png"], mainImage: "all items/Cocomelon Cuztomized design cake/Screenshot 2026-06-21 191859.png" },
  { id: 29, name: "Jungle Theme", categories: ["kids", "customized"], description: "Jungle animal theme celebration cake.", price: "Price on request", originalPrice: null, images: ["all items/Cuztomized jungle Theme/Screenshot 2026-06-21 192714.png"], mainImage: "all items/Cuztomized jungle Theme/Screenshot 2026-06-21 192714.png" },
  { id: 30, name: "2 Tier Cartoon Print", categories: ["kids", "customized"], description: "Kids birthday cartoon print 2 tier cake.", price: "Price on request", originalPrice: null, images: ["all items/2 tire Cartoon Print Design Cake/Screenshot 2026-06-21 183838.png"], mainImage: "all items/2 tire Cartoon Print Design Cake/Screenshot 2026-06-21 183838.png" },
  { id: 31, name: "Barbie Design", categories: ["kids", "customized"], description: "Barbie design cake for princesses.", price: "Price on request", originalPrice: null, images: ["all items/barbie design/Screenshot 2026-06-21 174559.png"], mainImage: "all items/barbie design/Screenshot 2026-06-21 174559.png" },
  { id: 32, name: "Heart Shaped", categories: ["customized"], description: "Heart shaped romantic cake design.", price: "Price on request", originalPrice: null, images: ["all items/heart shaped/Screenshot 2026-06-21 175415.png"], mainImage: "all items/heart shaped/Screenshot 2026-06-21 175415.png" },
  { id: 33, name: "Edible Print Cakes", categories: ["customized"], description: "Personalized photos and edible logo prints.", price: "Price on request", originalPrice: null, images: ["all items/Design with Edible print Cakes/Screenshot 2026-06-21 175719.png"], mainImage: "all items/Design with Edible print Cakes/Screenshot 2026-06-21 175719.png" },
  { id: 34, name: "2 Tier Fondant Cake", categories: ["customized"], description: "Tiered celebration cake with custom icing.", price: "Price on request", originalPrice: null, images: ["all items/2  tire  Cream with Fondant Design Cake/Screenshot 2026-06-21 175936.png"], mainImage: "all items/2  tire  Cream with Fondant Design Cake/Screenshot 2026-06-21 175936.png" },
  { id: 35, name: "2 Tier Custom Design", categories: ["customized"], description: "Two-tiered custom theme design cake.", price: "Price on request", originalPrice: null, images: ["all items/2 Tire Cuztomized  Design cake/Screenshot 2026-06-21 192823.png"], mainImage: "all items/2 Tire Cuztomized  Design cake/Screenshot 2026-06-21 192823.png" },
  { id: 36, name: "Cream Fondant Cake", categories: ["customized"], description: "Cream icing with delicate fondant details.", price: "Price on request", originalPrice: null, images: ["all items/Cream with Fondent Design Cake/Screenshot 2026-06-21 184215.png"], mainImage: "all items/Cream with Fondent Design Cake/Screenshot 2026-06-21 184215.png" },
  { id: 37, name: "Custom Design Cake", categories: ["customized"], description: "Theme and custom concept cakes.", price: "Price on request", originalPrice: null, images: ["all items/Cuztomized design cake/Screenshot 2026-06-21 192445.png"], mainImage: "all items/Cuztomized design cake/Screenshot 2026-06-21 192445.png" },
  { id: 38, name: "Simple Design Cakes", categories: ["customized"], description: "Clean, elegant and simple custom cake designs.", price: "Price on request", originalPrice: null, images: ["all items/Simple Design Cakes/Screenshot 2026-06-21 183449.png"], mainImage: "all items/Simple Design Cakes/Screenshot 2026-06-21 183449.png" },
  { id: 39, name: "Two Tier Design Cakes", categories: ["customized"], description: "Double tier beautiful celebration cake.", price: "Price on request", originalPrice: null, images: ["all items/Two Tire Design  Cakes/Screenshot 2026-06-21 192159.png"], mainImage: "all items/Two Tire Design  Cakes/Screenshot 2026-06-21 192159.png" },
  { id: 40, name: "Design Cake", categories: ["customized"], description: "Stunning custom designs tailored to your celebrations.", price: "Price on request", originalPrice: null, images: ["all items/Design cake/Screenshot 2026-06-21 192617.png"], mainImage: "all items/Design cake/Screenshot 2026-06-21 192617.png" },
  { id: 41, name: "Photo / Logo Print Cakes", categories: ["customized"], description: "High-quality edible photo or brand logo prints.", price: "Price on request", originalPrice: null, images: ["all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201347.png"], mainImage: "all items/Photo  print  or  Brand  logo print cakes/Screenshot 2026-06-21 201347.png" },
  { id: 42, name: "Customized", categories: ["customized"], description: "Premium handcrafted customized cakes.", price: "Price on request", originalPrice: null, images: ["all items/Customized/Screenshot 2026-06-21 191725.png"], mainImage: "all items/Customized/Screenshot 2026-06-21 191725.png" },
  { id: 43, name: "Extra Charge", categories: ["extras"], description: "Covers additional custom toppings, midnight delivery fees, and customized decoration items.", price: "Ask us", originalPrice: null, images: ["all items/Extra Charge/Screenshot 2026-06-21 201251.png"], mainImage: "all items/Extra Charge/Screenshot 2026-06-21 201251.png" },
];

/* ── State ── */
let products = [];
let editingId = null;
let deleteTargetId = null;
let toastTimer = null;
let imageUploadState = { existing: [], files: [] };
let orders = [];
// Sync status map: id -> 'idle'|'syncing'|'ok'|'error'
let syncStatus = {};
// Global sync state element will be injected into the topbar
let globalSyncState = { state: 'idle', at: null };

/* ═══════════════════════════════════════════════════════════
   STORAGE
═══════════════════════════════════════════════════════════ */
function loadProducts() {
  try {
    const stored = localStorage.getItem('caramello_products');
    if (stored) {
      products = JSON.parse(stored);
    } else {
      products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)); // deep clone
      saveProducts();
    }
  } catch (e) {
    products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  }
  // initialize sync statuses
  products.forEach(p => { if (p && p.id) syncStatus[p.id] = 'ok'; });
}

function saveProducts() {
  const json = JSON.stringify(products);
  localStorage.setItem('caramello_products', json);

  // Notify any open main-site tab (storage event only fires for OTHER tabs
  // in the same browser, so we also broadcast a custom event for same-tab usage).
  try {
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'caramello_products',
      newValue: json,
      storageArea: localStorage
    }));
  } catch (e) { /* Safari fallback — ignore */ }
  // Best-effort background sync to server (update global status)
  try {
    updateGlobalSyncStatus('Syncing…', 'syncing');
    syncToServer(products).then(() => {
      updateGlobalSyncStatus('Last synced: ' + new Date().toLocaleTimeString(), 'ok');
    }).catch(() => {
      updateGlobalSyncStatus('Sync failed', 'error');
    });
  } catch (e) { /* ignore */ }
}

// Try to sync full product list to backend (best-effort)
async function syncToServer(list) {
  try {
    await fetch(`${API_BASE_URL}/api/products/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list)
    });
  } catch (e) {
    // network issue or server not running — ignore silently
    // console.warn('sync failed', e);
    throw e;
  }
}

// Sync a single product using upsert endpoint (best-effort)
async function syncSingleProduct(item) {
  try {
    const id = item && item.id ? item.id : null;
    if (id) setSyncStatus(id, 'syncing');
    const res = await fetch(`${API_BASE_URL}/api/products/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('upsert failed');
    const data = await res.json();
    const realId = data && data.id ? data.id : id;
    if (realId) setSyncStatus(realId, 'ok');
    return data;
  } catch (e) {
    // ignore
    if (item && item.id) setSyncStatus(item.id, 'error');
    throw e;
  }
}

// Delete product on server (best-effort)
async function deleteOnServer(id) {
  try {
    setSyncStatus(id, 'syncing');
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('delete failed');
    setSyncStatus(id, 'ok');
  } catch (e) {
    // ignore
    setSyncStatus(id, 'error');
  }
}

// Send minimal PATCH update to server
async function patchProductOnServer(id, patch) {
  try {
    setSyncStatus(id, 'syncing');
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error('patch failed');
    const data = await res.json();
    setSyncStatus(id, 'ok');
    return data;
  } catch (e) {
    setSyncStatus(id, 'error');
    throw e;
  }
}

function setSyncStatus(id, state) {
  syncStatus[id] = state;
  updateSyncBadge(id);
}

function updateSyncBadge(id) {
  // Update any badge elements for this product
  try {
    const els = document.querySelectorAll(`[data-sync-id="${id}"]`);
    els.forEach(el => {
      el.className = 'pc-sync-badge ' + (syncStatus[id] || 'idle');
      if (syncStatus[id] === 'syncing') el.textContent = '⏳';
      else if (syncStatus[id] === 'ok') el.textContent = '✔';
      else if (syncStatus[id] === 'error') el.textContent = '⚠';
      else el.textContent = '';
    });
  } catch (e) { }
}

function updateGlobalSyncStatus(text, state) {
  globalSyncState = { state, at: new Date() };
  let el = document.getElementById('globalSyncStatus');
  if (!el) {
    const container = document.querySelector('.topbar .topbar-right');
    if (!container) return;
    el = document.createElement('div');
    el.id = 'globalSyncStatus';
    el.className = 'global-sync-status';
    el.style.marginLeft = '12px';
    el.style.fontSize = '0.9rem';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    container.appendChild(el);
  }
  el.textContent = text;
  el.dataset.state = state;
}

function nextId() {
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

/* ═══════════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════════ */
function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  const errEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';

  setTimeout(() => {
    btn.style.opacity = '';
    btn.style.pointerEvents = '';

    if (user === ADMIN_CREDS.username && pass === ADMIN_CREDS.password) {
      errEl.style.display = 'none';
      sessionStorage.setItem('caramello_admin_auth', '1');
      showDashboard();
    } else {
      errEl.style.display = 'flex';
      document.getElementById('adminPass').value = '';
      document.getElementById('adminPass').focus();
    }
  }, 600);
}

function togglePass() {
  const input = document.getElementById('adminPass');
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  document.getElementById('eyeOpen').style.display = isPass ? 'none' : '';
  document.getElementById('eyeClosed').style.display = isPass ? '' : 'none';
}

/* ── Forgot Password ── */
function showForgotPassword() {
  const panel = document.getElementById('forgotPanel');
  panel.classList.add('visible');
  panel.setAttribute('aria-hidden', 'false');
  // Reset reveal state each time
  document.getElementById('fpPassword').textContent = '••••••••••••';
  document.getElementById('fpEyeOpen').style.display = '';
  document.getElementById('fpEyeClosed').style.display = 'none';
  document.getElementById('fpUsername').textContent = ADMIN_CREDS.username;
}

function hideForgotPassword() {
  const panel = document.getElementById('forgotPanel');
  panel.classList.remove('visible');
  panel.setAttribute('aria-hidden', 'true');
}

function toggleFPReveal() {
  const passEl = document.getElementById('fpPassword');
  const eyeOpen = document.getElementById('fpEyeOpen');
  const eyeClosed = document.getElementById('fpEyeClosed');
  const revealed = passEl.textContent !== '••••••••••••';
  passEl.textContent = revealed ? '••••••••••••' : ADMIN_CREDS.password;
  eyeOpen.style.display = revealed ? '' : 'none';
  eyeClosed.style.display = revealed ? 'none' : '';
}

function fillCredentials() {
  hideForgotPassword();
  document.getElementById('adminUser').value = ADMIN_CREDS.username;
  document.getElementById('adminPass').value = ADMIN_CREDS.password;
  // Brief delay for visual feedback, then submit
  setTimeout(() => {
    document.getElementById('loginForm').requestSubmit();
  }, 180);
}


function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';
  loadProducts();
  loadOrders();
  updateDashboard();
  renderProducts();
  setupFormListeners();
}

function logout() {
  sessionStorage.removeItem('caramello_admin_auth');
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginForm').reset();
  document.getElementById('loginError').style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════ */
const SECTIONS = ['dashboard', 'products', 'orders', 'add'];
const NAV_IDS = { dashboard: 'navDashboard', products: 'navProducts', orders: 'navOrders', add: 'navAdd' };
const BC_TEXT = { dashboard: 'Dashboard', products: 'All Products', orders: 'Customer Orders', add: 'Add / Edit Product' };

function showSection(name) {
  SECTIONS.forEach(s => {
    document.getElementById(`section${cap(s)}`).classList.toggle('active-section', s === name);
    document.getElementById(NAV_IDS[s]).classList.toggle('active', s === name);
  });
  document.getElementById('breadcrumbText').textContent = BC_TEXT[name];

  if (name === 'dashboard') updateDashboard();
  if (name === 'products') renderProducts();
  if (name === 'orders') renderOrders();
  if (name === 'add' && editingId === null) resetForm();

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

async function loadOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`);
    if (!response.ok) throw new Error('orders unavailable');
    orders = await response.json();
    document.getElementById('orderCount').textContent = orders.filter(order => order.status === 'new').length;
    renderOrders();
  } catch (error) {
    document.getElementById('ordersList').innerHTML = '<div class="orders-empty">Could not load orders.</div>';
  }
}

function renderOrders() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  if (!orders.length) {
    container.innerHTML = '<div class="orders-empty">No customer orders yet.</div>';
    return;
  }
  container.innerHTML = orders.map(order => `
    <article class="order-card">
      <div class="order-card-main">
        <div class="order-card-title"><strong>${escapeHtml(order.customerName)}</strong><span class="order-id">#${order.id}</span></div>
        <a class="order-phone" href="tel:${escapeHtml(order.phone)}">${escapeHtml(order.phone)}</a>
        <div class="order-meta">${escapeHtml(order.category || 'Category not specified')} &middot; ${new Date(order.createdAt).toLocaleString()}</div>
        ${order.note ? `<p class="order-note">${escapeHtml(order.note)}</p>` : ''}
      </div>
      <div class="order-card-actions">
        <select aria-label="Order status" onchange="updateOrderStatus(${order.id}, this.value)">
          ${['new', 'contacted', 'completed', 'cancelled'].map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status[0].toUpperCase() + status.slice(1)}</option>`).join('')}
        </select>
        <button type="button" class="order-delete-btn" onclick="deleteOrder(${order.id})">Delete</button>
      </div>
    </article>`).join('');
}

async function updateOrderStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  if (!response.ok) { showToast('Could not update order.', 'error'); return; }
  const order = orders.find(item => item.id === id);
  if (order) order.status = status;
  document.getElementById('orderCount').textContent = orders.filter(item => item.status === 'new').length;
}

async function deleteOrder(id) {
  if (!window.confirm('Delete this customer order?')) return;
  const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: 'DELETE' });
  if (!response.ok) { showToast('Could not delete order.', 'error'); return; }
  orders = orders.filter(order => order.id !== id);
  document.getElementById('orderCount').textContent = orders.filter(order => order.status === 'new').length;
  renderOrders();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
function updateDashboard() {
  const total = products.length;
  const musttry = products.filter(p => p.categories.includes('musttry')).length;
  const choco = products.filter(p => p.categories.includes('chocolate')).length;
  const custom = products.filter(p => p.categories.includes('customized')).length;

  animateNumber('statTotal', total);
  animateNumber('statMustTry', musttry);
  animateNumber('statChoco', choco);
  animateNumber('statCustom', custom);
  document.getElementById('productCount').textContent = total;

  // Category bars
  const cats = [
    { key: 'regular', label: 'Regular' },
    { key: 'chocolate', label: 'Chocolate' },
    { key: 'musttry', label: 'Must Try' },
    { key: 'kids', label: 'Kids' },
    { key: 'customized', label: 'Customized' },
    { key: 'creamcheese', label: 'Cream Cheese' },
    { key: 'nutdryfruit', label: 'Nut & Dry Fruit' },
  ];
  const barsEl = document.getElementById('categoryBars');
  barsEl.innerHTML = '';
  const maxCount = Math.max(1, ...cats.map(c => products.filter(p => p.categories.includes(c.key)).length));
  cats.forEach(c => {
    const count = products.filter(p => p.categories.includes(c.key)).length;
    const pct = Math.round((count / maxCount) * 100);
    const row = document.createElement('div');
    row.className = 'cat-bar-item';
    row.innerHTML = `
      <span class="cat-bar-label">${c.label}</span>
      <div class="cat-bar-track"><div class="cat-bar-fill" data-pct="${pct}" style="width:0%"></div></div>
      <span class="cat-bar-count">${count}</span>`;
    barsEl.appendChild(row);
  });
  setTimeout(() => {
    barsEl.querySelectorAll('.cat-bar-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 80);

  // Recent table (last 8 products)
  const tbody = document.getElementById('recentTableBody');
  tbody.innerHTML = '';
  const recent = [...products].slice(-8).reverse();
  recent.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${p.id}</td>
      <td class="tbl-name">${esc(p.name)}</td>
      <td class="tbl-price">${esc(p.price)}</td>
      <td><div class="tbl-cats">${p.categories.map(c => `<span class="tbl-cat-tag">${c}</span>`).join('')}</div></td>
      <td><button class="tbl-edit-btn" onclick="editProduct(${p.id})">Edit</button></td>`;
    tbody.appendChild(tr);
  });
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const dur = 500;
  const t0 = performance.now();
  function step(now) {
    const prog = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(start + diff * easeOut(prog));
    if (prog < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

/* ═══════════════════════════════════════════════════════════
   PRODUCTS GRID
═══════════════════════════════════════════════════════════ */
function renderProducts(list = null) {
  const grid = document.getElementById('productsGrid');
  const data = list !== null ? list : products;
  grid.innerHTML = '';

  if (!data.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text3);padding:60px 0;font-size:0.95rem;">No products found.</div>';
    return;
  }

  data.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${i * 0.04}s`;

    const hasImg = p.mainImage && p.mainImage.trim();
    const imgHtml = hasImg
      ? `<img class="pc-img" src="${esc(p.mainImage)}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="pc-img-placeholder" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>No image</span></div>`
      : `<div class="pc-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span>No image</span></div>`;

    const origHtml = p.originalPrice ? `<span class="pc-orig">${esc(p.originalPrice)}</span>` : '';

    card.innerHTML = `
      <div class="pc-img-wrap">
        ${imgHtml}
        <span class="pc-id-badge">#${p.id}</span>
        <span class="pc-sync-badge ${syncStatus[p.id] || 'idle'}" data-sync-id="${p.id}"></span>
      </div>
      <div class="pc-body">
        <div class="pc-cats">${p.categories.map(c => `<span class="pc-cat">${c}</span>`).join('')}</div>
        <div class="pc-name" title="${esc(p.name)}">${esc(p.name)}</div>
        <div class="pc-desc">${esc(p.description)}</div>
        <div class="pc-footer">
          <div class="pc-pricing">
            <span class="pc-price">${esc(p.price)}</span>
            ${origHtml}
          </div>
          <div class="pc-actions">
            <button class="pc-btn edit" title="Edit" onclick="editProduct(${p.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="pc-btn del" title="Delete" onclick="deleteProduct(${p.id})">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  // Initialize sync badges for rendered items
  data.forEach(p => { if (p && p.id) updateSyncBadge(p.id); });
}

function filterProducts() {
  const q = document.getElementById('productSearch').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const filtered = products.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchCat = cat === 'all' || p.categories.includes(cat);
    return matchQ && matchCat;
  });
  renderProducts(filtered);
}

/* ═══════════════════════════════════════════════════════════
   FORM — ADD / EDIT
═══════════════════════════════════════════════════════════ */
function setupFormListeners() {
  const fields = ['pName', 'pPrice', 'pOriginalPrice', 'pDescription'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
  });
  document.getElementById('pImageFiles').addEventListener('change', event => {
    imageUploadState.files = Array.from(event.target.files || []);
    renderImageUploadPreview();
    updatePreview();
  });

  // Category checkboxes
  document.querySelectorAll('.cat-check input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.cat-check').classList.toggle('checked', cb.checked);
      updatePreview();
    });
  });
}

function resetForm() {
  editingId = null;
  document.getElementById('editId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('formTitle').textContent = 'Add New Product';
  document.getElementById('formSubtitle').textContent = 'Fill in the details below to add a new cake to your menu';
  document.getElementById('saveBtnText').textContent = 'Save Product';
  imageUploadState = { existing: [], files: [] };
  document.getElementById('pImageFiles').value = '';
  renderImageUploadPreview();

  // Uncheck all categories
  document.querySelectorAll('.cat-check').forEach(el => {
    el.classList.remove('checked');
    el.querySelector('input').checked = false;
  });

  updatePreview();
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  editingId = id;
  showSection('add');

  document.getElementById('editId').value = id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pOriginalPrice').value = p.originalPrice || '';
  document.getElementById('pDescription').value = p.description;
  imageUploadState = { existing: [...(p.images || [])], files: [] };
  document.getElementById('pImageFiles').value = '';
  renderImageUploadPreview();

  // Categories
  document.querySelectorAll('.cat-check').forEach(el => {
    const val = el.querySelector('input').value;
    const checked = p.categories.includes(val);
    el.querySelector('input').checked = checked;
    el.classList.toggle('checked', checked);
  });

  document.getElementById('formTitle').textContent = 'Edit Product';
  document.getElementById('formSubtitle').textContent = `Editing: ${p.name}`;
  document.getElementById('saveBtnText').textContent = 'Update Product';

  updatePreview();
  window.scrollTo(0, 0);
}

async function saveProduct(e) {
  e.preventDefault();

  const name = document.getElementById('pName').value.trim();
  const price = document.getElementById('pPrice').value.trim();
  const orig = document.getElementById('pOriginalPrice').value.trim();
  const desc = document.getElementById('pDescription').value.trim();
  const selectedFiles = imageUploadState.files;

  const selectedCats = [];
  document.querySelectorAll('.cat-check input:checked').forEach(cb => selectedCats.push(cb.value));

  if (!selectedCats.length) {
    showToast('Please select at least one category.', 'error');
    return;
  }

  if (!selectedFiles.length && !imageUploadState.existing.length) {
    showToast('Please upload at least one image.', 'error');
    return;
  }

  let uploadedImages = [];
  if (selectedFiles.length) {
    const uploadData = new FormData();
    selectedFiles.forEach(file => uploadData.append('images', file));
    const uploadResponse = await fetch(`${API_BASE_URL}/api/uploads`, { method: 'POST', body: uploadData });
    if (!uploadResponse.ok) {
      showToast('Image upload failed. Please try again.', 'error');
      return;
    }
    uploadedImages = (await uploadResponse.json()).urls || [];
  }
  const allImages = [...imageUploadState.existing, ...uploadedImages];
  const mainImg = allImages[0] || '';

  if (editingId !== null) {
    // Update
    const idx = products.findIndex(p => p.id === editingId);
    if (idx !== -1) {
      const prev = Object.assign({}, products[idx]);
      products[idx] = {
        ...products[idx],
        name, price,
        originalPrice: orig || null,
        description: desc,
        mainImage: mainImg,
        images: allImages,
        categories: selectedCats
      };

      // compute minimal patch
      const patch = {};
      if (products[idx].name !== prev.name) patch.name = products[idx].name;
      if (products[idx].price !== prev.price) patch.price = products[idx].price;
      if ((products[idx].originalPrice || null) !== (prev.originalPrice || null)) patch.originalPrice = products[idx].originalPrice || null;
      if ((products[idx].description || '') !== (prev.description || '')) patch.description = products[idx].description || '';
      if ((products[idx].mainImage || '') !== (prev.mainImage || '')) patch.mainImage = products[idx].mainImage || null;
      if (JSON.stringify(products[idx].images || []) !== JSON.stringify(prev.images || [])) patch.images = products[idx].images || [];
      if (JSON.stringify(products[idx].categories || []) !== JSON.stringify(prev.categories || [])) patch.categories = products[idx].categories || [];

      saveProducts();
      showToast(`✅ "${name}" updated successfully!`, 'success');

      // send PATCH with only changed fields (best-effort)
      if (Object.keys(patch).length > 0) {
        try {
          patchProductOnServer(editingId, patch).catch(() => { });
        } catch (e) { }
      }
    }
  } else {
    // Add
    const newProduct = {
      id: nextId(),
      name, price,
      originalPrice: orig || null,
      description: desc,
      mainImage: mainImg,
      images: allImages,
      categories: selectedCats
    };
    products.push(newProduct);
    saveProducts();
    showToast(`🎉 "${name}" added to the menu!`, 'success');
    try { syncSingleProduct(newProduct); } catch (e) { }
  }

  document.getElementById('productCount').textContent = products.length;
  editingId = null;
  showSection('products');
}

function cancelEdit() {
  resetForm();
  showSection('products');
}

/* ═══════════════════════════════════════════════════════════
   LIVE PREVIEW
═══════════════════════════════════════════════════════════ */
function imagePreviewUrl(image) {
  if (!image) return '';
  if (image.startsWith('/') || image.startsWith('http')) return image;
  return `products/${image}`;
}

function renderImageUploadPreview() {
  const container = document.getElementById('imageUploadPreview');
  if (!container) return;
  const existing = imageUploadState.existing.map((image, index) => `
    <div class="upload-thumb">
      <img src="${imagePreviewUrl(image)}" alt="Selected product image" />
      <button type="button" class="upload-remove" onclick="removeExistingImage(${index})" aria-label="Remove image">&times;</button>
    </div>`).join('');
  const files = imageUploadState.files.map((file, index) => `
    <div class="upload-thumb">
      <img src="${URL.createObjectURL(file)}" alt="New product image" />
      <button type="button" class="upload-remove" onclick="removeNewImage(${index})" aria-label="Remove image">&times;</button>
    </div>`).join('');
  container.innerHTML = existing + files || '<span class="upload-empty">No images selected</span>';
}

function removeExistingImage(index) {
  imageUploadState.existing.splice(index, 1);
  renderImageUploadPreview();
  updatePreview();
}

function removeNewImage(index) {
  imageUploadState.files.splice(index, 1);
  const input = document.getElementById('pImageFiles');
  const dataTransfer = new DataTransfer();
  imageUploadState.files.forEach(file => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
  renderImageUploadPreview();
  updatePreview();
}

function updatePreview() {
  const name = document.getElementById('pName').value.trim() || 'Product Name';
  const price = document.getElementById('pPrice').value.trim() || '₹0';
  const orig = document.getElementById('pOriginalPrice').value.trim();
  const desc = document.getElementById('pDescription').value.trim() || 'Product description will appear here…';
  const firstFile = imageUploadState.files[0];
  const img = imageUploadState.existing[0] || (firstFile ? URL.createObjectURL(firstFile) : '');

  document.getElementById('previewName').textContent = name;
  document.getElementById('previewPrice').textContent = price;
  document.getElementById('previewDesc').textContent = desc;

  const origEl = document.getElementById('previewOrig');
  if (orig) { origEl.textContent = orig; origEl.style.display = ''; }
  else { origEl.style.display = 'none'; }

  const imgEl = document.getElementById('previewImg');
  const phEl = document.getElementById('previewPlaceholder');
  if (img) {
    imgEl.src = img;
    imgEl.style.display = '';
    phEl.style.display = 'none';
    imgEl.onerror = () => { imgEl.style.display = 'none'; phEl.style.display = 'flex'; };
  } else {
    imgEl.style.display = 'none';
    phEl.style.display = 'flex';
  }

  const cats = [];
  document.querySelectorAll('.cat-check input:checked').forEach(cb => cats.push(cb.value));
  const catsEl = document.getElementById('previewCats');
  catsEl.innerHTML = cats.map(c => `<span class="preview-cat-tag">${c}</span>`).join('');
}

/* ═══════════════════════════════════════════════════════════
   DELETE
═══════════════════════════════════════════════════════════ */
function deleteProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  deleteTargetId = id;
  document.getElementById('deleteModalMsg').textContent = `Are you sure you want to delete "${p.name}"? This action cannot be undone.`;
  document.getElementById('deleteModal').style.display = 'flex';
}

function confirmDelete() {
  if (deleteTargetId === null) return;
  const p = products.find(x => x.id === deleteTargetId);
  const idToDelete = deleteTargetId;
  products = products.filter(x => x.id !== idToDelete);
  saveProducts();
  try { deleteOnServer(idToDelete); } catch (e) { }
  closeDeleteModal();
  showToast(`🗑️ "${p ? p.name : 'Product'}" deleted.`, 'success');
  document.getElementById('productCount').textContent = products.length;
  renderProducts();
}

function closeDeleteModal(e) {
  if (e && e.target !== document.getElementById('deleteModal')) return;
  document.getElementById('deleteModal').style.display = 'none';
  deleteTargetId = null;
}

/* ═══════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════ */
function showToast(msg, type = '') {
  const toast = document.getElementById('adminToast');
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'admin-toast' + (type ? ` ${type}` : '');
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ═══════════════════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════════════════ */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ═══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('deleteModal').style.display === 'flex') {
      closeDeleteModal();
    }
  }
});

/* ═══════════════════════════════════════════════════════════
   INIT — Auto-check session
═══════════════════════════════════════════════════════════ */
(function init() {
  if (sessionStorage.getItem('caramello_admin_auth') === '1') {
    showDashboard();
  }
})();
