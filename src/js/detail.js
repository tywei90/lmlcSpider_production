$(document).ready(function() {
    var ca = {};
    var options = {
        autoHide: true,
        language: 'zh-CN',
        format: 'yyyy-mm-dd',
        yearFirst: true,
        autoPick: true,
        startDate: '2017-12-15',
        endDate: new Date(+new Date() - 24 * 60 * 60 * 1000)
    }
    $.fn.datepicker.setDefaults(options);
    $('.datepicker').on('keydown', function(e) {
        e.preventDefault();
    })
    $('.startTime').datepicker({
        date: new Date(+new Date() - 10 * 24 * 60 * 60 * 1000),
    });
    $('.endTime').datepicker({
        date: new Date(+new Date() - 24 * 60 * 60 * 1000),
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
    showPeriodSells();

    function showPeriodSells() {
        $.post("/ajax/getPeriodSales", {
            startTime: $('.startTime').datepicker('getDate', 'yyyy-mm-dd'),
            endTime: $('.endTime').datepicker('getDate', 'yyyy-mm-dd')
        }, function(data) {
            ca.myChart && ca.myChart.clear();
            ca.myChart = echarts.init(document.getElementById('periodSales'));
            var option = {
                title: {
                    text: '总销售额'
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
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
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
            ca.myChart.setOption(option);
        });
    }
})