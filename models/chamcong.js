const mongoose = require('mongoose');

const ChamCongSchema = new mongoose.Schema({
    MaNhanVien: { type: String, required: true }, // Liên kết với ID nhân viên
    Ngay: { type: String, required: true },       // Lưu ngày định dạng YYYY-MM-DD
    GioVao: { type: Date, required: true }        // Lưu thời điểm chính xác bấm nút
});

const chamCongModel = mongoose.model('ChamCong', ChamCongSchema);
module.exports = chamCongModel;