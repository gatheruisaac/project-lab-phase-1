const BASE_URL = ".";
const DB_URL = `${BASE_URL}/db.json`;

let allProducts = [];
let vendors = [];
let cart = loadCart();

const productListEl = document.getElementById("product-list");
const cartItemsEl = document.getElementById("cart-items");
const subtotalEl = document.getElementById("cart-subtotal");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("search");
const checkoutBtn = document.getElementById("checkoutBtn");
const whatsappBtn = document.getElementById("whatsappBtn");

init();

async function init(){
  try{
    const data = await fetch(DB_URL).then(r=>r.json());
    allProducts = data.products || [];
    vendors = data.vendors || [];
    populateCategoryFilter();
    renderProducts(allProducts);
    renderCart();
    attachListeners();
  } catch (err){
    console.error("Failed to load data", err);
    productListEl.innerHTML = `<div class="card">Error loading products. Please ensure db.json is in your project root.</div>`;
  }
}

function populateCategoryFilter(){
  const cats = Array.from(new Set(allProducts.map(p => p.category))).filter(Boolean);
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
}

function renderProducts(products){
  productListEl.innerHTML = "";
  if (!products.length) {
    productListEl.innerHTML = `<div class="card">No products found</div>`;
    return;
  }
  products.forEach(p => {
    const v = vendors.find(x => x.id === p.vendorId) || {};
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" />
      <div class="meta">
        <div>
          <h3>${escapeHtml(p.name)}</h3>
          <div class="vendor-badge">${escapeHtml(v.name || "Local vendor")}</div>
        </div>
        <div class="price">KES ${p.price}</div>
      </div>
      <div class="controls">
        <div class="qty-controls">
          <button class="btn small" data-action="decrement" data-id="${p.id}">-</button>
          <span id="qty-display-${p.id}">1</span>
          <button class="btn small" data-action="increment" data-id="${p.id}">+</button>
        </div>
        <button class="btn primary add-to-cart" data-id="${p.id}">Add to Cart</button>
      </div>
    `;
    productListEl.appendChild(card);

    const dec = card.querySelector('[data-action="decrement"]');
    const inc = card.querySelector('[data-action="increment"]');
    const qtyDisplay = card.querySelector(`#qty-display-${p.id}`);
    let qty = 1;
    dec.addEventListener("click", () => { qty = Math.max(1, qty - 1); qtyDisplay.textContent = qty; });
    inc.addEventListener("click", () => { qty = qty + 1; qtyDisplay.textContent = qty; });
    card.querySelector(".add-to-cart").addEventListener("click", () => {
      addToCart(p.id, qty);
      qty = 1; qtyDisplay.textContent = qty;
    });
  });
}

function attachListeners(){
  categoryFilter.addEventListener("change", applyFilters);
  searchInput.addEventListener("input", debounce(applyFilters, 250));
  checkoutBtn.addEventListener("click", checkout);
  whatsappBtn.addEventListener("click", checkoutViaWhatsApp);
  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "increase") changeQty(id, 1);
    if (btn.dataset.action === "decrease") changeQty(id, -1);
    if (btn.dataset.action === "remove") removeFromCart(id);
  });
}

function applyFilters(){
  const q = (searchInput.value || "").toLowerCase().trim();
  const cat = categoryFilter.value;
  const filtered = allProducts.filter(p => {
    const text = `${p.name} ${(vendors.find(v=>v.id===p.vendorId)||{}).name || ""} ${p.category}`.toLowerCase();
    return (q ? text.includes(q) : true) && (cat ? p.category === cat : true);
  });
  renderProducts(filtered);
}

function addToCart(productId, qty = 1){
  const p = allProducts.find(x => x.id === productId);
  if (!p) return;
  const existing = cart.find(c => c.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty });
  saveCart();
  renderCart();
  flashMessage(`${p.name} added to cart`);
}

function changeQty(productId, delta){
  const c = cart.find(x => x.id === productId);
  if (!c) return;
  c.qty = Math.max(0, c.qty + delta);
  if (c.qty === 0) cart = cart.filter(x => x.id !== productId);
  saveCart();
  renderCart();
}

function removeFromCart(productId){
  cart = cart.filter(x => x.id !== productId);
  saveCart();
  renderCart();
}

function renderCart(){
  cartItemsEl.innerHTML = "";
  if (!cart.length) {
    cartItemsEl.innerHTML = "<div style='padding:12px;color:var(--muted)'>Cart is empty</div>";
    subtotalEl.textContent = "0";
    return;
  }
  let subtotal = 0;
  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-row";
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;
    row.innerHTML = `
      <div class="name">${escapeHtml(item.name)}</div>
      <div class="qty">x${item.qty}</div>
      <div style="min-width:80px; text-align:right">KES ${lineTotal}</div>
    `;
    const controls = document.createElement("div");
    controls.innerHTML = `
      <button class="btn" data-action="decrease" data-id="${item.id}">−</button>
      <button class="btn" data-action="increase" data-id="${item.id}">+</button>
      <button class="btn" data-action="remove" data-id="${item.id}">Remove</button>
    `;
    controls.style.display = "flex";
    controls.style.gap = "6px";
    controls.style.marginTop = "6px";
    row.appendChild(controls);
    cartItemsEl.appendChild(row);
  });
  subtotalEl.textContent = subtotal;
}

function checkout(){
  if (!cart.length) return alert("Your cart is empty.");
  const total = Number(subtotalEl.textContent);
  cart = [];
  saveCart();
  renderCart();
  alert(`Order created locally. Total KES ${total}. Please confirm via WhatsApp.`);
}

function checkoutViaWhatsApp(){
  if (!cart.length) return alert("Your cart is empty.");
  let message = "Mtaani Fresh order:%0A";
  cart.forEach(i => message += `- ${i.name} x${i.qty} = KES ${i.price * i.qty}%0A`);
  message += `%0ATotal: KES ${subtotalEl.textContent}%0A`;
  message += "%0A(Please confirm availability and delivery)";
  const phone = "254700000000";
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, "_blank");
}

function saveCart(){
  localStorage.setItem("mtaani_cart", JSON.stringify(cart));
}
function loadCart(){
  try{
    const raw = localStorage.getItem("mtaani_cart");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function debounce(fn, wait=200){
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function flashMessage(txt){ console.log(txt); }
