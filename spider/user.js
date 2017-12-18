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
let total = 0; // 爬取的次数，为0则一直爬取
let delay = 150*1000; // 后台数据三分钟更新一次，所以这中间如果购买人超过10个的话，会漏掉这部分数据
let ajaxUrl = 'https://www.lmlc.com/s/web/home/user_buying';

if(!fs.existsSync('spider/user.json')){
    fs.writeFileSync('spider/user.json', '');
}

let timer = setInterval(function() {
    requestData(ajaxUrl);
}, delay);

requestData(ajaxUrl);

function formatData(data){
    for(let i=0, len=data.length; i<len; i++){
        delete data[i].userPic;
        data[i].buyTime = +new Date() - data[i].time;
        data[i].uniqueId = data[i].payAmount.toString() + data[i].productId + data[i].username;
    }
    return data
}

function requestData(url) {
    counter++;
    if(counter == total){
        clearInterval(timer);
    }
    superagent.get(url)
    .end(function(err,pres){
        // 常规的错误处理
        if (err) {
          console.log(err.message.error);
          return;
        }
        let newData = JSON.parse(pres.text).data;
        let formatNewData = formatData(newData);
        let data = fs.readFileSync('spider/user.json', 'utf-8');
        if(!data){
            fs.writeFile('spider/user.json', JSON.stringify(formatNewData), (err) => {
                if (err) throw err;
                let time = (new Date()).format("yyyy-MM-dd hh:mm:ss");
                console.log((`第${counter}次爬取首页用户购买ajax完毕，时间：${time}`).silly);
            });
        }else{
            let oldData = JSON.parse(data);
            let addData = [];
            // 排重算法，如果uniqueId不一样那肯定是新生成的，否则看时间差如果是0(三分钟内请求多次)或者三分钟则是旧数据
            for(let i=0, len=formatNewData.length; i<len; i++){
                let matchArr = [];
                for(let len2=oldData.length, j=Math.max(0,len2 - 20); j<len2; j++){
                    if(formatNewData[i].uniqueId === oldData[j].uniqueId){
                        matchArr.push(j);
                    }
                }
                if(matchArr.length === 0){
                    addData.push(formatNewData[i]);
                }else{
                    let isNewBuy = true;
                    for(let k=0, len3=matchArr.length; k<len3; k++){
                        let delta = formatNewData[i].time - oldData[matchArr[k]].time;
                        if(delta == 0 || (Math.abs(delta - 3*60*1000) < 1000)){
                            isNewBuy = false;
                            // 更新时间，这样下一次判断还是三分钟
                            oldData[matchArr[k]].time = formatNewData[i].time;
                        }
                    }
                    if(isNewBuy){
                        addData.push(formatNewData[i]);
                    }
                }
            }
            fs.writeFile('spider/user.json', JSON.stringify(oldData.concat(addData)), (err) => {
                if (err) throw err;
                let time = (new Date()).format("yyyy-MM-dd hh:mm:ss");
                console.log((`第${counter}次爬取首页用户购买ajax完毕，时间：${time}`).silly);
            });
        }
    });
}







