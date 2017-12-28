$(document).ready(function() {
    var ca = {};
    var options = {
        autoHide: true,
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        yearFirst: true,
        autoPick: true,
        startDate: '2017-12-21',
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
        date: new Date(+new Date() - 24 * 60 * 60 * 1000)
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
    function showNowSells(){
        $.post("/ajax/getInitSales", function(res){
            ca.myChart1 = echarts.init(document.getElementById('nowSales'));
            var option = {
                title: {
                    text: '实时数据',
                    subtext: '10秒刷新'
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
                // toolbox: {
                //     show: true,
                //     feature: {
                //         dataView: {readOnly: false},
                //         restore: {},
                //         saveAsImage: {}
                //     }
                // },
                dataZoom: {
                    show: false,
                    start: 0,
                    end: 100
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
                                res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                                now = new Date(now - 10*1000);
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
                        max: 50000000,
                        min: 0,
                        boundaryGap: [0.2, 0.2]
                    },
                    {
                        type: 'value',
                        scale: true,
                        name: '前10秒售卖金额',
                        max: 1000000,
                        min: 0,
                        boundaryGap: [0.2, 0.2]
                    }
                ],
                series: [
                    {
                        name:'前10秒售卖金额',
                        type:'bar',
                        xAxisIndex: 0,
                        yAxisIndex: 1,
                        data: res.data.span
                    },
                    {
                        name:'已售总金额',
                        type:'line',
                        xAxisIndex: 0,
                        yAxisIndex: 0,
                        data: res.data.total
                    }
                ]
            };
            ca.myChart1.setOption(option);
            var count = 11;
            setInterval(function (){
                $.post("/ajax/getNowSales", function(res){
                    var axisData = (new Date()).toLocaleTimeString().replace(/^\D*/,'');
                    var data0 = option.series[0].data;
                    var data1 = option.series[1].data;
                    data0.shift();
                    data0.push(res.data.total - data1[9]);
                    data1.shift();
                    data1.push(res.data.total);
                    option.xAxis[0].data.shift();
                    option.xAxis[0].data.push(axisData);
                    ca.myChart1.setOption(option);
                })
            }, 10*1000);
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
                '<td><a target="_blank" href="/detail?date=' + date + '&id=${productId}&name=${encodeURIComponent(productName)}">${productName}</a></td>',
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