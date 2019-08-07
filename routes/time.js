var express = require('express');
var router = express.Router();
var URL = require('url');
var db = require('../config/db');
var uuid = require('node-uuid');


// 读取时间
router.post("/ready",function(req,res,next){
    let date = req.body.date || ''; // 日期
    let sql = 'select * from make_time where make_date = ?'
    db.query(sql,[date],function(err,rows){
        if(err){
            res.send({code:3}); // 报错
        }else {
            res.send({code:1,data:JSON.stringify(rows)}); // 不可以预约 
        }
    });

})


module.exports = router;