const express = require('express');
const router = express.Router();
const URL = require('url');
const db = require('../config/db');
const uuid = require('node-uuid');
const sd = require('silly-datetime');
// 增加订单
router.post("/add",function(req,res,next) {
    let usefulDate = sd.format(new Date().getTime() + 90 * 24 * 60 * 60 * 1000);
    let thisDate = sd.format(new Date().getTime());
    let user_id = req.body.user_id || ''; // 用户id
    let type = [1,2,2939,2938]; // 1 日常保洁 2 深度保洁 2939 灶台+油烟机 2938 灶台
    let coupon_types = '1'; // 优惠券类型 1 可以使用 2不可以使用 3为失效
    let coupon_price = '100'; // 优惠券打折额度
    let coupon_cases = ''; // 优惠券类型
    let coupon_id;
    let sql = 'select * from coupon where user_id = ?'
    db.query(sql,[user_id],function(err,rows){
        if(rows.length > 0){
            res.send({code:3,title:"您已经领取过优惠券了"});
        }else {
            for (let index = 0; index < type.length; index++) {
                switch( type[index] ) {
                    case 1:
                        coupon_id = uuid.v1();
                        addinter(user_id, coupon_id, 1, 20, thisDate, usefulDate, 1);
                       break;
                    case 2:
                        coupon_id = uuid.v1();
                        addinter(user_id, coupon_id, 1, 40, thisDate, usefulDate, 2);
                       break;
                    case 2939:
                        coupon_id = uuid.v1();
                        addinter(user_id, coupon_id, 1, 20, thisDate, usefulDate, 2939);
                    case 2938:
                        coupon_id = uuid.v1();
                        addinter(user_id, coupon_id, 1, 20, thisDate, usefulDate, 2938);
               }  
            }
            res.send({
                code:1,
                title:"领取成功"
            });
        }
    }); 
    
});
// 读取优惠券
router.post("/ready",function(req,res,next){
    let user_id = req.body.user_id || ''; // 用户id
    let sql = 'select * from coupon where user_id = ? order by coupon_price DESC,coupon_types ASC';
    let UpdateSql = 'update coupon set coupon_types = 3 where coupon_id = ?'
    let thisDate = new Date().getTime();
    db.query(sql,[user_id],function(err,rows){
        for (let index = 0; index < rows.length; index++) {
            let usefulDate = new Date(rows[index].coupon_useful_date).getTime();
            if( usefulDate < thisDate ){
                db.query(UpdateSql,[rows[index].coupon_id]);
            }
        }
        if(err){
            res.send({
                code:"2",
                data:rows
            });
        }else {
            res.send({
                code:"1",
                data:rows
            });
        }
    });
})

// 读取优惠券可以使用的
router.post("/type",function(req,res,next){
    let user_id = req.body.user_id || ''; // 用户id
    let coupon_cases = req.body.coupon_cases || ''; // 优惠券类型
    let coupon_types = req.body.coupon_types || ''; // 优惠券是否可以使用
    let sql = 'select * from coupon where user_id = ? and coupon_cases = ? and coupon_types = ? order by coupon_price DESC';
    db.query(sql,[user_id,coupon_cases,coupon_types],function(err,rows){
        if(err){
            res.send({
                code:"2",
                data:rows
            });
        }else {
            res.send({
                code:"1",
                data:rows
            });
        }
    })
})

// 根据优惠券id
router.post("/id",function(req,res,next){
    let coupon_id = req.body.coupon_id || ''; // 优惠券类型
    let sql = 'select * from coupon where coupon_id = ?';
    db.query(sql,[coupon_id],function(err,rows){
        if(err){
            res.send({
                code:"2",
                data:rows
            });
        }else {
            res.send({
                code:"1",
                data:rows
            });
        }
    })
})


// 优惠券添加
function addinter (user_id, coupon_id, coupon_types, coupon_price, thisDate, usefulDate, coupon_cases) {
    let sqlInset = "insert into coupon (user_id, coupon_id, coupon_types, coupon_price, coupon_this_date, coupon_useful_date, coupon_cases) values(?,?,?,?,?,?,?)"
    db.query(sqlInset,[user_id, coupon_id, coupon_types, coupon_price, thisDate, usefulDate, coupon_cases]); 
}

module.exports = router;