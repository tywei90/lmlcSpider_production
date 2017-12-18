let superagent = require('superagent-charset'),
    fs = require('fs'),
    cheerio = require("cheerio"),
    async = require("async"),
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

var cookie = process.argv.slice(2)[0];
if(!cookie){
    console.log('参数错误，需要传递cookie参数'.error);
    return
}

let counter = 0;
let total = 0; // 爬取的次数，为0则一直爬取
let delay = 60*1000;
let ajaxUrl = 'https://www.lmlc.com/web/product/product_list?pageSize=100&pageNo=1&type=0';

if(!fs.existsSync('spider/record.json') || !fs.readFileSync('spider/record.json', 'utf-8')){
    fs.writeFileSync('spider/record.json', JSON.stringify([]));
}

let timer = setInterval(function() {
    requestData(ajaxUrl);
}, delay);

requestData(ajaxUrl);


function requestData(url) {
    let pageUrls = [];
    let outArr = [];
    counter++;
    if(total && counter == total){
        clearInterval(timer);
    }
    superagent
        .get(url)
        .end(function(err,pres){
        // 常规的错误处理
        if (err) {
          console.log(err.message.error);
          return;
        }
        let result = JSON.parse(pres.text).data.result;
        for(let i=0,len=result.length; i<len; i++){
            pageUrls.push('https://www.lmlc.com/web/product/product_detail.html?id=' + result[i].id);
        }
        var reptileLink = function(url,callback){
            // 如果爬取页面有限制爬取次数，这里可设置延迟
            var delay = 0;
            console.log( '正在抓取页面：' + url);
            superagent
                .get(url)
                .set('Cookie', `NTES_SESS=${cookie}`)
                .end(function(err,pres){
                      // 常规的错误处理
                    if (err) {
                      console.log(err.message.error);
                      return;
                    }
                    var $ = cheerio.load(pres.text);
                    var records = [];
                    var $tr = $('.tabcontent').eq(2).find('tr').slice(1);
                    $tr.each(function(){
                        records.push({
                            username: $('td', $(this)).eq(0).text(),
                            buyTime: Date.parse($('td', $(this)).eq(1).text()),
                            buyAmount: parseFloat($('td', $(this)).eq(2).text().replace(/,/g, '')),
                            uniqueId: $('td', $(this)).eq(0).text() + $('td', $(this)).eq(1).text() + $('td', $(this)).eq(2).text()
                        })
                    });
                    
                    setTimeout(function() {
                        callback(null, {
                            productId: url.split('?id=')[1],
                            productName: $('.name').text(),
                            records: records
                        });
                    }, delay);
                });
        };
        async.mapLimit(pageUrls, 3 ,function (url, callback) {
          reptileLink(url, callback);
        }, function (err,result) {
            console.log(`第${counter}次抓取的所有产品详情页完毕`.silly);
            let oldRecord = JSON.parse(fs.readFileSync('spider/record.json', 'utf-8'));
            for(let i=0,len=result.length; i<len; i++){
                let isNewProd = true;
                for(let j=0,len2=oldRecord.length; j<len2; j++){
                    if(result[i].productId === oldRecord[j].productId){
                        isNewProd = false;
                        for(let k=0,len3=result[i].records.length; k<len3; k++){
                            let isNewRec = true;
                            for(let m=0,len4=oldRecord[j].records.length; m<len4; m++){
                                if(result[i].records[k].uniqueId === oldRecord[j].records[m].uniqueId){
                                    isNewRec = false;
                                }
                            }
                            if(isNewRec){
                                oldRecord[j].records.unshift(result[i].records[k]);
                            }
                        }
                    }
                }
                if(isNewProd){
                    oldRecord.push(result[i]);
                }
            }
            fs.writeFileSync('spider/record.json', JSON.stringify(oldRecord));
        })
    });
}







