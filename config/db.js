var mysql = require("mysql");
var connection  = mysql.createConnection({
    host:"rm-wz9s4v05r055p5lt89o.mysql.rds.aliyuncs.com",
    user:"root",
    password:"Wangchao2019",
    database:"api"
})
/*var connection  = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"api"
})*/

//执行创建连接 
connection.connect();

module.exports = connection;