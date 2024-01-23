 //const Router=require("Router")
const express=require("express")
const user_route=express.Router();
const session=require("express-session");
const config=require('../config/config');

user_route.use(session({secret:config.sessionSecret}));

// user_route.use(session({
//     secret: config.sessionSecret, // Replace with a secret key for session data
//     resave: false, // Set to false to prevent unnecessary session saves
//     saveUninitialized: true, // Set to true to save sessions that are new but not modified
//     // Additional session configuration options if needed
//   }));

const auth=require("../middleware/auth");
//const path=require("path")
// user_route.set('view engine','ejs')
//user_route.set('views','./views/users')
//user_route.set('views',path.join(__dirname,'../views/users'))

// const bodyParser=require("body-parser")
// user_route.use(bodyParser.json())
// user_route.use(bodyParser.urlencoded({extended:true}))

const multer=require("multer")
const path=require("path")
//const upload = multer({dest: 'uploads/'});
 const storage=multer.diskStorage({
     destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/UserImages'))
    },
    filename:function(req,file,cb){
       const name=Date.now()+'-'+file.originalname.replace(/\s+/g, '_');
       cb(null,name)
    }
});
const upload=multer({storage:storage})

const UserController=require("../controllers/UserController");
//const { sessionSecret } = require("../config/config");

user_route.get("/quickshop",auth.isLogout,UserController.loadRegister)
//user_route.post("/register",UserController.insertuser)
user_route.post("/quickshop",upload.single('image'),UserController.insertuser)

user_route.get("/verify",UserController.verifymail)

user_route.get("/",auth.isLogout,UserController.loginload);
user_route.get("/login",auth.isLogout,UserController.loginload);
user_route.post('/login',UserController.verifyLogin);

user_route.get('/home',auth.isLogin,UserController.loadHome);
user_route.post('/home',auth.isLogin,UserController.homesearch);

user_route.get('/about',auth.isLogin,UserController.loadabout);

user_route.get("/logout",auth.isLogin,UserController.userLogout);

user_route.get('/forget',auth.isLogout,UserController.forgetLoad);
user_route.post('/forget',UserController.forgetVerify);

user_route.get('/forget-password',auth.isLogout,UserController.forgetPasswordLoad);
user_route.post('/forget-password',UserController.resetPassword);


module.exports={
    user_route
}