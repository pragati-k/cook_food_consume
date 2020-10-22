require('dotenv').config()
var express 	= require("express"),
	app 		= express(),
	methodoverride = require("method-override"),
	bodyparser 	= require("body-parser"),
	mongoose 	= require("mongoose"),
	passport	= require("passport"),
	LocalStrategy = require("passport-local"),
	expresssanitizer = require("express-sanitizer");

//SCHEMA
var Image = require("./models/image");
var User = require("./models/user");

//ROUTES
var imageRoutes = require("./routes/images"),
	indexRoutes = require("./routes/indexs");


mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
var dbURl = process.env.DATABASEURL || "mongodb://localhost/restful_blog_app"     //DATABASE
mongoose.connect(dbURl, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
app.use(bodyparser.urlencoded({extended: true}));
app.use(expresssanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodoverride("_method"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "shhhhh",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

app.use("/", imageRoutes);
app.use("/", indexRoutes);


app.listen(process.env.PORT || 5000, process.env.IP);
// app.listen(5000, function(){
// 	console.log('blog app has started!!');
// });