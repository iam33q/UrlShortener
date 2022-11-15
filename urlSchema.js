const mongoose = require("mongoose");
const urlSchema = new mongoose.Schema({
	short_url: String,
	original_url: String
})
return mongoose.model('Url', urlSchema);
