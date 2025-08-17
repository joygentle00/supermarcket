import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, runTransaction } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// TODO: replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBpcuAHsy27Jta7yo7UJAB350PwLKr9Rgs",
  authDomain: "sales-ebdb2.firebaseapp.com",
  projectId: "sales-ebdb2",
  storageBucket: "sales-ebdb2.firebasestorage.app",
  messagingSenderId: "617047144694",
  appId: "1:617047144694:web:91dc38072d0920e359d4d7",
  measurementId: "G-08PJMBHSXN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let cart = [];
let total = 0;

// Barcode Scanner
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  async (barcode) => {
    document.getElementById("scanned-barcode").innerText = "Scanned: " + barcode;
    await fetchProduct(barcode);
    html5QrCode.stop();
  }
);

async function fetchProduct(barcode) {
  const ref = doc(db, "products", barcode);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const product = snap.data();
    cart.push({ barcode, ...product, qty: 1 });
    total += product.price;
    renderCart();
  } else {
    alert("Product not found");
  }
}

function renderCart() {
  const itemsDiv = document.getElementById("receipt-items");
  itemsDiv.innerHTML = cart.map(item => `
    <div>${item.name} - ₦${item.price} x ${item.qty}</div>
  `).join("");
  document.getElementById("receipt-total").innerText = "Total: ₦" + total;
}

document.getElementById("checkout").addEventListener("click", async () => {
  try {
    await runTransaction(db, async (transaction) => {
      for (let item of cart) {
        const ref = doc(db, "products", item.barcode);
        const snap = await transaction.get(ref);
        if (!snap.exists()) throw "Product missing";
        const newStock = snap.data().stock - item.qty;
        if (newStock < 0) throw "Not enough stock";
        transaction.update(ref, { stock: newStock });
      }
    });
    alert("Checkout complete ✅");
    cart = [];
    total = 0;
    renderCart();
  } catch (err) {
    alert("Error: " + err);
  }
});
