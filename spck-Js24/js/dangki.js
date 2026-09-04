import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const registerForm = document.querySelector("#registerForm") || document.querySelector("form");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username")?.value.trim() || "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword")?.value.trim() || password;

  // 1. Kiểm tra dữ liệu đầu vào
  if (!email || !password) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Mật khẩu xác nhận không khớp!");
    return;
  }

  try {
    // 2. Tạo tài khoản trên Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 3. Lưu thông tin phụ vào Firestore (Tuyệt đối KHÔNG lưu password)
    await setDoc(doc(db, "users", user.uid), {
      username: username || email.split("@")[0],
      email: email,
      role_id: 2, // 1: Admin, 2: Guest
      createdAt: serverTimestamp()
    });

    alert("🎉 Đăng ký thành công!");
    window.location.href = "/spck-Js24/html/login.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Email này đã được đăng ký rồi!");
    } else if (error.code === "auth/weak-password") {
      alert("Mật khẩu phải từ 6 ký tự trở lên!");
    } else {
      alert("Đăng ký thất bại: " + error.message);
    }
  }
});