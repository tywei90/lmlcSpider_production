let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require("fs");

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
    		dates.push(dataStr.substr(0,4) + '-' + dataStr.substr(4,2) + '-' + dataStr.substr(6,2));
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


module.exports = router;