$(document).ready(function() {
    var ca = {};
    var query = {};
    var search = location.search.substring(1).split('&');
    for(var i=0,len=search.length; i<len; i++){
        query[search[i].split('=')[0]] = search[i].split('=')[1];
    }
    query._date = query.date.split('-')[0] + '年' + query.date.split('-')[1] + '月' + query.date.split('-')[2] + '日';
    query._url = 'https://www.lmlc.com/web/product/product_detail.html?id=' + query.id;
    query._name = decodeURIComponent(query.name);
    $('#title').html(query._date + '立马理财' + '<a target="_blank" href=' + query._url + '>'+ query._name + '</a>产品的销售情况');

    showProdChart();
    showProdTable();

    function showProdChart() {
        $.post("/ajax/getProdChart", {
            date: query.date,
            id: query.id
        }, function(res) {
            // console.log(res.data);
            ca.myChart && ca.myChart.clear();
            ca.myChart = echarts.init(document.getElementById('prodChart'));
            var option = {
                title: {
                    text: '已售金额(元)'
                },
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: res.data.dates
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: '',
                    type: 'line',
                    stack: '已售金额',
                    data: res.data.amounts
                }]
            };
            ca.myChart.setOption(option);
        });
    }
    function showProdTable() {
        $.post("/ajax/getProdTable", {
            date: query.date,
            id: query.id
        }, function(res) {
            ca.prodTable && ca.prodTable.destroy();
            var markup = ['<tr>',
                '<td>${username}</td>',
                '<td>${buyAmount}</td>',
                '<td>${buyTime}</td>',
                '</tr>'
            ].join('');
            $.template("prodTemplate", markup);
            $('#prodTbody').html($.tmpl("prodTemplate", res.data.records));
            ca.prodTable = $('#prodTable').DataTable({
                "order": [
                    [2, "asc"]
                ]
            });
        });
    }
})