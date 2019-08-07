const express = require('express');
const router = express.Router();
const URL = require('url');
const db = require('../config/db');
const uuid = require('node-uuid');
const qs = require('qs');
const sd = require('silly-datetime');
// 增加订单
router.post("/add",function(req,res,next) {
    let oids = '';
    let date = new Date();
    let yea = date.getFullYear();
    let mon = date.getMonth()+1;
    let day = date.getDate();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    for(let i = 0; i<3; i++){
        oids+= Math.floor(Math.random()*10);
    }
    let time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    console.log(time);
    let a = yea+mon+day+h+m+s+oids;
    let oid = a;
    let user_id = req.body.openid || ''; // 用户id
    let user_name = req.body.user_name || ''; // 用户名称
    let user_mobile = req.body.user_mobile || ''; // 用户手机
    let user_addree = req.body.user_city || ''; // 用户地址
    let user_num = req.body.user_num || ''; // 用户地址
    let place_time = time || ''; // 下单时间
    let make_date = req.body.make_date || ''; // 预约日期
    let make_time = req.body.make_time || ''; // 预约时间
    let play_way = req.body.play_way || ''; // 支付方式
    let order_price = req.body.order_price || ''; // 房间价格
    let order_endPrice = req.body.order_endPrice || ''; // 房间价格
    let order_per = req.body.order_per || ''; // 房屋平米数
    let comm_type = req.body.comm_type || ''; // 产品类型
    let coupon_id = req.body.coupon_id || ''; // 优惠券id
    let coupon_price = req.body.coupon_price || ''; // 优惠券价格
    let order_type = 1; // 订单类型
    if (coupon_id) {
        let sqlCou = 'select * from coupon where coupon_id = ?';
        db.query(sqlCou,[coupon_id],function(err,rows){
            if(rows[0].coupon_types == 2 ){
                res.send({code:3}); // 该优惠券已经使用
            }else {
                let sql = "insert into order_list(user_id,order_oid,user_name,user_mobile,user_addree,user_num,order_type,place_time,make_date,make_time,play_way,order_price,order_endPrice,order_per,comm_type,coupon_id,coupon_price) values('" + user_id + "','" + oid + "','" + user_name + "','" + user_mobile + "','" + user_addree + "','" + user_num + "','" + order_type + "','" + place_time + "','" + make_date + "','" + make_time + "','" + play_way + "','" + order_price + "','" + order_endPrice + "','" + order_per + "','" + comm_type + "','" + coupon_id + "','" + coupon_price + "')"
                db.query(sql,function(err,rows){
                    if(err){
                        res.send({code:2});
                    }else {
                        let sql = "insert into make_time(make_date,make_time,make_num) values('" + make_date + "','" + make_time + "','1')"
                        
                        let cou = 'update coupon set coupon_types = 2 where coupon_id = ? and user_id = ?'
                        db.query(sql,function(err,rows){
                            res.send({code:1,orderId:oid,type:order_type,name:comm_type,price:order_endPrice});
                        });
                        // 优惠券 
                        db.query(cou,[coupon_id,user_id]);
                    }
                });
            }
        });
    } else {
        let sql = "insert into order_list(user_id,order_oid,user_name,user_mobile,user_addree,user_num,order_type,place_time,make_date,make_time,play_way,order_price,order_endPrice,order_per,comm_type,coupon_id,coupon_price) values('" + user_id + "','" + oid + "','" + user_name + "','" + user_mobile + "','" + user_addree + "','" + user_num + "','" + order_type + "','" + place_time + "','" + make_date + "','" + make_time + "','" + play_way + "','" + order_price + "','" + order_endPrice + "','" + order_per + "','" + comm_type + "','" + coupon_id + "','" + coupon_price + "')"
        db.query(sql,function(err,rows){
            if(err){
                res.send({code:2});
            }else {
                let sql = "insert into make_time(make_date,make_time,make_num) values('" + make_date + "','" + make_time + "','1')"
                
                let cou = 'update coupon set coupon_types = 2 where coupon_id = ? and user_id = ?'
                db.query(sql,function(err,rows){
                    res.send({code:1,orderId:oid,type:order_type,name:comm_type,price:order_endPrice});
                });
                // 优惠券
                db.query(cou,[coupon_id,user_id]);
            }
        });
    }
    
    
});
// 读取订单
router.post("/ready",function(req,res,next){
    let userId = req.body.userId || ''; // 用户id
    let sql = 'select * from order_list where user_id = ? order by place_time DESC'
    db.query(sql,[userId],function(err,rows){
        if(err){
            res.send("新增失败"+err);
        }else {
            res.send(JSON.stringify(rows));
        }
    });

})
// 订单详情
router.post("/detail",function(req,res,next){
    let order_oid = req.body.order_oid || ''; // 订单id
    let sql = 'select * from order_list where order_oid = ?'
    db.query(sql,[order_oid],function(err,rows){
        if(err){
            res.send("新增失败"+err);
        }else {
            res.send(JSON.stringify(rows));
        }
    });

})

// 取消订单

router.post("/cancel",function(req,res,next){
    let order_oid = req.body.order_oid || ''; // 订单id
    let coupon_id = req.body.coupon_id || ''; // 优惠券id
    if (coupon_id) {
        let couponSql = 'update coupon set coupon_types = 1 where coupon_id = ?';
        let sql = 'update order_list set order_type = 4 where order_oid = ?'
        db.query(couponSql,[coupon_id],function(err,rows){});
        db.query(sql,[order_oid],function(err,rows){
            if(err){
                res.send({ code:2,title:"取消订单失败" });
            }else {
                res.send({ code:1,title:"取消订单成功" });
            }
        });
    } else {
        let sql = 'update order_list set order_type = 4 where order_oid = ?'
        db.query(sql,[order_oid],function(err,rows){
            if(err){
                res.send({ code:2,title:"取消订单失败" });
            }else {
                res.send({ code:1,title:"取消订单成功" });
            }
        });
    }
})


// 读取全部订单
router.post("/all/ready",function(req,res,next){
    let sql = 'select * from order_list'
    db.query(sql,function(err,rows){
        if(err){
            res.send("新增失败"+err);
        }else {
            res.send(JSON.stringify(rows));
        }
    });

})

// 增加接单人
router.post("/update/project",function(req,res,next){
    let order_oid = req.body.order_oid || ''; // 订单id
    let projects = req.body.project || ''; // 接单人
    let sql = 'update order_list set project = ? where order_oid = ?'
    db.query(sql,[projects,order_oid],function(err,rows){
        if(err){
            res.send({ code:2,title:"增加失败" });
        }else {
            res.send({ code:1,title:"增加成功" });
        }
    });
})
// 完成订单
router.post("/update/done",function(req,res,next){
    let order_oid = req.body.order_oid || ''; // 订单id
    let sql = 'update order_list set order_type = 3 where order_oid = ?'
    db.query(sql,[order_oid],function(err,rows){
        if(err){
            res.send({ status:2,title:"完成失败" });
        }else {
            res.send({ status:1,title:"完成成功" });
        }
    });
})
// 删除订单
router.post("/update/delete",function(req,res,next){
    let order_oid = req.body.order_oid || ''; // 订单id
    let sql = 'update order_list set order_type = 4 where order_oid = ?'
    db.query(sql,[order_oid],function(err,rows){
        if(err){
            res.send({ status:2,title:"完成失败" });
        }else {
            res.send({ status:1,title:"完成成功" });
        }
    });
})




module.exports = router;