var express = require('express'); 
var router = express.Router(); 
var ChuDe = require('../models/chude'); 
 
// GET: Danh sách Nhân Viên
router.get('/', async (req, res) => { 
     var cd = await NhanVien.find();
	 res.render('nhanvien', {
		 title: 'Danh sách Nhân Viên',
		 nhanvien: nv 
	 });
     
}); 
 
// GET: Thêm nhân viên  
router.get('/them', async (req, res) => { 
     res.render('nhanvien_them', {
		 title: 'Thêm chủ đề'
	 });
     
}); 
 
// POST: Thêm nhân viên
router.post('/them', async (req, res) => { 
     var data = {
		 TenNhanVien: req.body.TenNhanVien
	 };
	 await NhanVien.create(data);
	 res.redirect('/nhanvien');
     
}); 
 
// GET: Sửa nhân viên
router.get('/sua/:id', async (req, res) => {
    var id = req.params.id;
	var cd = await NhanVien.findById(id);
	res.render('nhanvien_sua', {
		title: 'Sửa nhân viên' ,
		nhanvien: nv
	});
     
}); 
 
// POST: Sửa nhân viên
router.post('/sua/:id', async (req, res) => { 
    var id = req.params.id;
	var data = {
		TenNhanVien: req.body.TenNhanVien
	};
	await NhanVien.findByIdAndUpdate(id, data);
	res.redirect('/nhanvien');
     
}); 

// GET: Xóa chủ đề 
router.get('/xoa/:id', async (req, res) => { 
    var id = req.params.id;
    await NhanVien.findByIdAndDelete(id);
    res.redirect('/nhanvien');	
     
}); 
 
module.exports = router;