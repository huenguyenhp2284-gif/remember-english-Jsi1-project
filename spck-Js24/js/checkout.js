import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
const usernameSpan = document.getElementById("username");
const userBtn = document.getElementById("user-btn");

// 1. Kiểm tra trạng thái đăng nhập và tự động điền thông tin cũ (nếu có)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        if (usernameSpan) usernameSpan.textContent = user.email;

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                if (usernameSpan) usernameSpan.textContent = userData.username || userData.name || user.email;
                if (userData.phone) document.getElementById("phone").value = userData.phone;
                if (userData.address) document.getElementById("address").value = userData.address;
                if (userData.username || userData.name) document.getElementById("fullname").value = userData.username || userData.name;
            }
        } catch (e) {
            console.error("Lỗi tải thông tin user từ Firestore:", e);
        }
    } else {
        alert("Bạn cần đăng nhập để tiến hành thanh toán!");
        window.location.href = "/spck-Js24/html/login.html";
    }
});

// Xử lý nút Đăng xuất
if (userBtn) {
    userBtn.addEventListener("click", () => {
        if (confirm("Bạn muốn đăng xuất?")) {
            signOut(auth).then(() => {
                localStorage.removeItem("currentUser");
                window.location.href = "/spck-Js24/login.html";
            }).catch((error) => console.error("Lỗi đăng xuất:", error));
        }
    });
}

// 2. Lấy thông tin sách đã chọn từ LocalStorage và hiển thị giao diện
const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));

function renderCheckoutInfo() {
    const summaryDiv = document.getElementById("product-summary");
    const totalPriceSpan = document.getElementById("total-price");
    const qrDiv = document.getElementById("qrcode");

    if (!selectedProduct) {
        alert("Không tìm thấy thông tin sản phẩm. Vui lòng chọn lại sách!");
        window.location.href = "/spck-Js24/html/write.html";
        return;
    }

    // Hiển thị tóm tắt sản phẩm
    summaryDiv.innerHTML = `
        <img src="${selectedProduct.image}" alt="${selectedProduct.title}">
        <div class="product-info">
            <h3>${selectedProduct.title}</h3>
            <p>Thể loại: Sách học tiếng Anh</p>
            <p>Giá: <b>$${selectedProduct.price}</b></p>
        </div>
    `;

    totalPriceSpan.textContent = `$${selectedProduct.price}`;

    // Tạo mã QR VietQR tự động (Quy đổi USD sang VND với tỉ giá giả định 25,000đ)
    const amountVND = selectedProduct.price * 25000;
    const qrUrl = `https://img.vietqr.io/image/MB-0916949916-compact2.png?amount=${amountVND}&addInfo=ThanhToanSach${selectedProduct.id}&accountName=LE%20HOANG%20AN`;
    qrDiv.innerHTML = `<img src="${qrUrl}" alt="Mã QR Thanh Toán" style="max-width: 170px; border-radius: 8px;">`;
}

document.addEventListener("DOMContentLoaded", renderCheckoutInfo);

// 3. Xử lý khi người dùng nhấn Xác nhận đặt hàng
const checkoutForm = document.getElementById("checkout-form");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Chặn load lại trang

        if (!currentUser) {
            alert("Vui lòng đăng nhập trước khi đặt hàng!");
            return;
        }

        const fullName = document.getElementById("fullname").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();

        const btnSubmit = document.getElementById("btn-submit-order");
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Đang xử lý...`;

        try {
            // A. Lưu đơn hàng vào Collection "orders" trên Firestore
            await addDoc(collection(db, "orders"), {
                userId: currentUser.uid,
                userEmail: currentUser.email,
                customerName: fullName,
                phone: phone,
                shippingAddress: address,
                book: {
                    id: selectedProduct.id,
                    title: selectedProduct.title,
                    price: selectedProduct.price,
                    image: selectedProduct.image
                },
                status: "Chờ xác nhận",
                createdAt: serverTimestamp()
            });

            // B. Cập nhật thông tin địa chỉ, SĐT vào document của User
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
                name: fullName,
                phone: phone,
                address: address
            }).catch(() => {
                // Bỏ qua nếu document user chưa sẵn sàng
            });

            // C. Dọn dẹp localStorage và bật thông báo thành công
            localStorage.removeItem("selectedProduct");
            document.getElementById("success-overlay").classList.add("active");

        } catch (error) {
            console.error("Lỗi khi lưu đơn hàng lên Firestore:", error);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="fas fa-check-circle"></i> Xác Nhận Đặt Hàng & Giao Hàng`;
        }
    });
}