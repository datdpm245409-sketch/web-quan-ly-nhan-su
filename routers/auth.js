const Taikhoan = require('../models/taikhoan');
var express = require('express'); 
var router = express.Router(); 
var bcrypt = require('bcryptjs'); 
var TaiKhoan = require('../models/taikhoan'); 
 
// GET: Đăng ký 
router.get('/dangky', async (req, res) => {
	res.render('dangky', {
        title: 'Đăng ký tài khoản'
    });
     
}); 
 
// POST: Đăng ký 
router.post('/dangky', async (req, res) => {
    try {
        var salt = bcrypt.genSaltSync(10);
        var data = {
            HoVaTen: req.body.HoVaTen,
            Email: req.body.Email,
            HinhAnh: req.body.HinhAnh,
            TenDangNhap: req.body.TenDangNhap,
            MatKhau: bcrypt.hashSync(req.body.MatKhau, salt)
        };
        
        // Cố gắng lưu dữ liệu vào database
        await Taikhoan.create(data);
        
        // Nếu thành công, chạy tiếp các lệnh gốc của bạn
        req.session.success = 'Đã đăng ký tài khoản thành công.';
        res.redirect('/success');

    } catch (error) {
        // Bắt lỗi nếu MongoDB báo trùng lặp (Mã lỗi 11000)
        if (error.code === 11000) {
            // Hiển thị trang giao diện lỗi thay vì làm sập ứng dụng
            return res.render('error', { 
                message: 'Tên đăng nhập này đã có người sử dụng. Vui lòng chọn một tên khác!'
            });				
        }
        
        // Nếu là một lỗi bất kỳ khác, in ra terminal để dev kiểm tra
        console.log("Lỗi khi đăng ký:", error);
        res.status(500).send("Đã có lỗi hệ thống xảy ra!");
    }
});
 
// GET: Đăng nhập 
router.get('/dangnhap', async (req, res) => {
    res.render('dangnhap', {
        title: 'Đăng nhập'
    });	
     
}); 
 
// POST: Đăng nhập 
router.post('/dangnhap', async (req, res) => {
    if (req.session.MaNguoiDung) {
        req.session.error = 'Người dùng đã đăng nhập rồi.';
        res.redirect('/error');
    } else {
        var taikhoan = await TaiKhoan.findOne({ TenDangNhap: req.body.TenDangNhap }).exec();
        if (taikhoan) {
            if (bcrypt.compareSync(req.body.MatKhau, taikhoan.MatKhau)) {
                if (taikhoan.KichHoat == 0) {
                    req.session.error = 'Người dùng đã bị khóa tài khoản.';
                    res.redirect('/error');
                } else {
                    // Đăng ký session
                    req.session.MaNguoiDung = taikhoan._id;
                    req.session.HoVaTen = taikhoan.HoVaTen;
                    req.session.QuyenHan = taikhoan.QuyenHan;

                    res.redirect('/');
                }
            } else {
                req.session.error = 'Mật khẩu không đúng.';
                res.redirect('/error');
            }
        } else {
            req.session.error = 'Tên đăng nhập không tồn tại.';
            res.redirect('/error');
        }
    }	
     
}); 
 
// GET: Đăng xuất 
router.get('/dangxuat', async (req, res) => {
	if(req.session.MaNguoiDung) {
        // Xóa session
        delete req.session.MaNguoiDung;
        delete req.session.HoVaTen;
        delete req.session.QuyenHan;

        res.redirect('/');
    } else {
        req.session.error = 'Người dùng chưa đăng nhập.';
        res.redirect('/error');
    }
     
}); 
 
module.exports = router; 