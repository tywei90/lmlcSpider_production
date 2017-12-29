let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require("fs");

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

router.post('/getInitSales', function(req, res, next) {
    let delta = req.body.delta;
    console.log(delta);
    let prod = JSON.parse(fs.readFileSync('data/prod.json', 'utf-8'));
    let user = JSON.parse(fs.readFileSync('data/user.json', 'utf-8'));
    let total = [];
    for(let i=0; i<11; i++){
        total[i] = 0;
        let time = +new Date() - (10-i)*delta*1000;
        for(let j=0, len=prod.length; j<len; j++){
            for(let k=0, len2=prod[j].records.length; k<len; k++){
                if(prod[j].records[k].buyTime <= time){
                    total[i] += prod[j].records[k].buyAmount;
                }
            }
        }
        for(let j=0, len=user.length; j<len; j++){
            if(user[j].productId=="jsfund" && user[j].buyTime <= time){
                total[i] += user[j].payAmount;
            }
        }
    }
    let span = [];
    for(let i=0, len=total.length; i<len; i++){
        total[i] = parseInt(total[i]);
    }
    for(let i=0, len=total.length-1; i<len; i++){
        span.push(total[i+1]-total[i]);
    }
    total.shift()
    res.json({
        data: {total: total, span: span},
        retcode: 200,
        retdesc: '请求成功'
    });
});

router.post('/getNowSales', function(req, res, next) {
    let prod = JSON.parse(fs.readFileSync('data/prod.json', 'utf-8'));
    let user = JSON.parse(fs.readFileSync('data/user.json', 'utf-8'));
    let total = 0;
    let time = +new Date();
    for(let j=0, len=prod.length; j<len; j++){
        for(let k=0, len2=prod[j].records.length; k<len; k++){
            total += prod[j].records[k].buyAmount;
        }
    }
    for(let j=0, len=user.length; j<len; j++){
        if(user[j].productId=="jsfund"){
            total += user[j].payAmount;
        }
    }
    total = parseInt(total);
    res.json({
        data: {total: total},
        retcode: 200,
        retdesc: '请求成功'
    });
});

router.post('/getPeriodSales', function(req, res, next) {
	let periodFiles = [];
	let startTime = req.body.startTime;
    let endTime = req.body.endTime;
    let start = parseInt(startTime.replace(/-/g, ''));
    let end = parseInt(endTime.replace(/-/g, ''));
	let files = fs.readdirSync('data/');
	let dates = [];
	let sales = [];
    files.forEach(function(file, index) {
    	let date = parseInt(file) || 0;
    	if(date >=start && date <=end){
    		let dataStr = date.toString();
    		dates.push(dataStr.substr(0,4) + '/' + dataStr.substr(4,2) + '/' + dataStr.substr(6,2));
    		periodFiles.push(path.join('data/', file));
    	}
    });
    periodFiles.forEach(function(file, index) {
    	let prod = JSON.parse(fs.readFileSync(file, 'utf-8'));
    	let total = 0;
    	for(let i=0, len=prod.length; i<len; i++){
			if(prod[i].records.length){
				for(let j=0, len2=prod[i].records.length; j<len2; j++){
					total += prod[i].records[j].buyAmount;
				}
			}
		}
		sales.push(parseInt(total));
    })
    res.json({
        data: {dates, sales},
        retcode: 200,
        retdesc: '下载成功'
    });
});

router.post('/getOnedayTable', function(req, res, next) {
    let date = req.body.date;
    let prod = JSON.parse(fs.readFileSync(`data/${date.split('-').join('')}.json`, 'utf-8'));
    for(let i=0, len=prod.length; i<len; i++){
        let sellAmount = 0;
        for(let j=0, len2=prod[i].records.length; j<len2; j++){
            sellAmount += prod[i].records[j].buyAmount;
        }
        prod[i].sellAmount = sellAmount;
        delete prod[i].getDataTime;
        delete prod[i].alreadyBuyAmount;
        delete prod[i].records;
    }
    let total = 0;
    for(let i=0, len=prod.length; i<len; i++){
        total += prod[i].sellAmount;
    }
    res.json({
        data: {prod, total},
        retcode: 200,
        retdesc: '请求成功'
    });
});

router.post('/getOnedayChart', function(req, res, next) {
    let date = req.body.date;
    //一定要加上时分秒，否则会默认是+8小时时区
    let init = Date.parse(date + ' 00:00:00');
    let out = [];
    let prod = JSON.parse(fs.readFileSync(`data/${date.split('-').join('')}.json`, 'utf-8'));
    for(let i=0, len=prod.length; i<len; i++){
        for(let j=0, len2=prod[i].records.length; j<len2; j++){
            let hour = 60*60*1000;
            let buyTime = prod[i].records[j].buyTime;
            let buyAmount = prod[i].records[j].buyAmount;
            for(let k=0, len3=24; k<len3; k++){
                out[k] = out[k]||0;
                if((buyTime >= init + k*hour) && (buyTime < init + (k+1)*hour)){
                    out[k] = out[k] + buyAmount;
                }
            }
        }
    }
    for(let i=0, len=out.length; i<len; i++){
        out[i] = parseInt(out[i]);
    }
    res.json({
        data: {serials: out},
        retcode: 200,
        retdesc: '请求成功'
    });
});

router.post('/getProdChart', function(req, res, next) {
    let date = req.body.date;
    let id = req.body.id;
    let prod;
    let dateArr = [];
    let amountArr = [];
    let prods = JSON.parse(fs.readFileSync(`data/${date.split('-').join('')}.json`, 'utf-8'));
    for(let i=0, len=prods.length; i<len; i++){
        if(id === prods[i].productId){
            prod = prods[i];
            break
        }
    }
    let init = prod.getDataTime;
    let rlen = prod.records.length;
    if((prod.records[rlen-1].buyTime - prod.records[0].buyTime) < 0.5*(prod.records[0].buyTime - prod.getDataTime)){
        init = prod.records[0].buyTime - 10*1000;
    }
    let span = Math.ceil((prod.records[rlen-1].buyTime - init)/1000/10);
    for(let i=0, len=11; i<len; i++){
        dateArr.push((new Date(init + span*i*1000)).format("hh:mm:ss"));
    }
    for(let i=0, len=11; i<len; i++){
        amountArr[i] = amountArr[i]||prod.alreadyBuyAmount;
        for(let j=0; j<rlen; j++){
            let buyTime = prod.records[j].buyTime;
            let buyAmount = prod.records[j].buyAmount;
            if(buyTime <= init + i*span*1000){
                amountArr[i] = amountArr[i] + buyAmount;
            }
        }
    }
    for(let i=0, len=amountArr.length; i<len; i++){
        amountArr[i] = parseInt(amountArr[i]);
    }
    res.json({
        data: {dates: dateArr, amounts:amountArr},
        retcode: 200,
        retdesc: '请求成功'
    });
});

router.post('/getProdTable', function(req, res, next) {
    let date = req.body.date;
    let id = req.body.id;
    let records;
    let prods = JSON.parse(fs.readFileSync(`data/${date.split('-').join('')}.json`, 'utf-8'));
    for(let i=0, len=prods.length; i<len; i++){
        if(id === prods[i].productId){
            records = prods[i].records;
            break
        }
    }
    for(let i=0, len=records.length; i<len; i++){
        records[i].buyTime = (new Date(records[i].buyTime)).format("yyyy-MM-dd hh:mm:ss")
    }
    res.json({
        data: {records: records},
        retcode: 200,
        retdesc: '请求成功'
    });
});

module.exports = router;








