let fs = require('fs');
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


// user数据统计出销售额
// let data1 = JSON.parse(fs.readFileSync('spider/user2.json', 'utf-8'));
// let total1=0;
// len1=data1.length;
// for(let i=0; i<len1; i++){
// 	total1 += data1[i].payAmount;
// }
// let start1 = (new Date(data1[0].buyTime)).format("yyyy-MM-dd hh:mm:ss");
// let end1 = (new Date(data1[len1 - 1].buyTime)).format("yyyy-MM-dd hh:mm:ss");
// console.log(`user数据统计的从${start1}到${end1}的销售额是：${total1}`);

// user数据按照产品分类统计
fs.readFile('spider/user.json', 'utf-8', function(err, data){
	data = JSON.parse(data);
	let len = data.length;
	let arr =[];
	let out = [];
	for(let i=0; i<len; i++){
		let isNew = true;
		for(let j=0,len2=arr.length; j<len2; j++){
			if(arr[j].productId === data[i].productId){
				arr[j].items.push(data[i]);
				isNew = false;
			}
		}
		if(isNew){
			arr.push({productId:data[i].productId, items:[data[i]]});
		}
	}
	let total = 0;
	for(let i=0,len=arr.length; i<len; i++){
		let total2 = 0;
		for(let j=0,len2=arr[i].items.length; j<len2; j++){
			total2 += arr[i].items[j].payAmount;
		}
		console.log(`user产品${i+1}：${arr[i].items[0].productName}销售额为：${total2}`);
		total += total2;
		if(arr[i].items[0].productId !== 'jsfund'){
			out.push({
				productId: arr[i].items[0].productId,
				total: total2
			});
			
		}
	}
	fs.writeFileSync('spider/user2.json', JSON.stringify(out));
	console.log(`user数据统计的总销售额为：${total}`);
})



// 根据起止时间筛选部分user数据
// let data = JSON.parse(fs.readFileSync('spider/user.json', 'utf-8'));
// let start, end;
// data.sort(function(i,j){return i.buyTime - j.buyTime});

// for(let i=0,len=data.length; i<len; i++){
// 	if(data[i].buyTime <= 1512410400000 && data[i+1].buyTime >= 1512410400000){
// 		start = i;
// 	}
// 	if(data[i].buyTime <= 1512417600000 && data[i+1].buyTime >= 1512417600000){
// 		end = i;
// 	}
// }

// fs.writeFile('spider/user3.json', JSON.stringify(data.slice(start, end)), (err) => {
//     if (err) throw err;
//     console.log('筛选完成');
// });


// fs.readFile('spider/product2.json', 'utf-8', function(err, data){
// 	if (err) throw err;
// 	let data2 = JSON.parse(data);
// 	fs.writeFile('spider/product3.json', JSON.stringify(data2.slice(0, 5)), (err) => {
// 	    if (err) throw err;
// 	    console.log('product3筛选完成');
// 	});
// })

// product数据统计出销售额
fs.readFile('spider/product.json', 'utf-8', function(err, data){
	if (err) throw err;
	let data2 = JSON.parse(data);
	let arr =[];
	for(let i=0,len=data2.length; i<len; i++){
		for(let j=0,len2=data2[i].length; j<len2; j++){
			let isNew = true;
			for(let k=0,len3=arr.length; k<len3; k++){
				if(arr[k].productId === data2[i][j].productId){
					arr[k].items.push(data2[i][j]);
					isNew = false;
				}
			}
			if(isNew){
				arr.push({productId:data2[i][j].productId, items:[data2[i][j]]});
			}
		}
	}
	let total = 0;
	let out =[];
	for(let i=0,len=arr.length; i<len; i++){
		let len2 = arr[i].items.length;
		let total2 = 0;
		if(len2 > 1){
			total2 = arr[i].items[len2 - 1].alreadyBuyAmount - arr[i].items[0].alreadyBuyAmount;
		}
		console.log(`product产品${i+1}：${arr[i].items[0].name}销售额为：${total2}`);
		total += total2;
		out.push({
			productId: arr[i].items[0].productId,
			total: total2
		});
	}
	fs.writeFileSync('spider/product2.json', JSON.stringify(out));
	console.log(`product数据统计的总销售额为：${total}`);
})













