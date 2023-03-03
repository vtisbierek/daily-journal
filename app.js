require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lo = require('lodash');
const home = require(__dirname + "/home.js");
const mongoose = require("mongoose");

const homeStartingContent = "A place to write anything your heart desires ❤️";
const aboutContent = "My name is Victor Tisbierek and I'm a mechatronics engineer turned web developer, striving for happiness and fulfillment, just like everybody else in this world. I love coffee, beer, fantasy books and RPG. I'm also the father of a bright and beautiful little star called Helena, the joy of my life. 💓";
const contactContent = "You can check me out on Github and Linkedin. Cheers!";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false); 

/* mongoose.connect("mongodb://127.0.0.1:27017/journalDB", {useNewUrlParser: true}, () => {
    console.log("Connected to Daily Journal DB");
}); */

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true}, () => {
    console.log("Connected to Daily Journal DB");
});

const postSchema = new mongoose.Schema(
  {
    title: String,
    titleFamily: String,
    long: {
      type: String,
      required: true
    },
    short: {
      type: String,
      required: true
    },
    readMore: {
      type: String,
      enum: ["visible", "invisible"],
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }
);

const Post = mongoose.model("Post", postSchema);

app.get("/",function(req,res){
  Post.find({}, {title: 1, short: 1, readMore: 1, url: 1}, function(err, posts){ 
    if(err){
      console.log(err);
    } else{
      res.render("home",{startingContent: homeStartingContent, postHistory: posts});   
    }
  });
})

app.get("/contact",function(req,res){
  res.render("contact",{startingContent: contactContent});
})

app.get("/about",function(req,res){
  res.render("about",{startingContent: aboutContent});
})

app.get("/compose",function(req,res){
  res.render("compose",{});
})

app.post("/compose",function(req,res){
  let hrefTitle = req.body.newTitle;
  hrefTitle = hrefTitle.replace(/\s+/g, '-').toLowerCase();
  const newTitleFamily = hrefTitle;
  hrefTitle = "/posts/"+hrefTitle;
  
  Post.find({titleFamily: {$eq: newTitleFamily}}, {titleFamily: 1}, function(err, posts){ 
    if(err){
      console.log(err);
    } else{
      if(posts.length > 0 || (posts.length == 0 && newTitleFamily == "")){
        const urlCount = posts.length + 1;
        hrefTitle = hrefTitle + urlCount;  
      }   
      const short = home.trimText(req.body.newPost);
      const newPost = new Post(
        {
          title: req.body.newTitle,
          titleFamily: newTitleFamily,
          long: req.body.newPost,
          short: short.content,
          readMore: short.display,
          url: hrefTitle
        }
      );
      newPost.save(function(err){
        if (!err){
          res.redirect("/");
        }
      });
    }
  });
})

app.get("/posts/:story",function(req,res){
  let urlTry = req.params.story;
  urlTry = urlTry.replace(/\s+/g, '-').toLowerCase();
  urlTry = "/posts/"+urlTry;

  Post.findOne({url: {$eq: urlTry}}, {title: 1, long: 1}, function(err, post){ 
    if(err){
      console.log(err);
    } else{
      if(post){
        res.render("post",{postLog: post}); 
      } else{
        res.redirect("/");
      }
    }
  });
})

app.get("*",function(req,res){
  res.redirect("/");
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
