var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var engines = require('consolidate');

var index = require('./routes/index');
var detail = require('./routes/detail');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, '../public')));



app.use('/', index);
app.use('/detail', detail);



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
