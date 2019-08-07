var express = require('express');
var router = express.Router();
var URL = require('url');
var db = require('../config/db');
var uuid = require('node-uuid');
const sd = require('silly-datetime');
var http = require('http');

router.post("/",function(req,res,next){
    let openid = req.body.openid;
    let id = uuid.v1();
    let times = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    let readySql = 'select * from user where openid = ?'
    let sql = "insert into user(id, openid, times) values ('" + id + "','" + openid + "','" + times + "')"
    db.query(readySql,[openid],function(err,rows){
        if (rows.length > 0) {
            res.send({code:404,success:"已经注册过了"});
        } else {
            db.query(sql,function(err,rows){
                res.send({code:200,success:"注册成功"});
            });
        }
    });
});



module.exports = router;
