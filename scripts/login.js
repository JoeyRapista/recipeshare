const pb = new PocketBase('https://ugly-monkey.pockethost.io') 
document.addEventListener('alpine:init', () => {  
    Alpine.data('login', () => ({   
       init(){
        if(pb.authStore.model){
            window.location.href = 'index.html'
        }
       },
       mode: 'login',
        loginData: {
            isLoading: false,
            username: null,
            password: null
        },
        registerData: {
            isLoading: false,
            username: null,
            email: null, 
            password: null,
            confirmPassword: null
        },
        async login() { 
            if (this.loginData.username && this.loginData.password){ 
                try{ 
                    this.loginData.isLoading = true
                    const authData = await pb.collection('users').authWithPassword(
                        this.loginData.username,
                        this.loginData.password,
                    );
                    if (authData){ 
                        this.loginData.username = null;
                        this.loginData.password = null;  
                        M.toast({html: 'Login successfull!, redirecting to home page...', displayLength: 6000}) 
                        
                        window.location.href = 'index.html'
                    }
                }catch(error){
                    M.toast({html: 'Username or Password in incorrect', displayLength: 6000}) 
                }finally{
                    this.loginData.isLoading = false
                }
            }else{
                 M.toast({html: 'Username or Password field/s is/are empty.', displayLength: 6000}) 
            }

        }, 
        async register() {  
             if (this.registerData.username &&
                this.registerData.email && 
                this.registerData.password &&
                this.registerData.confirmPassword
                ){
                try { 
                    this.registerData.isLoading = true 
                    const data = {
                            "username": this.registerData.username,
                            "email": this.registerData.email,
                            "emailVisibility": true,
                            "password": this.registerData.password,
                            "passwordConfirm": this.registerData.confirmPassword,
                            "name": this.registerData.name
                    };  
                        const record = await pb.collection('users').create(data);
                        if (record){
                            M.toast({html: 'Great! You can now login.', displayLength: 8000}) 
                            this.mode = 'login'
                            this.registerData.username = null
                            this.registerData.email = null
                            this.registerData.password = null
                            this.registerData.confirmPassword  = null 
                        }
                    }catch(error){ 
                        for (const errMsg in error.data.data){ 
                            M.toast({html: `${errMsg}: ${error.data.data[errMsg].message}`, displayLength: 6000})
                        } 
                    }finally{
                        this.registerData.isLoading = false 
                    }
            }else{
                M.toast({html: 'One or more field/s is/are empty.', displayLength: 6000}) 
            }
        }
    }))
})