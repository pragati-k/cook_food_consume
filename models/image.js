var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
	image: String,
	imageId: String,
	description: String,
	created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Image", imageSchema);