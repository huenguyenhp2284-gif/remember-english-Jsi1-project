import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Cấu hình Podcast API
const PODCAST_KEY = "5767c088b7b841c080e9f5f2251ad843"; 
const PODCAST_API = "https://listen-api.listennotes.com/api/v2/search";

// Danh sách bài nghe dự phòng (khi API lỗi hoặc hết lượt)
const MOCK_PODCASTS = [
    {
        title_original: "Lesson 1: Basic English Greetings & Introductions",
        podcast: { title_original: "BBC Learning English" },
        image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title_original: "Lesson 2: Daily Conversations in English",
        podcast: { title_original: "British Council Podcasts" },
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title_original: "Lesson 3: Essential Travel English Vocabulary",
        podcast: { title_original: "6 Minute English" },
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        title_original: "Lesson 4: How to Improve English Pronunciation",
        podcast: { title_original: "TED Talks Daily" },
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    }
];

let currentPlaylist = [];
let currentIndex = 0;

// Các phần tử giao diện
const audio = document.getElementById('main-audio');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const searchInput = document.getElementById('search-input');
const usernameSpan = document.getElementById("username");
const userBtn = document.getElementById("user-btn");

// 1. Kiểm tra tài khoản Firebase Auth
onAuthStateChanged(auth, async (user) => {
    if (user && usernameSpan) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                usernameSpan.textContent = userData.username || userData.name || user.email;
            } else {
                usernameSpan.textContent = user.email || "Guest";
            }
        } catch (error) {
            console.error("Lỗi Firestore:", error);
            usernameSpan.textContent = "Guest";
        }
    } else if (usernameSpan) {
        usernameSpan.textContent = "Guest";
    }
});

// 2. Đăng xuất
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

// 3. Khởi tạo danh sách khi tải xong trang
document.addEventListener("DOMContentLoaded", () => {
    fetchPodcasts("English for beginners");
    setupSearch();
});

// 4. Gọi API Podcast hoặc lấy nguồn dự phòng
async function fetchPodcasts(query) {
    try {
        const url = `${PODCAST_API}?q=${encodeURIComponent(query)}&type=episode&language=English`;
        const response = await fetch(url, {
            headers: { "X-ListenAPI-Key": PODCAST_KEY }
        });
        
        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            currentPlaylist = data.results;
            renderPodcasts(currentPlaylist);
        } else {
            useMockData(query);
        }
    } catch (err) {
        console.warn("API không phản hồi, tải dữ liệu mẫu:", err);
        useMockData(query);
    }
}

function useMockData(query = "") {
    if (!query || query.trim() === "" || query === "English for beginners") {
        currentPlaylist = MOCK_PODCASTS;
    } else {
        const keyword = query.toLowerCase().trim();
        currentPlaylist = MOCK_PODCASTS.filter(item => 
            item.title_original.toLowerCase().includes(keyword) || 
            item.podcast.title_original.toLowerCase().includes(keyword)
        );
    }
    
    const list = document.getElementById('podcast-list');
    if (currentPlaylist.length === 0 && list) {
        list.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">
                <i class="fas fa-search" style="font-size: 40px; margin-bottom: 10px;"></i>
                <p>Không tìm thấy bài nghe nào phù hợp với từ khóa "<b>${query}</b>"</p>
            </div>
        `;
    } else {
        renderPodcasts(currentPlaylist);
    }
}

// 5. Hiển thị danh sách ra giao diện
function renderPodcasts(podcasts) {
    const list = document.getElementById('podcast-list');
    if (!list) return;
    list.innerHTML = "";

    podcasts.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.image}" alt="Cover">
            <h3>${item.title_original}</h3>
            <p>${item.podcast.title_original}</p>
        `;
        card.onclick = () => playTrack(index);
        list.appendChild(card);
    });
}

// 6. Trình phát Audio
function playTrack(index) {
    currentIndex = index;
    const track = currentPlaylist[index];

    document.getElementById('player-img').src = track.image;
    document.getElementById('player-title').innerText = track.title_original;
    document.getElementById('player-artist').innerText = track.podcast.title_original;

    audio.src = track.audio;
    audio.play();
    if (playIcon) playIcon.className = "fas fa-pause";
}

if (playBtn) {
    playBtn.onclick = () => {
        if (!audio.src) return;
        if (audio.paused) {
            audio.play();
            if (playIcon) playIcon.className = "fas fa-pause";
        } else {
            audio.pause();
            if (playIcon) playIcon.className = "fas fa-play";
        }
    };
}

const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
    nextBtn.onclick = () => {
        if (currentPlaylist.length === 0) return;
        currentIndex = (currentIndex + 1) % currentPlaylist.length;
        playTrack(currentIndex);
    };
}

const prevBtn = document.getElementById('prev-btn');
if (prevBtn) {
    prevBtn.onclick = () => {
        if (currentPlaylist.length === 0) return;
        currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        playTrack(currentIndex);
    };
}

const volumeSlider = document.getElementById('volume-slider');
if (volumeSlider) {
    volumeSlider.oninput = (e) => {
        audio.volume = e.target.value;
    };
}

// 7. Xử lý ô Tìm kiếm
function setupSearch() {
    if (!searchInput) return;

    const doSearch = () => {
        const keyword = searchInput.value;
        if (keyword.trim() !== "") fetchPodcasts(keyword);
    };

    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') doSearch();
    };

    const searchIcon = document.querySelector('.search-mini i');
    if (searchIcon) {
        searchIcon.style.cursor = 'pointer';
        searchIcon.onclick = doSearch;
    }
}