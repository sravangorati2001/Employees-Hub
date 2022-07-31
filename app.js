var createError = require('http-errors');
var express = require('express');
const route = express.Router()
var path = require('path');
var cookieParser = require('cookie-parser');
const session=require('express-session')
var logger = require('morgan');
require('dotenv').config()

var controller = require('./controller/controller');
const MongoStore = require("connect-mongo")
var bodyParser = require('body-parser');
var app = express();
var mongodbutil = require("./db/conn");



app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.resolve(__dirname, "public/javascripts")))
app.use('/images',express.static(path.resolve(__dirname, "public/images")))
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use('/', express.static(path.resolve(__dirname, "views")))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


const sessionStorage=MongoStore.create({
  mongoUrl:'mongodb://localhost:27017',
  dbName:'sample_airbnb',
  collectionName:'sessions',
  ttl: 14 * 24 * 60 * 60,
  autoRemove: 'native'
})

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.API_SECRET,
  store:sessionStorage,
  unset: 'destroy'
}))
//app.use('/jquery',express.static(__dirname+'/node_modules/jquery/dist/'));
mongodbutil.connectToServer(function (err) {
  var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var quesRouter = require('./routes/ques');
var postRouter = require('./routes/post');
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/post',postRouter);
app.use('/ques',quesRouter);
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
});

})


module.exports = app;
