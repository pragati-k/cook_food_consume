var express = require("express"),
	router  = express.Router(),
	Image = require("../models/image");

//choose file logic
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'pcloudk', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX route
router.get("/images", function(req, res){
	Image.find({}, function(err, images){
		if(err){
			console.log("errorr");
		}else {
			res.render("images", {image:images});
		}
	});
});

//NEW ROUTE
router.get("/images/newimage", isLoggedIn, function(req, res){
	res.render("newimage");
});

//CREATE ROUTE--add new images
router.post("/images", upload.single('image'), function(req, res){
	cloudinary.v2.uploader.upload(req.file.path, function(err,result){
		if(err){
			console.log(err);
			return res.redirect("back");
		}
		// add cloudinary url for the image to the image
		req.body.image = result.secure_url;
		req.body.imageId = result.public_id;
		Image.create(req.body, function(err, newImage){
			if(err){
				console.log(err)
				res.render("newimage");
			}else{
				res.redirect("/images");
			}
		});	
	});	
});

//SHOW ROUTE	
router.get("/images/:id",function(req, res){
	Image.findById(req.params.id, function(err, foundimage){
		if(err){
			res.redirect("/images")
		}else {
			res.render("showimage", {image: foundimage})
		}
	});
});

//EDIT ROUTE
router.get("/images/:id/edit",isLoggedIn, function(req, res){
	Image.findById(req.params.id, function(err, foundimage){
		if(err){
			res.redirect("/images")
		}else{
			res.render("editimage", {image: foundimage})
		}
	});
});

//UPDATE ROUTE
router.put("/images/:id",upload.single('image'), function(req, res){
	Image.findById(req.params.id, async function(err,image){
		if(err){
			res.redirect("back");
		} else {
			if(req.file){
				try{
					await cloudinary.v2.uploader.destroy(image.imageId);
					var result = await cloudinary.v2.uploader.upload(req.file.path);
					image.imageId = result.public_id;
					image.image = result.secure_url;
				} catch(err) {
                  return res.redirect("back");
              }
			}
			image.description = req.body.description;
			image.save();
			res.redirect("/images/" + req.params.id);
		}
	});
});

//DELETEimage ROUTE
router.delete("/images/:id", function(req, res){
	Image.findById(req.params.id, async function(err, image){
		if(err){
			
			return res.redirect("back");
		}
		try{
			await cloudinary.v2.uploader.destroy(image.imageId);
			image.remove();
			res.redirect('/images');
			} catch(err) {
				if(err){
					console.log(err)
					return res.redirect("back");
				}
		}
	});
});

//MIDDLEWARE
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("back");
}

module.exports = router;