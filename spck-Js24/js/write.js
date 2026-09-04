import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const usernameSpan = document.getElementById("username");
const userBtn = document.getElementById("user-btn");
const detailDiv = document.getElementById("product-detail"); // Bổ sung khai báo bị thiếu

// 1. Tự động lấy tên người dùng từ Firestore
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
            console.error("Lỗi lấy dữ liệu từ Firestore:", error);
            usernameSpan.textContent = "Guest";
        }
    } else if (usernameSpan) {
        usernameSpan.textContent = "Guest";
    }
});

// 2. Xử lý Đăng xuất
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

// 3. DANH SÁCH SÁCH (MOCK DATA)
const PRODUCTS_DB = [
  { id: 1, title: "Tiếng Anh cho người bắt đầu",
     price: 100, category: "Book",
     description: "Cuốn sách Tiếng Anh Cho Người Bắt Đầu của hai tác giả Trang Anh và Minh Trang là giải pháp hoàn hảo giúp bạn phá tan rào cản sợ tiếng Anh và từng bước xây dựng lại nền tảng vững chắc từ con số 0.",
     image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg4HKY_UjYULs2PaOTDRhs2ubsZXQoWwEYVKqSa1Ol_gpqRhiW1JphgvzbJ3YfIy5atRC2ZtkI00BapDn-1mA7BABZ3-0uiXtvDNRvL806IX1LhWbObPNnggUPqrlO4-Tk8fxKLHwkYtQ_e07AreBuDH5ZjegdwDZLIC9WGsY3gxNkByPMdF1df4tke4A/s960/tieng-anh-cho-nguoi-bat-dau.jpg" 
    },

  { id: 2, title: "Write in Use",
    price: 50, category: "Book",
    description: "Cuốn Let's write! 2 - Viết ĐOẠN nâng cao của tác giả Trần Thanh Hương và Ngô Hà Thu là sách chuyên sâu về kỹ năng viết (Writing) dành cho người học ở trình độ trung cấp (B1–B2).",
    image: "https://pos.nvncdn.com/fd5775-40602/ps/content/Let-s-Write-2-Viet-Doan-Nang-Cao-Danh-Cho-Hoc-Sinh-Trinh-Do-B1-B2-4.png" 
    },

   {id: 3, title: "Tự học tiếng anh giao tiếp",
    price: 67, category: "Book", 
    description: "Sách Tự Học Tiếng Anh Giao Tiếp Cho Người Đi Làm của tác giả Trần Trinh Tường được thiết kế tối ưu cho người bận rộn muốn nâng cao năng lực ngoại ngữ để phục vụ công việc.", 
    image: "https://mcbooks.vn/wp-content/uploads/2025/04/Bia-3D-Thang-hang-tieng-Anh-bat-nhanh-co-hoi-thang-tien-Tu-hoc-tieng-Anh-giao-tiep-cho-nguoi-di-lam.jpg" 
    },

  { id: 4, title: "Luyện tập writing" , 
    price: 150, category: "Book", 
    description: "Sách IELTS Từ A Đến Z - Writing của tác giả ThS. Lưu Minh Hiển (WISE English) là tài liệu chuyên sâu giúp người học chinh phục kỹ năng viết trong kỳ thi IELTS từ nền tảng đến nâng cao.", 
    image: "https://wiseenglish.edu.vn/wp-content/uploads/2020/12/sach-ielts-writing-review.jpg.webp" 
    },
  { id: 5, title: "Combo 3 quyển sách luyện thi write giảm sốc 50%" , 
    price: 300, category: "Book", 
    description:"Luyện ôn write cấp tốc full combo 3 bộ sách từ 500$ còn 300$. Sách Ready to Write 2: Perfecting Paragraphs (ấn bản lần thứ 5) của hai tác giả Karen Blanchard và Christine Root, do Nhà xuất bản Pearson phát hành. Đây là giáo trình chuẩn quốc tế chuyên biệt về kỹ năng viết đoạn văn tiếng Anh.", 
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxgrCSkdqsdkmLjYb4-9Tpf9TO2Lp-8mW5Zw&s" 
    },
  { id: 6, title: "Cambridge Grammar for IELTS" , 
    price: 90, category: "Book", 
    description: "Sách Cambridge Grammar for IELTS with Answers của Diana Hopkins và Pauline Cullen (Cambridge University Press) là cuốn tài liệu kinh điển giúp tổng hợp và ứng dụng ngữ pháp chuyên biệt cho kỳ thi IELTS.", 
    image: "https://media.zim.vn/642bd2c38d89f0fcc1a15854/cambridge-grammar-for-ielts.jpeg" 
    },

  { id: 7, title: "Conquer Creative Writing For Primary Levels" , 
    price: 67, category: "Book", 
    description: "Combo 6 quyển này giúp bé giao tiếp cơ bản.Bộ sách Conquer Creative Writing For Primary Levels (gồm các tập từ Level 1 đến 6) của Singapore Asia Publishers là chuỗi giáo trình luyện viết sáng tạo tiếng Anh được thiết kế bài bản cho học sinh cấp tiểu học.", 
    image: "https://babilala.vn/wp-content/uploads/2023/02/e4BsMblHpL1FUms7HeJyiiQBGHkxYur-FhgFPhMPEhPCNa0TCvx1oW3jVBNEN5oaJ24t6LTG5ZjKSnibt3XqBDzh3MGhcFPlivUKPFmkLWLSQWzoLfc_3L8Sc2qER5pdrfSwvF_-SehMnuEItVBiaOc"
     },

  { id: 8, title: "Sách tiếng anh cho bé lớp ba tập 1 " ,
     price: 87, category: "Book", 
     description: "sách giáo khoa Tiếng Anh Lớp 3 (học kỳ 2), giúp bé dễ dàng củng cố kiến thức trên lớp, Giúp học sinh luyện viết từ vựng, cụm từ và các cấu trúc câu cơ bản, đồng thời rèn luyện thói quen viết chữ rõ ràng, đúng chuẩn.", 
     image: "https://bmyc.vn/wp-content/uploads/2024/05/sach-luyen-viet-tieng-anh-cho-be-lop-3.jpg" 
    },

  { id: 9, title: "Combo 3 quyển tiếng anh Thành thạo tiếng anh" , 
    price: 167, 
    category: "Book", 
    description: "Combo 3 quyển Sổ tay thành thạo tiếng anh, Sách Sổ Tay Thành Thạo Tiếng Anh - Luyện Từ Vựng + Ngữ Pháp của hai tác giả Trần Vũ Minh Ngọc và Nguyễn Tạ Trà Lam (NXB Thanh Niên)", 
    image: "https://product.hstatic.net/200000830411/product/n-thi-6-5-ielts-va-thanh-thao-tieng-anh-bang-phuong-phap-nghe-doc-dich_c8aa48cb6d5e481b9ff7f8617dd12ca0_grande.jpg"
     },

  { id: 10, title: "Từ vựng học tiếng anh Mind map" , 
    price: 67, 
    category: "Book", 
    description: "Sách Mind Map English Grammar - Ngữ Pháp Tiếng Anh Bằng Sơ Đồ Tư Duy của nhóm tác giả Đỗ Nhung, Đỗ Duyên, Trịnh Hà (MCBooks phát hành) là giải pháp đột phá giúp đổi mới phương pháp học ngữ pháp khô khan truyền thống.", 
    image :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9pIbyr2bW45ytNRTlPdKdYml-9ITBM1MPIQ&s.jpg" 
    },

  { id: 11, title: "Sách từ vựng chuyên ngành khách sạn" , 
    price: 600, category: "Book", 
    description: "Sách Giao Tiếp Tiếng Anh Chuyên Ngành Khách Sạn (Be My Guest) của nhóm tác giả TheWindy (NXB Đại Học Quốc Gia Hà Nội) là tài liệu chuyên sâu dành riêng cho ngành dịch vụ nhà hàng - khách sạn , Cung cấp từ vựng, cụm từ và mẫu câu giao tiếp xoay quanh các công việc hàng ngày như check-in, check-out, đặt phòng, giới thiệu dịch vụ, hướng dẫn đường đi và tiếp nhận phản hồi từ khách hàng.", 
    image :"https://english4u.com.vn/Uploads/images/s%C3%A1ch%20gt%20trong%20ks(2).JPG"
     },

  { id: 12, title: "Sách Trau Dồi & Mở Rộng Từ Vựng Tiếng Anh" , 
    price: 100, category: "Book", 
    description: "Sách Trau Dồi & Mở Rộng Từ Vựng Tiếng Anh Theo Chủ Điểm của nhóm tác giả The Windy là tài liệu bổ trợ từ vựng toàn diện, giúp người học tích lũy và mở rộng vốn từ một cách hệ thống theo từng đề tài cụ thể, Cung cấp thêm các cụm từ đi kèm (collocations), từ đồng nghĩa, trái nghĩa và câu ví dụ minh họa để người học hiểu sâu cách dùng từ trong thực tế.", 
    image: "https://sachhoc.com/image/catalog/Sachtienganh/Tuvung/Trau-doi-va-mo-rong-tu-vung-tieng-anh-theo-chu-diem.jpg" 
    },

  { id: 13, title: "Tiếng anh không khó" , 
    price: 67, category: "Book", 
    description: "Sách Crushing English - Giao tiếp tiếng Anh không hề khó (do MCBooks phát hành) là tài liệu hướng dẫn học tiếng Anh giao tiếp theo phong cách sinh động, dễ hiểu, giúp người học xóa bỏ tâm lý ngại nói tiếng Anh, Cung cấp các mẫu câu và đoạn hội thoại ngắn xoay quanh các chủ đề đời sống hàng ngày, giúp bạn dễ dàng áp dụng ngay vào thực tế.", 
    image: "https://tiki.vn/blog/wp-content/uploads/2023/07/chon-sach-co-nguon-goc.jpg" 
    },

  { id: 14, title: "Bộ sách Tiếng Anh Cơ Bản (Tập 1 và Tập 2)" ,
     price: 167, 
     category: "Book", 
     description: "Bộ sách Tiếng Anh Cơ Bản (Tập 1 và Tập 2) của trung tâm Elight (NXB Thanh Niên) là lộ trình toàn diện giúp người học khôi phục và xây dựng lại nền tảng tiếng Anh vững chắc từ con số 0, Tích hợp 3 nền tảng cốt lõi: Kết hợp chặt chẽ giữa Phát âm chuẩn, Từ vựng thông dụng và Ngữ pháp căn bản trong cùng một bài học.", 
     image: "https://media.zim.vn/63f43beebbdbbf560e030fdd/tieng-anh-co-ban.jpg" 
    },

  { id: 15, title: "Tiếng anh Lets Go!" , 
    price: 87, 
    category: "Book", 
    description: "Sách Let's Go: Student Book (của các tác giả R. Nakata, K. Frazier, B. Hoskins, C. Graham - do Nhà xuất bản Đại học Oxford phát hành) là giáo trình tiếng Anh trẻ em nổi tiếng thế giới, được sử dụng phổ biến tại các trường học và trung tâm ngoại ngữ.", 
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdsFvRG8hOUCM8x1mUrThEGW6W8GDgdHNcrw&s.jpg" 
    },

  { id: 16, title: "Siêu trí nhớ từ vựng" , 
    price: 89, 
    category: "Book", 
    description: "Sách Luyện Siêu Trí Nhớ Từ Vựng Tiếng Anh Cho Học Sinh THPT Quốc Gia của tác giả Nguyễn Anh Đức (Chủ biên), TS. Ben Williams và Chu Ngọc Mai (MCBooks phát hành) là tài liệu luyện thi chuyên biệt giúp học sinh bứt phá điểm số môn Tiếng Anh.", 
    image: "https://anhletoeic.com/wp-content/uploads/2023/11/sach-hoc-tieng-anh-giao-tiep-6.jpg" 
    },

  { id: 17, title: "Combo 9 cuốn tiếng anh giảm giá 10%" , 
    price: 67, 
    category: "Book", 
    description: "Giúp tăng cường điểm IELTS của bạn.", 
    image: "https://newshop.vn/public/uploads/news/sach-hoc-tu-vung-tieng-anh-hieu-qua-nhat.jpg" 
    },
  { id: 18, title: "Combo hành trang cho bé vào lớp 1" , 
    price: 607, 
    category: "Book", 
    description: "Hành trang chuẩn cho bé.", 
    image: "https://static.edupia.vn/images/news/2024/02/28/-Top-5-Bo-Sach-Tieng-Anh-Lop-1-Tot-Nhat-Cho-Con-Ban.png" 
    },
  { id: 19, title: "Nâng cấp từ vựng tiếng anh" , 
    price: 100, 
    category: "Book", 
    description: "Sách Sổ Tay Từ Vựng Tiếng Anh của tác giả Cô Minh Trang (hệ thống giáo dục Moon.vn phát hành) là tài liệu tổng hợp và tra cứu từ vựng dạng sổ tay tiện lợi, giúp người học tích lũy vốn từ nhanh chóng và hiệu quả.", 
    image: "https://sachtiengviet.com/cdn/shop/products/24d6f1792a2372c8e9ddaac650120fd0.jpg?v=1680982572.jpg" 
    },
  { id: 20, title: "Combo tiếng anh lớp 11" , 
    price: 67, 
    category: "Book", 
    description: "Lưu Hoàn Trí (NXB Đại Học Quốc Gia Hà Nội) là tài liệu tham khảo và luyện tập chuyên biệt giúp học sinh lớp 11 ôn luyện và đạt kết quả cao trong các bài kiểm tra trên lớp,Giúp học sinh làm quen với áp lực thời gian, rèn phản xạ xử lý câu hỏi trắc nghiệm cũng như tự luận nhanh chóng, chính xác.", 
    image: "https://newshop.vn/public/uploads/news/top-nhung-cuon-sach-tham-khao-tieng-anh-lop11-min.jpg" 
    }
];

// 4. HIỂN THỊ DANH SÁCH SẢN PHẨM
function loadProducts() {
    const productList = document.getElementById("product-list");
    if (productList) {
        productList.innerHTML = PRODUCTS_DB.map(p => `
            <div class="product-card">
                <img src="${p.image}" alt="${p.title}">
                <div class="product-info">
                    <h3>${p.title}</h3>
                    <p>Giá: <b>$${p.price}</b></p>
                    <button class="btn-detail" onclick="showDetail(${p.id})">Xem chi tiết</button>
                </div>
            </div>
        `).join('');
    }
}
loadProducts();

// 5. XEM CHI TIẾT SẢN PHẨM & CHUYỂN SANG CHECKOUT
window.showDetail = function(id) {
    const p = PRODUCTS_DB.find(item => item.id === id);
    if (!p || !detailDiv) return;

    detailDiv.innerHTML = `
        <div class="detail-container">
            <img src="${p.image}" style="width:200px; border-radius:10px; object-fit: cover;">
            <div>
                <h2>${p.title}</h2>
                <p style="color:#e74c3c; font-size:22px; font-weight:bold;">Giá: $${p.price}</p>
                <p><b>Mô tả:</b> ${p.description}</p>
                <button class="btn-pay-now" id="buy-btn">💳 Tiến hành thanh toán QR</button>
            </div>
        </div>
    `;

    document.getElementById("buy-btn").onclick = () => {
        localStorage.setItem("selectedProduct", JSON.stringify(p));
        window.location.href = "/spck-Js24/html/checkout.html";
    };

    detailDiv.scrollIntoView({ behavior: 'smooth' });
};