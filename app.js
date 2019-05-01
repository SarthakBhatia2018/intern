var express               =     require("express"),
    mongoose              =     require("mongoose"),
    bodyParser            =     require("body-parser"),
    User                  =     require("./models/user"),
    passport              =     require("passport"),
    flash                 =     require("connect-flash"),
    LocalStrategy         =     require("passport-local"),
    passportLocalMongoose =     require("passport-local-mongoose");
    
var app=express();
mongoose.connect("mongodb://localhost:27017/auth_demo_app",{useNewUrlParser: true});
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
  secret:"I am learning backend",
  resave:false,
  saveUninitialized:false
}));
app.use(flash())
app.use(function(req, res, next){
   res.locals.currentUser = req.username;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





//Routes
app.get('/',function(req,res)
{
    res.render("home");
})
app.get("/secret",isLoggedIn, function(req, res){
   res.render("secret"); 
}); 
app.get("/register",function(req, res) {
    res.render("register");
});
  app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error",err.message)
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
             req.flash("success","Welcome to Vidyasagar :"+user.username)
             res.redirect("/secret");
        });
    });
});
app.get("/login", function(req, res){
   res.render("login"); 
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login",
    failureFlash:"Invalid username or password"
    }) ,function(req, res){
});

app.get("/logout",function(req,res){
  req.logout();
  req.flash("success","Logged out Successfully")
  return res.redirect("/");
})
function isLoggedIn(req,res,next){
   if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that!")
    return res.redirect("/login");
}

app.listen(process.env.PORT,process.env.IP,function()
{
  console.log("Server has started.....!");  
})