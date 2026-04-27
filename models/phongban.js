const mongoose = require('mongoose');

const PhongBanSchema = new mongoose.Schema({
    TenPhongBan: { type: String, required: true, unique: true },
    MoTa: String
});

module.exports = mongoose.model('PhongBan', PhongBanSchema);