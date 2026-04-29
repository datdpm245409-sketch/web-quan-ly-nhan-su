var mongoose = require('mongoose'); 
 
const TaiKhoanSchema = new mongoose.Schema({
    HoVaTen: { type: String, required: true },
    Email: String,
    HinhAnh: String,
    TenDangNhap: { type: String, required: true, unique: true },
    MatKhau: { type: String, required: true },
    // --- PHẦN NÀY CHO NHÂN SỰ ---
    QuyenHan: { type: String, default: 'employee' }, 
    PhongBan: { type: String, default: 'Chưa phân bổ' },
    ChucVu: { type: String, default: 'Nhân viên' },
    MucLuongCoBan: { type: Number, default: 5000000 }
	
	LuongCoBan: { type: Number, default: 0 },    
    QuyenHan: { type: String, default: 'nhân viên' }
});
 
var taiKhoanModel = mongoose.model('TaiKhoan', TaiKhoanSchema); 
 
module.exports = taiKhoanModel;