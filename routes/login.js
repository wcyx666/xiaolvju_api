var express = require('express');
var router = express.Router();
var URL = require('url');
var db = require('../config/db');
var uuid = require('node-uuid');
var http = require('http');
var https = require('https');
var request = require('request');


router.post("/login",function(req,res,next){
    //获取用户CODE
    var js_code = req.body.code;

    new Promise(function(resolve,reject) {
        
        //格式化请求地址
        var appID = 'wxe003098e2ab81ade';
        var appScrect = '0072b0fafb5b590a2cd30bc00a3fc749';
        var url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+ appID +'&secret='+ appScrect +'&js_code='+ js_code +'&grant_type=authorization_code';
        request(url, function (error, response, body) {
            resolve(JSON.stringify(response));
        })
    }).then(function(data) {
        res.send(data);
    });
})

module.exports = router;