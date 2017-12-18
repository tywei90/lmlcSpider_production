let superagent = require('superagent-charset'),
    fs = require('fs'),
    colors = require('colors');

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

//日期格式化，格式化后:2016-03-09 11:20:12
Date.prototype.format = function(format) {
    var o = {
        "M+": this.getMonth() + 1, //month 
        "d+": this.getDate(), //day 
        "h+": this.getHours(), //hour 
        "m+": this.getMinutes(), //minute 
        "s+": this.getSeconds(), //second 
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
        "S": this.getMilliseconds() //millisecond 
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

let counter = 0;
let total = 4*60*60/5; // 爬取的次数，为0则一直爬取
let delay = 5*1000;
// 防止产品多产生分页需要多次请求获取数据，可以直接设置pageSize为100，这样多页几乎不会出现
let ajaxUrl = 'https://www.lmlc.com/web/product/product_list?pageSize=100&pageNo=1&type=0';

if(!fs.existsSync('spider/product.json') || !fs.readFileSync('spider/product.json', 'utf-8')){
    fs.writeFileSync('spider/product.json', JSON.stringify([]));
}

let timer = setInterval(function() {
    requestData(ajaxUrl);
}, delay);

requestData(ajaxUrl);

function formatData(data){
    let outArr = [];
    for(let i=0, len=data.length; i<len; i++){
        let obj = {};
        obj.name = data[i].name;
        obj.financeTotalAmount = data[i].financeTotalAmount;
        obj.alreadyBuyAmount = data[i].alreadyBuyAmount;
        obj.canBuyAmount = data[i].canBuyAmount;
        obj.productId = data[i].id;
        obj.yearReturnRate = data[i].yearReturnRate;
        obj.investementDays = data[i].investementDays;
        obj.interestStartTime = data[i].interestStartTime;
        obj.interestEndTime = data[i].interestEndTime;
        obj.getDataTime = +new Date();
        outArr.push(obj);
    }
    return outArr
}

function requestData(url) {
    counter++;
    if(total && counter == total){
        clearInterval(timer);
    }
    superagent.get(url)
    .end(function(err,pres){
        // 常规的错误处理
        if (err) {
          console.log(err.message.error);
          return;
        }
        let time = (new Date()).format("yyyy-MM-dd hh:mm:ss");
        let addData = JSON.parse(pres.text).data;
        if(addData.totalPage > 1){
            console.log('产品个数超过100个！'.error);
            fs.appendFileSync('debug.txt', '\n\n产品个数超过100个！发生于：' + time);
        }
        let formatedAddData = formatData(addData.result);
        let oldData = JSON.parse(fs.readFileSync('spider/product.json', 'utf-8'));
        oldData.push(formatedAddData);
        fs.writeFile('spider/product.json', JSON.stringify(oldData), (err) => {
            if (err) throw err;
            console.log((`=============== 第${counter}次爬取，时间：${time} ===============`).silly);
        });
    });
}







