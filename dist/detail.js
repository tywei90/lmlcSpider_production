"use strict";$(document).ready(function(){for(var t={},a={},e=location.search.substring(1).split("&"),d=0,r=e.length;d<r;d++)a[e[d].split("=")[0]]=e[d].split("=")[1];a._date=a.date.split("-")[0]+"年"+a.date.split("-")[1]+"月"+a.date.split("-")[2]+"日",a._url="https://www.lmlc.com/web/product/product_detail.html?id="+a.id,a._name=decodeURIComponent(a.name),$("#title").html(a._date+'立马理财<a target="_blank" href='+a._url+">"+a._name+"</a>产品的销售情况"),$.post("/ajax/getProdChart",{date:a.date,id:a.id},function(a){t.myChart&&t.myChart.clear(),t.myChart=echarts.init(document.getElementById("prodChart"));var e={title:{text:"已售金额(元)"},color:["#3398DB"],tooltip:{trigger:"axis"},grid:{left:"3%",right:"4%",bottom:"3%",containLabel:!0},xAxis:{type:"category",boundaryGap:!1,data:a.data.dates},yAxis:{type:"value"},series:[{name:"",type:"line",stack:"已售金额",data:a.data.amounts}]};t.myChart.setOption(e)}),$.post("/ajax/getProdTable",{date:a.date,id:a.id},function(a){t.prodTable&&t.prodTable.destroy();var e=["<tr>","<td>${username}</td>","<td>${buyAmount}</td>","<td>${buyTime}</td>","</tr>"].join("");$.template("prodTemplate",e),$("#prodTbody").html($.tmpl("prodTemplate",a.data.records)),t.prodTable=$("#prodTable").DataTable({order:[[2,"asc"]]})})});