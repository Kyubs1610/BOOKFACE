import express, { request, response } from "express";
import * as dotenv from 'dotenv';
dotenv.config()
import bodyParser from "body-parser";
import mongoose from "mongoose";
import User from "./views/users.js";
import bcrypt from "bcrypt";
import session from "express-session"
import passport from "passport";
import passportConfig from './views/passport.js';
import flash from "express-flash";
import Posting from "./views/posting.js";

// all the import in order to make the app working 

const app = express()
app.use(flash())
app.set('view engine', 'ejs');
app.use( express.static( "public"));
app.use(bodyParser.json());
app.use(express.json());

app.use(bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.urlencoded({ extended: true}))

app.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
}));
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

// end of the setup and begin of the pages
//Register page

app.get('/register',(req,res)=>{
  res.render('register.ejs')
 }) 

app.post('/register',(req,res)=>{
  const {name,email, password, password2} = req.body;
  let errors = [];
  console.log(' Name ' + name+ ' email :' + email+ ' pass:' + password);
  if(!name || !email || !password || !password2) {
      errors.push({msg : "Please fill in all fields"})
  }
  //check if match
  if(password !== password2) {
      errors.push({msg : "Passwords dont match"});
  }
  
  //check if password is more than 6 characters
  if(password.length < 6 ) {
      errors.push({msg : 'Password atleast 6 characters'})
  }
  if(errors.length > 0 ) {
  res.render('register', {
      errors : errors,
      name : name,
      email : email,
      password : password,
      password2 : password2})
   } else {
      //validation passed
     User.findOne({email : email}).exec((err,user)=>{
      console.log(user);   
      if(user) {
          errors.push({msg: 'Email already registered'});
          res.render('register',{errors,name,email,password,password2})  
         } else {
          const newUser = new User({
              name : name,
              email : email,
              password : password
          });
  
          //hash password
          bcrypt.genSalt(10,(err,salt)=> 
          bcrypt.hash(newUser.password,salt,
              (err,hash)=> {
                  if(err) throw err;
                      //save pass to hash
                      newUser.password = hash;
                  //save user
                  newUser.save()
                  .then((value)=>{
                      console.log(value)
                      res.redirect('/login');
                  })
                  .catch(value=> console.log(value));
                    
              }));
           }
     })
  }
  })
 
// Login page

app.get('/login',(req,res)=>{
  res.render('../views/login.ejs')
})

app.post('/login', (req,res,next)=>{
  passport.authenticate('local',{
    successRedirect : '/homepage',
    failureRedirect : '/login',
    failureFlash : true,
    })(req,res,next);
  
})

// homepage where we will make all our post

app.get("/homepage", (req, res) => {

  Posting.find({}, (err, postingMessage) => {
        res.render("homepage.ejs", { user: req.user, postingMessage: postingMessage });
  });
});
app.post("/homepage", async(req, res) => {
  
  const postingMessage = new Posting({
    content: req.body.content,
    name:req.user.name
    });
  if (req.user) {
    postingMessage.userId = req.user._id;
  }
  try {
    await postingMessage.save();
    res.render("homepage.ejs", { user: req.user, postingMessage: postingMessage });
    res.redirect("homepage")
  } catch (err) {
    res.redirect("/404");
  }
});

// setup the connection of mongoDB & the browser

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log("Connected to db!");
  app.listen(3001, () => console.log("Server Up and running"));
  });
  