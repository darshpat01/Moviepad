module.exports.isLoggedIn = (req,res,next) =>{
    
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        console.log('You must be signed in'); 
        return res.redirect('/login');
    } else{
        next(); 
    }

    

} 