import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// Barcode Scanner
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  barcode => {
    document.getElementById("barcode").value = barcode;
    document.getElementById("scanned-barcode").innerText = "Scanned: " + barcode;
    html5QrCode.stop();
  }
);

// Save Product
document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const barcode = document.getElementById("barcode").value;
  const name = document.getElementById("name").value;
  const price = parseFloat(document.getElementById("price").value);
  const stock = parseInt(document.getElementById("stock").value);

  try {
    await setDoc(doc(db, "products", barcode), {
      name, price, stock
    });
    alert("Product saved ✅");
    e.target.reset();
  } catch (err) {
    alert("Error: " + err.message);
  }
});
