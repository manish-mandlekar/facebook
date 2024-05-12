var express = require('express');
var router = express.Router();
var userModel = require('./users')
var post = require("./post")
var commentModel = require('./comment')
const passport = require("passport");
const localStrategy = require('passport-local');
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const mailer = require("../nodemailer")
const crypto = require("crypto");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    // console.log(file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/pictures')
  },
  filename: function (req, file, cb) {
    // console.log(file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})
const storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/coverphoto')
  },
  filename: function (req, file, cb) {
    // console.log(file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})
const upload = multer({ storage: storage })
const upload2 = multer({ storage: storage2 })
const upload3 = multer({ storage: storage3 })

passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/check/:val', function (req, res, next) {
  res.json({message : req.params.val})
});
router.get('/forgot', function (req, res, next) {
  res.render('forgot');
});

router.get('/use/:username',isLoggedIn,async function(req,res,next){
  const founduser = await userModel.findOne({
    username : req.params.username
  }).populate('posts')

  const user = await userModel.findOne({
    username : req.session.passport.user
  }).populate('posts')
  res.render('user',{founduser , user , posts:founduser.posts})

})

router.post('/reset/:userid',async function(req, res, next){
  try {
    const user = await userModel.findOne({ _id: req.params.userid });

    if (!user) {
      return res.status(404).send("User not found");
    }
    
    await user.setPassword(req.body.password);
    user.key = "";
    await user.save();
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).send("Error while logging in");
      }
      res.redirect("/profile");
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred");
  }
  
})

router.get('/forgot/:userid/:key', async function (req, res, next) {
  var user = await userModel.findOne({_id : req.params.userid})
  if(user.key === req.params.key){
    res.render("reset",{user})
  } else {
    res.send("session expired")
  }
});

router.post('/forgot', async function (req, res, next) {
  let user = await userModel.findOne({email : req.body.email})
  if(!user){
    res.send("we've send a mail, if mail exists.")
  } else {
    crypto.randomBytes(80,async (err,buff)=>{
      let key = buff.toString("hex")
      user.key = key;
      await user.save();
      mailer(req.body.email,user._id,key).then((err)=>{
        res.send("mail sent!")
      })
    })
  }
});


router.post('/updated',isLoggedIn,function (req, res, next) {
  userModel.findOneAndUpdate({
    username : req.session.passport.user
  },{
    username : req.body.username
  },{new : true}).then((updated)=>{
    req.login(updated , function(err){
      if(err){return next(err)}
      return res.redirect("/use")
    })
  })
});

router.get('/editprofile/:id',isLoggedIn ,function (req, res, next) {
  userModel.findOne({
    _id:req.params.id
  }).then((user)=>{
    console.log(user);
    res.render('edit',{user});
  })
});

router.get('/check/:username', function (req, res, next) {
   userModel.findOne({
    username : req.params.username
   }).then((user)=>{
    if(user){
      res.json(true)
    } else {
      res.json(false)

    }
   })
});


router.post('/uploadpic', isLoggedIn, upload.single('dp'), function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user
  }).then((founduser) => {
    if(founduser.dp !== "def.png") {
      fs.unlinkSync(`./public/images/uploads/${founduser.dp}`)
    }
    founduser.dp = req.file.filename
    founduser.save()
  }).then(() => {
    res.redirect("/profile")
  })
});
router.post('/coverphoto',isLoggedIn,upload3.single("cover") ,function (req, res, next) {
  userModel.findOne({
    username : req.session.passport.user
  }).then((founduser)=>{
    if(founduser.cover !== "default.png"){
      fs.unlinkSync(`./public/images/coverphoto/${founduser.cover}`)
    }
    // console.log(req.file);
    founduser.cover = req.file.filename,
    founduser.save();
  }).then(()=>{
    res.redirect("back")
  })
});
router.post('/comment/:id',isLoggedIn, function (req, res, next) {
  userModel
  .findOne({
    username: req.session.passport.user,
  })
  .then((user) => {
    post.findOne({
        _id: req.params.id,
      })
      .then((foundpost) => {
        commentModel
          .create({
            comment: req.body.comment,
            user: user._id,
          })
          .then((cmntcreated) => {
            foundpost.comments.push(cmntcreated._id);
            foundpost.save().then(() => {
              res.redirect(`/comment/${req.params.id}`);
            });
          });
      });
  });
});

router.get('/comment/:id', isLoggedIn, function (req, res, next) {
  console.log("hello");
  userModel.findOne({
    username: req.session.passport.user
  }).then((user) => {
    post.findOne({
      _id: req.params.id
    }).populate([
      {
        path: "user",
        model: "user",
      },
      {
        path: "comments",
        model: "comment",
        populate: {
          path: "user",
          model: "user",
        }
      }
    ]).then((userpost) => {
      console.log(user);
      console.log(userpost);
      res.render('comment', { user, userpost });
      
    })

  })
});
router.post('/coverPhoto', function (req, res, next) {
  userModel.findOneAndUpdate({
    username: req.session.passport.user
  }, {
    cover: req.body.cover
  }).then((cover) => {

    res.redirect('/use');
  })
});
router.get('/changeCoverPhoto', isLoggedIn, function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user
  }).then(() => {

    res.render('cover');
  })
});


router.get('/pro', function (req, res, next) {
  res.redirect('/profile');
});
router.get('/use', isLoggedIn, function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user
  }).populate("posts").then((user) => {

    // console.log(user);
    res.render('user', { user, posts: user.posts });

  })
})

router.get('/profile', isLoggedIn, function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user
  }).then((user) => {
    post.find().populate("user").then((posts) => {
      // console.log(posts);
      // console.log(user);
      res.render('profile', { user, posts });
    })
  })
});


router.post("/postcreator", isLoggedIn, upload2.single('url'),function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user

  }).then((user) => {
    post.create({
      url : req.file.filename,
      caption: req.body.caption,
      location: req.body.location,
      user: user._id
    }).then((post) => {
      user.posts.push(post._id)
      user.save().then(()=>{

        res.redirect('/profile')
      })
    })
  })

})


router.get('/account', function (req, res, next) {
  res.render('account', { title: 'Express' });
});
router.post('/register', function (req, res) {
  var newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    surname: req.body.surname,
    password: req.body.password,
    date: req.body.date,
    month: req.body.month,
    year: req.body.year,
    check: req.body.check,
  })
  userModel.register(newUser, req.body.password)
    .then(function (u) {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile');
      })
    })
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}
router.post("/login",
  passport.authenticate("local", {
    successRedirect: "profile",
    failureRedirect: "/",
  }),
  function (req, res, next) { }
);
router.get("/createpost",isLoggedIn, function (req, res, next) {
  userModel.findOne({
    username: req.session.passport.user
  }).then((user) => {

    // console.log(user);
    
    res.render('post', { user})
  })
})
router.get("/refreshpost", function (req, res, next) {
  res.redirect('/profile')
})

router.get('/likes/:id', function (req, res, next) {
  post.findOne({
    _id: req.params.id
  }).then((foundPost) => {
    if (foundPost.likes.includes(req.user.id)) {
      var index = foundPost.likes.indexOf(req.user.id);
      foundPost.likes.splice(index, 1);
    } else {

      foundPost.likes.push(req.user.id)
    }
    foundPost.save().then(() => {

      res.redirect('back');
    })
  })
});
router.get("/deletePost/:id", function (req, res, next) {
  post.findByIdAndDelete({
    _id: req.params.id
  }).then((val) => {

    res.redirect('/profile')
  })
})
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
router.get('/admin/login', function (req, res, next) {

  res.render('admin', { title: 'Express' });
});
router.get('/admin', isLoggedIn, function (req, res, next) {

  res.render('adminpage', { title: 'Express' });
});
router.post("/adminLogin",
  passport.authenticate("local", {
    successRedirect: "admin",
    failureRedirect: "/",
  }),
  function (req, res, next) { }
);
module.exports = router;
















