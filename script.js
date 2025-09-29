let cart = [];

// Fetch products
fetch("http://localhost:3000/products")
  .then(res => res.json())
  .then(products => {
    const container = document.getElementById("product-list");

    products.forEach(product => {
      const item = document.createElement("div");
      item.classList.add("product");

      item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>KES ${product.price}</p>
        <button class="btn" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
      `;

      container.appendChild(item);
    });
  })
  .catch(err => console.error("Error loading products:", err));

// Add to cart
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
}

// Render cart
function renderCart() {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <span>KES ${item.price * item.qty}</span>
    `;
    cartItems.appendChild(div);
  });

  document.getElementById("total").textContent = `Total: KES ${total}`;
}

// Checkout button
document.getElementById("checkout").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
  } else {
    alert("Thank you for shopping at Mtaani Fresh! 🎉");
    cart = [];
    renderCart();
  }
});
