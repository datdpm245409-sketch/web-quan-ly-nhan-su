var express = require('express');
var app = express();
var mongoose = require('mongoose'); 
var session = require('express-session'); 

var indexRouter = require('./routers/index');
var authRouter = require('./routers/auth'); 
var chudeRouter = require('./routers/chude'); 
var taikhoanRouter = require('./routers/taikhoan'); 
var baivietRouter = require('./routers/baiviet'); 
 
var uri = 'mongodb://DoAnDienToanDamMay:dat12312366@ac-sqrcxv9-shard-00-02.qowapwm.mongodb.net:27017/doan?ssl=true&authSource=admin'; 
mongoose.connect(uri) 
    .then(() => console.log('Đã kết nối thành công tới MongoDB.')) 
    .catch(err => console.log(err));
	
app.set('views', './views'); 
app.set('view engine', 'ejs'); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(session({ 
    name: 'iNews',                          // Tên session (tự chọn) 
    secret: 'Mèo méo meo mèo meo',          // Khóa bảo vệ (tự chọn) 
    resave: false, 
    saveUninitialized: false, 
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000    // Hết hạn sau 30 ngày 
    } 
})); 
 
app.use((req, res, next) => { 
    // Chuyển biến session thành biến cục bộ 
    res.locals.session = req.session; 
     
    // Lấy thông báo (lỗi, thành công) của trang trước đó (nếu có) 
    var err = req.session.error; 
    var msg = req.session.success; 
     
    // Xóa session sau khi đã truyền qua biến trung gian 
    delete req.session.error; 
    delete req.session.success; 
     
    // Gán thông báo (lỗi, thành công) vào biến cục bộ 
    res.locals.message = ''; 
    if (err) res.locals.message = '<span class="text-danger">' + err + '</span>'; 
    if (msg) res.locals.message = '<span class="text-success">' + msg + '</span>'; 
     
    next(); 
}); 

app.use('/', indexRouter); 
app.use('/', authRouter);
app.use('/chude', chudeRouter); 
app.use('/taikhoan', taikhoanRouter); 
app.use('/baiviet', baivietRouter); 

app.get('/', (req, res) => {
	 res.render('index', {
        title: 'Trang chủ' 
    }); 

});

app.listen(3000, () => {
    console.log('Server is running at http://127.0.0.1:3000');
});

