const mongoose = require('mongoose');

const thongBaoSchema = new mongoose.Schema({
    TieuDe: { type: String, required: true },
    NoiDung: { type: String, required: true },
    NguoiDang: { type: String, required: true }, // Lưu tên người đăng
    NgayTao: { type: Date, default: Date.now }   // Tự động lưu thời gian đăng
});

module.exports = mongoose.model('ThongBao', thongBaoSchema);