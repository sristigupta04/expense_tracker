

function register(useData){
    if(!userData){
        throw new Error("user is not found")
    redirect('/login');
  
    }else {
        userData = JSON.stringify(userData);
        redirect('/dashboard');
    }
}

function login(userData){
       if(!userData.email || !userData.password){
        throw new Error("email or password is not found")
        
    }

    localstorage.item("user",JSON.stringify(userData));
    return res.json({message:"user is logged in "})
}