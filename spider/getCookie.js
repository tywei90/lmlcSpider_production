let superagent = require('superagent-charset'),
    fs = require('fs'),
    cheerio = require("cheerio"),
    async = require("async"),
    colors = require('colors'),
    events = require("events"),
    emitter = new events.EventEmitter();

// node后台log颜色设置
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

let phone = process.argv[2];
let password = process.argv[3];
if (!phone || !password) {
    console.log('参数错误，需要传递登陆信息'.error);
    return
}

getCookie();
emitter.on("setCookeie", getTitles) //监听getCookie事件


function getCookie() {
    superagent.post('https://www.lmlc.com/user/s/web/logon')
        .type('form')
        .send({
            phone: phone,
            password: password,
            productCode: "LMLC",
            origin: "PC"
        })
        .end(function(err, res) {
            if (err) {
                console.log(err.message.error);
                return;
            }
            var cookie = res.header['set-cookie']; //从response中得到cookie
            emitter.emit("setCookeie", cookie)
        })
}

function getTitles(cookie) {
    superagent
        .get('https://www.lmlc.com/web/product/product_detail.html?id=20171207140052PD197819')
        .set('Cookie', cookie)
        .end(function(err, pres) {
            // 常规的错误处理
            if (err) {
                if (err.message === 'Found') {
                    console.log('登陆信息错误'.error);
                }else if(err.message === 'ENOTFOUND'){
                    console.log('网络连接错误，尝试重新请求...'.error);
                } else {
                    console.log(err.message.error);
                }
                return;
            }
            var $ = cheerio.load(pres.text);
            if ($('.m-login').length) {
                console.log('登陆cookie已失效，尝试重新登陆...'.error);
                getCookie();
            }
            if ($('.product-oper').length) {
                console.log('已登录'.info);
            }
        })
};