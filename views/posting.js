import mongoose from "mongoose";

const todoTaskSchema = new mongoose.Schema({
content: {
type: String,
required: true
},
date: {
type: Date,
default: Date.now
}
})
const Posting = mongoose.model('TodoTask',todoTaskSchema);

export default Posting;