# project-lab-phase-1
  Mtaani Fresh – Mini E-Commerce Cart  

Mtaani Fresh is a **mini e-commerce web app** designed to connect local vendors with buyers in Kenyan neighborhoods.  
It allows buyers to browse fresh produce, add items to a cart, and checkout in a simple, user-friendly way.  

## live demolink
 https://symphonious-beignet-77b8c0.netlify.app/

## Features  
- 🛒 **Product Listings** – Browse fresh produce with names, prices, and images.  
- 📦 **Add to Cart** – Add/remove items easily with automatic total updates.  
- 📊 **Minimal Cart View** – Clean, simple cart section to track purchases.  
- 🔄 **Local & Online Support** – Works with `json-server` locally and `db.json` on Netlify.  
- 📱 **Responsive Design** – Optimized for both desktop and mobile.  

---

## 📂 Project Structure  

mtaani-fresh/
│── index.html # Main page
│── style.css # Styling
│── script.js # Cart + product logic
│── db.json # Product data
│── images/ # Product images
│── README.md # Project description

2. Install JSON Server
npm install -g json-server

3. Run the API
json-server --watch db.json --port 3000


API will be available at:
http://localhost:3000/products

4. Open the Site

Just open index.html in your browser.
