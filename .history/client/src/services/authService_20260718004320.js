

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
    if(!userData){
        throw new Error("user is not found")
    redirect('/login');
  
    }else {
        userData = JSON.stringify(userData);
        redirect('/dashboard');
    }
}