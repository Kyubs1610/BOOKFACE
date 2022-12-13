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
app.use(express.urlencoded({ extended: false }))

app.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
}));
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get("/homepage", (req, res) => {
  res.render('homepage',{
    user: req.user
    });
});

app.get('/register',(req,res)=>{
  res.render('../views/register.ejs')
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

app.post("/homepage", async(req, res) => {
  const todoTask = new Posting({
    content: req.body.content
    });
    try {
    await todoTask.save();
    res.redirect("/");
    } catch (err) {
    res.redirect("/");
    }
    });

    
app.get("/homepage", (req, res) => {
  TodoTask.find({}, (err, tasks) => {
  res.render("homepage.ejs", { todoTasks: tasks });
  });
  });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, () => {
  console.log("Connected to db!");
  app.listen(3001, () => console.log("Server Up and running"));
  });
  