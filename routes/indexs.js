var express = require("express"),
	router  = express.Router(),
	passport = require("passport"),
	User = require("../models/user");


//RESTful routes
router.get("/", function(req, res){
	res.render("landingpage");
});

//ABOUT US
router.get("/about", function(req, res){
	res.render("about");
});

//LOGIN
router.get("/login", function(req, res){
	res.render("login");
});
router.post("/login",passport.authenticate("local", {
	successRedirect: "/images",
	failureRedirect: "/login"
}), function(req, res){
	
});

//SIGNUP
router.get("/pknew", function(req, res){
	res.render("register");
});
// ----signup logic--------
router.post("/pknew", function(req,res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/images");
		});
	});
});

//logout logic
router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

//MIDDLEWARE
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("back");
}

module.exports = router;