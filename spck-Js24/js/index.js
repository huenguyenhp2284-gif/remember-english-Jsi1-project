import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usernameSpan = document.getElementById("username");
const userBtn = document.getElementById("user-btn");

// 1. Tự động lấy tên người dùng trực tiếp từ Firestore khi tải trang
onAuthStateChanged(auth, async (user) => {
    if (user && usernameSpan) {
        try {
            // Tìm document của user trong collection "users" theo UID
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Ưu tiên hiển thị: username -> name -> email
                usernameSpan.textContent = userData.username || userData.name || user.email;
            } else {
                usernameSpan.textContent = user.email || "Guest";
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu từ Firestore:", error);
            usernameSpan.textContent = "Guest";
        }
    } else if (usernameSpan) {
        usernameSpan.textContent = "Guest";
    }
});

// 2. Xử lý Đăng xuất trực tiếp với Firebase Auth
if (userBtn) {
    userBtn.addEventListener("click", () => {
        const logout = confirm("Bạn muốn đăng xuất?");
        if (logout) {
            signOut(auth).then(() => {
                localStorage.removeItem("currentUser");
                window.location.href = "/spck-Js24/html/login.html";
            }).catch((error) => {
                console.error("Lỗi đăng xuất:", error);
            });
        }
    });
}