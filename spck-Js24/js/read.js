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

// 1. CẤU HÌNH VÀ DỮ LIỆU DỰ PHÒNG

const NEWS_API_URL = "https://saurav.tech/NewsAPI/top-headlines/category/";


const MOCK_NEWS = [
    {
        title: "Artificial Intelligence is Changing How Students Learn English Fast",
        description: "Modern AI tools offer personalized vocabulary lists and instant pronunciation feedback for international learners.",
        urlToImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
        url: "https://bbc.com",
        source: { name: "BBC News" }
    },
    {
        title: "Top 10 Daily Habits to Master English Speaking Confidence",
        description: "Consistency is key when learning a new language. Experts suggest reading international news 15 minutes a day.",
        urlToImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500",
        url: "https://edition.cnn.com",
        source: { name: "CNN Learning" }
    },
    {
        title: "Global Travel Returns: Why English Remains the World Lingua Franca",
        description: "As international tourism reaches new heights, knowing basic conversational English makes traveling smoother.",
        urlToImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500",
        url: "https://reuters.com",
        source: { name: "Reuters World" }
    }
];


// 2. KHỞI TẠO KHI TRANG LÊN XONG

document.addEventListener("DOMContentLoaded", () => {
    fetchNews("general"); 
    setupCategoryButtons(); // Gán sự kiện chuyển danh mục
});


// 3. LẤY DỮ LIỆU BÀI BÁO TỪ API

async function fetchNews(category) {
    const newsGrid = document.getElementById("news-grid");
    if (!newsGrid) return;

    // Hiển thị trạng thái đang tải
    newsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px 0; color: #aaa;">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top: 15px; font-weight: 500;">Đang tải tin tức mới nhất...</p>
        </div>
    `;

    try {
        const response = await fetch(`${NEWS_API_URL}${category}/us.json`);
        if (!response.ok) throw new Error("Lỗi API");

        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            renderNews(data.articles.slice(0, 12)); // Lấy tối đa 12 bài báo đầu tiên
        } else {
            renderNews(MOCK_NEWS);
        }
    } catch (error) {
        console.warn("Dùng dữ liệu dự phòng do lỗi API/Mạng:", error);
        renderNews(MOCK_NEWS);
    }
}


// 4. HIỂN THỊ DANH SÁCH BÀI BÁO RA GIAO DIỆN

function renderNews(articles) {
    const newsGrid = document.getElementById("news-grid");
    if (!newsGrid) return;

    newsGrid.innerHTML = ""; // Xóa dữ liệu cũ/loading

    articles.forEach(article => {
        const imageUrl = article.urlToImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500";
        const title = article.title || "Tin tức Tiếng Anh mới nhất";
        const desc = article.description || "Nhấp vào nút bên dưới để đọc toàn bộ bài báo chi tiết bằng tiếng Anh.";
        const sourceName = article.source?.name || "Global News";

        const card = document.createElement("div");
        card.className = "news-card";
        card.innerHTML = `
            <img src="${imageUrl}" alt="News Image" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500'">
            <div class="news-content">
                <span class="news-source">📌 ${sourceName}</span>
                <h3 class="news-title">${title}</h3>
                <p class="news-desc">${desc}</p>
                <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-btn">
                    Đọc bài gốc <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
        newsGrid.appendChild(card);
    });
}


// 5. BẮT SỰ KIỆN CHUYỂN CHỦ ĐỀ BÁO

function setupCategoryButtons() {
    const buttons = document.querySelectorAll(".cat-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Xóa class active cũ
            buttons.forEach(b => b.classList.remove("active"));

            // Thêm class active cho nút vừa click
            const currentBtn = e.currentTarget;
            currentBtn.classList.add("active");

            // Lấy chủ đề và gọi API tương ứng
            const category = currentBtn.getAttribute("data-category");
            fetchNews(category);
        });
    });
}