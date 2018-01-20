$(document).ready(function() {
    var ca = {};
    var options = {
        autoHide: true,
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        yearFirst: true,
        autoPick: true,
        startDate: '2017-12-22',
        endDate: new Date(+new Date() - 24 * 60 * 60 * 1000)
    }
    $.fn.datepicker.setDefaults(options);
    $('.datepicker').on('keydown', function(e) {
        e.preventDefault();
    })
    $('.startTime').datepicker({
        date: new Date(+new Date() - 10 * 24 * 60 * 60 * 1000)
    });
    $('.endTime').datepicker({
        date: new Date(+new Date() - 24 * 60 * 60 * 1000),
        startDate: new Date(+new Date() - 10 * 24 * 60 * 60 * 1000)
    });
    $('.startTime').on('pick.datepicker', function(e) {
        $('.endTime').datepicker('destroy');
        $('.endTime').datepicker({
            startDate: e.date
        });
        $('.endTime').datepicker('show');
    });
    $('.endTime').on('hide.datepicker', function(e) {
        showPeriodSells();
    })
    showNowSells();
    $('#selectDelta').change(function(event) {
        showNowSells();
    });
    function getBoundary(arr, type, degree){
        var out;
        if(type == 'min'){
            var min = Math.min.apply(null, arr);
            out = (parseInt(min/Math.pow(10, min.toString().length-degree))) * Math.pow(10, min.toString().length-degree);
        }
        if(type == 'max'){
            var max = Math.max.apply(null, arr);
            out = (parseInt(max/Math.pow(10, max.toString().length-degree))+1) * Math.pow(10, max.toString().length-degree);
            if(out < 10000){
                out = 10000;
            }
        }
        return out
    }
    function showNowSells(){
        var deltaStr = '';
        var delta = parseInt($('#selectDelta').val());
        if(delta >= 3600){
            deltaStr = delta/3600 + '小时';
        }else if(delta >= 60){
            deltaStr = delta/60 + '分钟';
        }else{
            deltaStr = delta + '秒';
        }
        $.post("/ajax/getInitSales", {
            delta: delta
        }, function(res){
            var span = res.data.span;
            var total = res.data.total;
            ca.myChart1 && ca.myChart1.clear();
            ca.timer && clearInterval(ca.timer);
            ca.myChart1 = echarts.init(document.getElementById('nowSales'));
            var option = {
                title: {
                    text: '实时数据',
                    subtext: `约${deltaStr}刷新`
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#283b56'
                        }
                    }
                },
                legend: {
                    data:['最新售卖记录', '已售总金额']
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: true,
                        data: (function (){
                            var now = new Date();
                            var res = [];
                            var len = 10;
                            while (len--) {
                                let str = '';
                                if(now.toLocaleDateString() == (new Date()).toLocaleDateString()){
                                    str = now.toTimeString().split(" ")[0];
                                }else{
                                    str = '昨' + now.toTimeString().split(" ")[0];
                                }
                                res.unshift(str);
                                now = new Date(now - delta*1000);
                            }
                            return res;
                        })()
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        scale: true,
                        name: '已售总金额',
                        min: getBoundary(total, 'min', 3),
                        max: getBoundary(total, 'max', 3),
                        boundaryGap: [0.2, 0.2]
                    },
                    {
                        type: 'value',
                        scale: true,
                        name: `前${deltaStr}售卖金额`,
                        min: getBoundary(span, 'min', 2),
                        max: getBoundary(span, 'max', 2),
                        boundaryGap: [0.2, 0.2]
                    }
                ],
                series: [
                    {
                        name: `前${deltaStr}售卖金额`,
                        type:'bar',
                        xAxisIndex: 0,
                        yAxisIndex: 1,
                        data: span
                    },
                    {
                        name:'已售总金额',
                        type:'line',
                        xAxisIndex: 0,
                        yAxisIndex: 0,
                        data: total
                    }
                ]
            };
            ca.myChart1.setOption(option);
            function getNowSales(){
                $.post("/ajax/getNowSales", function(res){
                    var axisData = (new Date()).toTimeString().split(" ")[0];
                    var data0 = option.series[0].data;
                    var data1 = option.series[1].data;
                    // 页面停留过0点之后
                    if(axisData.split(':')[0] < option.xAxis[0].data[9].split(':')[0]){
                        data0.forEach(function(val,i){
                            data0[i] = 0;
                        })
                        data1.forEach(function(val,i){
                            data1[i] = 0;
                        })
                        option.xAxis[0].data.forEach(function(val,i){
                            option.xAxis[0].data[i] = '昨' + option.xAxis[0].data[i];
                        })
                    }
                    data0.shift();
                    data0.push(res.data.total - data1[9]);
                    data1.shift();
                    data1.push(res.data.total);
                    option.xAxis[0].data.shift();
                    option.xAxis[0].data.push(axisData);
                    option.yAxis[0].min = getBoundary(data1, 'min', 3);
                    option.yAxis[0].max = getBoundary(data1, 'max', 3);
                    option.yAxis[1].min = getBoundary(data0, 'min', 2);
                    option.yAxis[1].max = getBoundary(data0, 'max', 2);
                    ca.myChart1.setOption(option);
                })
            }
            ca.timer = setInterval(function (){
                getNowSales();
            }, delta*1000);
        })
    }
    
    showPeriodSells();
    function showPeriodSells() {
        $.post("/ajax/getPeriodSales", {
            startTime: $('.startTime').datepicker('getDate', 'yyyy-mm-dd'),
            endTime: $('.endTime').datepicker('getDate', 'yyyy-mm-dd')
        }, function(data) {
            ca.myChart2 && ca.myChart2.clear();
            ca.myChart2 = echarts.init(document.getElementById('periodSales'));
            var option = {
                title: {
                    text: '总销售额/天(元)'
                },
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
                    data: data.data.dates
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    name: '',
                    type: 'line',
                    stack: '总量',
                    data: data.data.sales
                }]
            };
            ca.myChart2.setOption(option);
        });
    }
    $('.oneday').datepicker({
        date: new Date(+new Date() - 24 * 60 * 60 * 1000)
    });
    showOnedaySells();
    $('.oneday').on('pick.datepicker', function(e) {
        showOnedaySells();
    })

    function showOnedaySells() {
        var date = $('.oneday').datepicker('getDate', 'yyyy-mm-dd');
        $.post("/ajax/getOnedayTable", {
            date: date,
        }, function(res) {
            ca.onedayTable && ca.onedayTable.destroy();
            var markup = ['<tr>',
                '<td><a target="_blank" class="prod-name" href="/detail?date=' + date + '&id=${productId}&name=${encodeURIComponent(productName)}">${productName}</a></td>',
                '<td>${(sellAmount/10000).toFixed(0)}</td>',
                '<td>${(financeTotalAmount/10000).toFixed(0)}</td>',
                '<td>${yearReturnRate}</td>',
                '<td>${investementDays}</td>',
                '<td>${interestStartTime}</td>',
                '<td>${interestEndTime}</td>',
                '</tr>'
            ].join('');
            $.template("onedayTemplate", markup);
            $('#onedayTbody').html($.tmpl("onedayTemplate", res.data.prod));
            ca.onedayTable = $('#onedayTable').DataTable({
                "order": [
                    [0, "desc"]
                ]
            });
        });
        $.post("/ajax/getOnedayChart", {
            date: date,
        }, function(res) {
            ca.myChart3 && ca.myChart3.clear();
            ca.myChart3 = echarts.init(document.getElementById('onedayChart'));
            var option = {
                title: {
                    text: '销售额/小时(元)'
                },
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    data: ['1点', '2点', '3点', '4点', '5点', '6点', '7点', '8点', '9点', '10点', '11点', '12点', '13点', '14点', '15点', '16点', '17点', '18点', '19点', '20点', '21点', '22点', '23点', '24点'],
                    axisTick: {
                        alignWithLabel: true
                    }
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                    name: '前一小时销售额',
                    type: 'bar',
                    barWidth: '75%',
                    data: res.data.serials
                }]
            };
            ca.myChart3.setOption(option);
        })
    }
})