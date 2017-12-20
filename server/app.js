var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var engines = require('consolidate');

var ajax = require('./ajax');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/dist', express.static(path.join(__dirname, '../dist')));

// 公共ajax接口(index.js)
app.use('/ajax', ajax);

// 公共html页面，比如登录页，注册页
app.get('/', function(req, res, next) {
    res.render('index');
});

app.get('/detail', function(req, res, next) {
    res.render('detail');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    err.title = 'Not Found';
    next(err);
});

// error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

module.exports = app;
