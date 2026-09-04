import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.querySelector("#loginForm") || document.querySelector("form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Vui lòng nhập Email và Mật khẩu!");
    return;
  }

  try {
    // Gửi lệnh xác thực lên Firebase Auth
    await signInWithEmailAndPassword(auth, email, password);
    alert("🎉 Đăng nhập thành công!");
    window.location.href = "/spck-Js24/index.html";
  } catch (error) {
    alert("Sai tài khoản hoặc mật khẩu!");
  }
});