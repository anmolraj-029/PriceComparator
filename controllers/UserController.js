const User=require('../models/UserModels')
const bcrypt=require('bcrypt')
const nodemailer=require("nodemailer")
const randomstring=require("randomstring")

const securepassword=async(password)=>{
    try{
        const hashpassword=await bcrypt.hash(password,10);
        return hashpassword;
    }
    catch(err){
        console.log(err);
    }
}
//for verify email
const sendVerifymail=async(name,email,user_id)=>{
    //let testaccount=await nodemailer.createTestAccount()
     try{
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            //host:'smtp.ethereal.email',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'anmolraj029@gmail.com',
                pass:'vohv uzez tcqw zkci'
            }
            // auth: {
            //     user: 'scottie84@ethereal.email',
            //     pass: 'vXakyV7MCSJpNgCDYF'
            // }
        });
        const mailoptions={
            from:'anmolraj029@gmail.com',
            to:email,
            subject:'For verification mail',
            html:'<p>Hello '+name+',Please click here to <a href=" https://pricecomparator-2.onrender.com/verify?id='+user_id+' "> verify </a> your mail.</p>'
        }
        transporter.sendMail(mailoptions,function(error,info){
            if(error){
                console.log(error)
            }
            else{
                console.log('Email has been sent:-',info.response);
            }
        })
     }
     catch(err){
        console.log(err)
     }
}
const loadRegister=async(req,res)=>{
    try{
        console.log("anmol ho raha h")
         res.render('registration')
    }
    catch(err){
        console.log(err);
    }
}
const insertuser=async(req,res)=>{
    const spassword=await securepassword(req.body.password)
    try{
       const user= new User({
         name:req.body.name,
         email:req.body.email,
         mobile:req.body.mobile,
         image:req.file.filename,
         password:spassword,
         is_admin:0
       })
       const userdata=await user.save();
       sendVerifymail(req.body.name,req.body.email,userdata._id)
       res.render('registration',{message:"Your Registration has been successful.Please verify your email"});
    }
    catch(err){
        console.log(err);
    }
}

const verifymail=async(req,res)=>{
    try{
        const updateinfo=await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});
        console.log(updateinfo);
        res.render('email-verified')
    }
    catch(err){
        console.log(err)
    }
}
//login user methods started
const loginload=async(req,res)=>{
    try{
        res.render('login');
    }
    catch(err){
        console.log(err);
    }
}

const verifyLogin=async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;

      const userdata= await User.findOne({email:email});
      if(userdata){
          const passwordMatch=await bcrypt.compare(password,userdata.password)
          if(passwordMatch){
            if(userdata.is_verified==0){
                res.render('login',{message:"Email not verified"});
            }
            else{
              req.session.user_id=userdata._id;
              res.redirect('/home');
            }
          }
          else{
            res.render('login',{message:"Your Email and password incorrect"});
          }
      }
      else{
        res.render('login',{message:"Your Email and password incorrect"});
      }
    }
    catch(err){
        console.log(err);
    }
}
const loadHome=async(req,res)=>{
    try{
       res.render('home');
    }
    catch(err){
        console.log(err);
    }
}
const homesearch=async(req,res)=>{
    try{
        async function submitJob(values) {
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'accept': 'application/json'
              },
              body: `token=EDNDDCQESGNEKAIYEMSLNZXMBOGKPYSBSOXQXUHTGNOHUHWZGYABVFFIIYOEHXQK` +
                `&country=in` +
                `&source=google_shopping` +
                `&topic=product_and_offers` +
                `&key=term` +
                `&max_age=1200` +
                `&max_pages=20` +
                `&sort_by=ranking_descending` +
                `&condition=any` +
                `&shipping=any` +
                `&values=${values}`
            };
          
            try {
              const response = await fetch('https://api.priceapi.com/v2/jobs', options);
              const { job_id } = await response.json();
              return job_id;
            } catch (error) {
              console.error('Error submitting job:', error);
              throw error;
            }
          }
    
          async function checkJobStatus(jobId) {
            const statusOptions = {
              method: 'GET',
              headers: {
                accept: 'application/json'
              }
            };
          
            try {
              let status = '';
              while (status !== 'finished') {
                const statusResponse = await fetch(`https://api.priceapi.com/v2/jobs/${jobId}?token=EDNDDCQESGNEKAIYEMSLNZXMBOGKPYSBSOXQXUHTGNOHUHWZGYABVFFIIYOEHXQK`, statusOptions);
                const { status: jobStatus } = await statusResponse.json();
                status = jobStatus;
                if (status !== 'finished') {
                  console.log('The status is not "finished". Retrying in 5 seconds...');
                  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
                }
              }
              console.log('The job status is "finished".');
            } catch (error) {
              console.error('Error checking job status:', error);
              throw error;
            }
          }
          async function displayOfferDetails(jobId) {
            const downloadOptions = {
              method: 'GET',
              headers: {
                accept: 'application/json'
              }
            };
          
            try {
              const downloadResponse = await fetch(`https://api.priceapi.com/v2/jobs/${jobId}/download?token=EDNDDCQESGNEKAIYEMSLNZXMBOGKPYSBSOXQXUHTGNOHUHWZGYABVFFIIYOEHXQK`, downloadOptions);
              const {results} = await downloadResponse.json();
               res.render("searchResults", {results});
            }
            catch(error){
                console.error('Error displaying offer details:', error);
               throw error;
            }
        }
        
        async function processJob(values) {
            try {
              const jobId = await submitJob(values);
              console.log('Job ID:', jobId);
              await checkJobStatus(jobId);
              await displayOfferDetails(jobId);
            } catch (error) {
              console.error('Error processing job:', error);
            }
          }
        const searchValues = req.body.productName.toLowerCase(); // Your search term or values
        processJob(searchValues);
      
    }
    catch(err){
        console.log(err);
    }
}
const userLogout=async(req,res)=>{
    try{
       req.session.destroy();
       res.redirect('/login');
    }
    catch(err){
        console.log(err);
    }
}
const loadabout=async(req,res)=>{
    try{
        res.render('about')
    }
    catch(err){
        console.log(err);
    }
}

//forget password code start
//for reset password send mail
const sendResetPasswordMail=async(name,email,token)=>{
    //let testaccount=await nodemailer.createTestAccount()
     try{
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            //host:'smtp.ethereal.email',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'anmolraj029@gmail.com',
                pass:'vohv uzez tcqw zkci'
            }
            // auth: {
            //     user: 'scottie84@ethereal.email',
            //     pass: 'vXakyV7MCSJpNgCDYF'
            // }
        });
        const mailoptions={
            from:'anmolraj029@gmail.com',
            to:email,
            subject:'For Reset Pssword',
            html:'<p>Hello '+name+',Please click here to <a href=" https://pricecomparator-2.onrender.com/forget-password?token='+token+' ">Reset</a> your password.</p>'
        }
        transporter.sendMail(mailoptions,function(error,info){
            if(error){
                console.log(error)
            }
            else{
                console.log('Email has been sent:-',info.response);
            }
        })
     }
     catch(err){
        console.log(err)
     }
}
const forgetLoad=async(req,res)=>{
    try{
        res.render('forget');
    }
    catch(err){
        console.log(err);
    }
}

const forgetVerify=async(req,res)=>{
    try{
         const email=req.body.email;
         const userdata=await User.findOne({email:email});
         if(userdata){
           if(userdata.is_verified==0){
              res.render('forget',{message:"Please verify your mail"});
           }
           else{
            const randomstrig=randomstring.generate();
             const updateData=await User.updateOne({email:email},{$set:{token:randomstrig}});
             sendResetPasswordMail(userdata.name,userdata.email,randomstrig);
             res.render('forget',{message:"Please check your mail to reset your password"});

           }
         }
         else{
            res.render('forget',{messgae:"user email is incorrect"});
         }
    }
    catch(err){
        console.log(err);
    }
}

const forgetPasswordLoad=async(req,res)=>{
    try{
       const token=req.query.token;
       const tokenData=await User.findOne({token:token});
       if(tokenData){
          res.render('forget-password',{user_id:tokenData._id});
       }
       else{
          res.render('404',{message:"Token is invalid"});
       }
    }
    catch(err){
        console.log(err);
    }
}

const resetPassword=async(req,res)=>{
    try{
       const password=req.body.password;
       const user_id=req.body.user_id;
       const secure_password=await securepassword(password);

       const updateData=await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}});
       res.redirect('/');
    }
    catch(err){
        console.log(err);
    }
}


module.exports={
    loadRegister,
    insertuser,
    verifymail,
    loginload,
    verifyLogin,
    loadHome,
    homesearch,
    loadabout,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword
}