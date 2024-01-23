const isLogin=async(req,res,next)=>{
    try{
       if(req.session.user_id){

       }
       else{
         res.redirect('/');
       }
       next();
    }
    catch(err){
        console.log(err);
    }
}

const isLogout=async(req,res,next)=>{
    try{
       if(req.session.user_id){
        res.redirect('/home');
       }
    }
    catch(err){
        console.log(err);
    }
    next()
}

module.exports={
    isLogin,
    isLogout
}