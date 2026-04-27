var express = require('express'); 
const ChamCong = require('../models/chamcong');
const Taikhoan = require('../models/taikhoan');
const PhongBan = require('../models/phongban');
const bcrypt = require('bcryptjs'); // Dùng để mã hóa mật khẩu khi thêm nhân viên
const ThongBao = require('../models/thongbao');
var router = express.Router(); 
 
// GET: Trang chủ 
router.get('/', async (req, res) => {
    try {
        // Tìm tất cả thông báo, sắp xếp theo ngày tạo mới nhất (giảm dần: -1)
        const danhSachThongBao = await ThongBao.find({}).sort({ NgayTao: -1 });
        
        res.render('index', { 
            title: 'Trang chủ',
            session: req.session, 
            thongbaos: danhSachThongBao // Gửi dữ liệu qua file index.ejs
        });
    } catch (error) {
        console.log("Lỗi tải thông báo:", error);
        res.render('index', { 
            title: 'Trang chủ',
            session: req.session, 
            thongbaos: [] // Gửi mảng rỗng nếu có lỗi để web không bị sập
        });
    }
});
 
// GET: Lỗi 
router.get('/error', async (req, res) => { 
    res.render('error', { 
        title: 'Lỗi' 
    }); 
}); 
 
// GET: Thành công 
router.get('/success', async (req, res) => { 
    res.render('success', { 
        title: 'Hoàn thành' 
    }); 
}); 

// Khối xử lý khi nhân viên bấm nút Check-in
// POST: Xử lý khi nhân viên bấm nút "Điểm danh vào ca"
router.post('/check-in', async (req, res) => {
    
    // Hàm tạo giao diện Popup siêu đẹp (SweetAlert2)
    const showPopup = (icon, title, text) => `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <style>body { background-color: #f8f9fa; font-family: sans-serif; }</style>
        </head>
        <body>
            <script>
                Swal.fire({
                    icon: '${icon}',
                    title: '${title}',
                    text: '${text}',
                    confirmButtonColor: '#0d6efd',
                    confirmButtonText: 'Đồng ý'
                }).then(() => {
                    window.location.href = '/';
                });
            </script>
        </body>
        </html>
    `;

    // 1. Kiểm tra đăng nhập
    if (!req.session.MaNguoiDung) {
        return res.send(showPopup('warning', 'Cảnh báo', 'Vui lòng đăng nhập để điểm danh!'));
    }

    try {
        const thoiGianThuc = new Date();
        const ngayHomNay = thoiGianThuc.toLocaleDateString('en-CA'); 

        // 2. Kiểm tra xem hôm nay đã điểm danh chưa
        const daChamCong = await ChamCong.findOne({
            MaNhanVien: req.session.MaNguoiDung,
            Ngay: ngayHomNay
        });

        if (daChamCong) {
            // TẠI ĐÂY: Hiện popup dấu X màu đỏ
            return res.send(showPopup('error', 'Thất bại!', 'Bạn đã điểm danh trong hôm nay rồi!'));
        } else {
            // 3. Tiến hành lưu DB
            await ChamCong.create({
                MaNhanVien: req.session.MaNguoiDung,
                Ngay: ngayHomNay,
                GioVao: thoiGianThuc
            });

            // TẠI ĐÂY: Hiện popup dấu Tick màu xanh lá
            return res.send(showPopup('success', 'Tuyệt vời!', 'Điểm danh ca làm việc thành công!'));
        }
    } catch (error) {
        console.log("---> LỖI:", error);
        return res.send(showPopup('error', 'Lỗi hệ thống', 'Có lỗi xảy ra, vui lòng thử lại!'));
    }
});
 
 // --- CHỨC NĂNG: XEM DANH SÁCH NHÂN SỰ ---
router.get('/nhan-su', async (req, res) => {
    // Nếu chưa đăng nhập thì đẩy về trang đăng nhập
    if (!req.session.MaNguoiDung) {
        return res.redirect('/dangnhap');
    }

    try {
        // Tìm toàn bộ tài khoản trong database
        // Lệnh .select('-MatKhau') nghĩa là lấy hết dữ liệu TRỪ cột mật khẩu để bảo mật
        const danhSachNhanVien = await Taikhoan.find({}).select('-MatKhau');

        // Lấy được xong thì gửi qua file giao diện 'nhansu.ejs' để nó vẽ bảng ra
        res.render('nhansu', { 
            nhanviens: danhSachNhanVien,
            session: req.session 
        });

    } catch (error) {
        console.log("Lỗi khi lấy danh sách nhân sự: ", error);
        res.send("Có lỗi xảy ra khi lấy dữ liệu nhân sự.");
    }
});
 
 // POST: Xử lý thêm phòng ban
router.post('/phong-ban/them', async (req, res) => {
    try {
        await PhongBan.create({ TenPhongBan: req.body.TenPhongBan });
        res.redirect('/nhan-su');
    } catch (error) {
        res.send("Lỗi: Phòng ban đã tồn tại!");
    }
});

// POST: Xử lý thêm nhân viên
router.post('/nhan-su/them', async (req, res) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const duLieuMoi = {
            HoVaTen: req.body.HoVaTen,
            TenDangNhap: req.body.TenDangNhap,
            MatKhau: bcrypt.hashSync(req.body.MatKhau, salt),
            PhongBan: req.body.PhongBan,
            ChucVu: req.body.ChucVu,
            QuyenHan: 'employee'
        };
        await Taikhoan.create(duLieuMoi);
        res.redirect('/nhan-su');
    } catch (error) {
        res.send("Lỗi khi thêm nhân viên: " + error.message);
    }
});

// POST: Cập nhật chức vụ
router.post('/nhan-su/sua-chuc-vu/:id', async (req, res) => {
    try {
        await Taikhoan.findByIdAndUpdate(req.params.id, {
            ChucVu: req.body.ChucVu,
            PhongBan: req.body.PhongBan
        });
        res.redirect('/nhan-su');
    } catch (error) {
        res.send("Lỗi khi cập nhật!");
    }
});
 
 // POST: Thêm thông báo mới
router.post('/thong-bao/them', async (req, res) => {
    try {
        await ThongBao.create({
            TieuDe: req.body.TieuDe,
            NoiDung: req.body.NoiDung,
            NguoiDang: req.session.HoVaTen // Lấy tên admin đang đăng nhập
        });
        res.redirect('/'); // Load lại trang chủ
    } catch (error) {
        console.log(error);
        res.send("Có lỗi khi tạo thông báo!");
    }
});

// GET: Xóa thông báo
router.get('/thong-bao/xoa/:id', async (req, res) => {
    try {
        // Chỉ admin mới được xóa (Bảo mật backend)
        if (req.session.QuyenHan !== 'admin') {
            return res.send("Bạn không có quyền xóa!");
        }
        await ThongBao.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        res.send("Lỗi khi xóa thông báo!");
    }
});

// GET: Setup tài khoản Admin đầu tiên
router.get('/tao-admin', async (req, res) => {
    try {
        // Kiểm tra xem đã có admin chưa để tránh tạo trùng
        const tonTaiAdmin = await Taikhoan.findOne({ TenDangNhap: 'admin' });
        if (tonTaiAdmin) {
            return res.send("Tài khoản admin đã tồn tại! Tên đăng nhập là: admin");
        }

        // Tạo tài khoản admin
        await Taikhoan.create({
            TenDangNhap: 'admin',
            MatKhau: bcrypt.hashSync('123456', bcrypt.genSaltSync(10)), // Mật khẩu mặc định là 123456
            HoVaTen: 'Ban Giám Đốc',
            Email: 'admin@itforlife.com',
            QuyenHan: 'admin' // Ép quyền cao nhất
        });
        
        res.send(`
            <div style="text-align: center; margin-top: 50px; font-family: sans-serif;">
                <h3 style="color: green;">Đã tạo tài khoản Admin thành công!</h3>
                <p>Tên đăng nhập: <b>admin</b></p>
                <p>Mật khẩu: <b>123456</b></p>
                <a href='/dangnhap' style="padding: 10px 20px; background: blue; color: white; text-decoration: none; border-radius: 5px;">Đến trang Đăng nhập</a>
            </div>
        `);
    } catch (error) {
        console.log(error);
        res.send("Có lỗi xảy ra khi tạo admin!");
    }
});

// ==========================================
// 1. CHỨC NĂNG HỒ SƠ CÁ NHÂN
// ==========================================
router.get('/hoso', async (req, res) => {
    // Kiểm tra đã đăng nhập chưa
    if (!req.session.MaNguoiDung) {
        req.session.error = 'Vui lòng đăng nhập để xem hồ sơ.';
        return res.redirect('/dangnhap');
    }

    try {
        // Tìm thông tin user dựa vào ID lưu trong session
        const user = await Taikhoan.findById(req.session.MaNguoiDung);
        
        res.render('hoso', { 
            title: 'Hồ sơ cá nhân', 
            session: req.session,
            user: user // Gửi dữ liệu user ra giao diện
        });
    } catch (error) {
        console.log("Lỗi tải hồ sơ:", error);
        res.redirect('/');
    }
});

// ==========================================
// 2. CHỨC NĂNG LỊCH SỬ CHẤM CÔNG
// ==========================================
router.get('/lich-su-cham-cong', async (req, res) => {
    // Kiểm tra đã đăng nhập chưa
    if (!req.session.MaNguoiDung) return res.redirect('/dangnhap');

    try {
        // Tìm tất cả lịch sử chấm công của user này, sắp xếp ngày mới nhất lên đầu (-1)
        const dsChamCong = await ChamCong.find({ MaNhanVien: req.session.MaNguoiDung }).sort({ Ngay: -1 });
        
        res.render('lichsu', { 
            title: 'Lịch sử chấm công', 
            session: req.session,
            lichSu: dsChamCong // Gửi mảng lịch sử ra giao diện
        });
    } catch (error) {
        console.log("Lỗi tải lịch sử chấm công:", error);
        res.redirect('/');
    }
});
 
 
module.exports = router; 