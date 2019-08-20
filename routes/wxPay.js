var express = require('express');
var request = require('request');
var xmlreader = require("xmlreader");
var router = express.Router();
var fs = require("fs");
var wxpay = require('../config/util');
var xmlparser = require('express-xml-bodyparser');
 
 
var appid     = 'wx0da05889095a5ca6';
var appsecret = 'f5aecb67d76bc19101c30233cda97e3f';
var mchid     = '1551951341'
var mchkey    = '88Aasdv1fjgmriidkkddv5014dsfe2g2';
var wxurl     = 'https://www.5jrdj.com/pay/weixinNotify';
 
router.get('/',(req,res)=>{
    
    //首先拿到前端传过来的参数
    let orderCode = req.query.orderCode;
    let money     = req.query.money;
    let orderID   = req.query.orderID;
 
    console.log('APP传过来的参数是',orderCode+'----'+money+'------'+orderID+'----'+appid+'-----'+appsecret+'-----'+mchid+'-----'+mchkey);
 
    //首先生成签名sign
    appid
    let mch_id = mchid;
    let nonce_str = wxpay.createNonceStr();
    let timestamp = wxpay.createTimeStamp();
    let body = '测试微信支付';
    let out_trade_no = orderCode;
    let total_fee = wxpay.getmoney(money);
    let spbill_create_ip = req.connection.remoteAddress;
    let notify_url = wxurl;
    let trade_type = 'APP';
 
    let sign = wxpay.paysignjsapi(appid,body,mch_id,nonce_str,notify_url,out_trade_no,spbill_create_ip,total_fee,trade_type,mchkey);
 
    console.log('sign==',sign);
 
    //组装xml数据
    var formData  = "<xml>";
    formData  += "<appid>"+appid+"</appid>";  //appid
    formData  += "<body><![CDATA["+"测试微信支付"+"]]></body>";
    formData  += "<mch_id>"+mch_id+"</mch_id>";  //商户号
    formData  += "<nonce_str>"+nonce_str+"</nonce_str>"; //随机字符串，不长于32位。
    formData  += "<notify_url>"+notify_url+"</notify_url>";
    formData  += "<out_trade_no>"+out_trade_no+"</out_trade_no>";
    formData  += "<spbill_create_ip>"+spbill_create_ip+"</spbill_create_ip>";
    formData  += "<total_fee>"+total_fee+"</total_fee>";
    formData  += "<trade_type>"+trade_type+"</trade_type>";
    formData  += "<sign>"+sign+"</sign>";
    formData  += "</xml>";
 
    console.log('formData===',formData);
 
    var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
 
    request({url:url,method:'POST',body: formData},function(err,response,body){
        if(!err && response.statusCode == 200){
            console.log(body);
 
            xmlreader.read(body.toString("utf-8"), function (errors, response) {
                if (null !== errors) {
                    console.log(errors)
                    return;
                }
                console.log('长度===', response.xml.prepay_id.text().length);
                var prepay_id = response.xml.prepay_id.text();
                console.log('解析后的prepay_id==',prepay_id);
 
 
                //将预支付订单和其他信息一起签名后返回给前端
                let finalsign = wxpay.paysignjsapifinal(appid,mch_id,prepay_id,nonce_str,timestamp,mchkey);
 
                res.json({'appId':appid,'partnerId':mchid,'prepayId':prepay_id,'nonceStr':nonce_str,'timeStamp':timestamp,'package':'Sign=WXPay','sign':finalsign});
 
            });
 
 
        }
    });
 
})

router.get('/weixinNotify', xmlparser({ trim: false, explicitArray: false }), function (req, res, next) {
    var jsonData = req.body.xml;
    if (jsonData.result_code == 'SUCCESS') {
        var key = "c24cb4054b87951ee24dc736c67b94ca";

        var stringA = "appid=" + jsonData.appid + "&bank_type=" + jsonData.bank_type + "&cash_fee=" + jsonData.cash_fee + "&fee_type=" + jsonData.fee_type +
            "&is_subscribe=" + jsonData.is_subscribe + "&mch_id=" + jsonData.mch_id + "&nonce_str=" + jsonData.nonce_str + "&openid=" +
            jsonData.openid + "&out_trade_no=" + jsonData.out_trade_no + "&result_code=" + jsonData.result_code + "&return_code=" +
            jsonData.return_code + "&time_end=" + jsonData.time_end + "&total_fee=" + jsonData.total_fee + "&trade_type=" +
            jsonData.trade_type + "&transaction_id=" + jsonData.transaction_id;
        var stringSignTemp = stringA + "&key=" + key;
        var sign = md5(stringSignTemp).toUpperCase();
        console.log(sign)
        if (sign == jsonData.sign) {
            console.log('yes')
            test.updatemsg(jsonData.out_trade_no).then(function (data) {
                // console.log(data)
                console.log('success')
            })
            //json转xml
            var json2Xml = function (json) {
                let _xml = '';
                Object.keys(json).map((key) => {
                    _xml += `<${key}>${json[key]}</${key}>`
                })
                return `<xml>${_xml}</xml>`;
            }
            var sendData = {
                return_code: 'SUCCESS',
                return_msg: 'OK'
            }
            res.end(json2Xml(sendData));
        }
    }
})


module.exports = router;


