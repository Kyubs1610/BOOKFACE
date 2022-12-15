import mongoose from "mongoose";

const postingSchema = new mongoose.Schema({
name :{
type  : String,
required : true
} ,
content: {
type: String,
required: true
},
date: {
type: Date,
default: Date.now
},
userId: {
type: String,
required: true,
},
img: {
type: String,
},
likes: {
type: Array,
default: [],
},
},
  { timestamps: true }
);

const Posting = mongoose.model('Posting',postingSchema);

export default Posting;