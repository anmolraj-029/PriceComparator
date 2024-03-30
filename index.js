// const mongoose=require("mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/user_managment_system")
// .then(()=>{
//     console.log("mongo connected")
// })
// .catch((err)=>{
//     console.log(err)
// })
const mongoose=require('mongoose');
mongoose.set('strictQuery',false);
const port=5000 || process.env.PORT;
const connectDB=async()=>{
    try{
      const conn=await mongoose.connect(process.env.MONGODB_URI);
      console.log(`Database connected: ${conn.connection.host}`);
    }
    catch(err){
        console.log(err);
    }
}
const express=require("express")
const app=express()

const bodyParser=require("body-parser")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.set('view engine','ejs')
app.set('views','./views/users')

//for user routes
const UserRoutes=require('./routes/UserRoutes')
app.use('/',UserRoutes.user_route)

app.listen(port,()=>{
    console.log("server is running");
})