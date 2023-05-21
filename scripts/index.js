const pocketBaseURI = 'https://ugly-monkey.pockethost.io'
const pb = new PocketBase(pocketBaseURI) 
pb.authStore._onChangeCallbacks = [()=>{
    if (!pb.authStore.model){
        // if logout, redirect to login
        window.location.href = 'login.html'
    }
}]
document.addEventListener('alpine:init', () => {  
    Alpine.data('components', () => ({    
        init(){  
            $('.sidenav').sidenav();
            $('.dropdown-trigger').dropdown();  
            $('.modal').modal({
                dismissible: true // Set to false to make the modal not dismissible
              });
 
            var quillIngredients = new Quill('#newRecipeIngredients', { 
                theme: 'snow'
            }); 
            var quillInstructions = new Quill('#newRecipeInstructions', { 
                theme: 'snow'
            }); 
            quillIngredients.root.innerHTML = this.newRecipe.ingredients;
            quillInstructions.root.innerHTML = this.newRecipe.instuctions; 
            quillIngredients.on('text-change', () => { this.newRecipe.ingredients = quillIngredients.root.innerHTML; }); 
            quillInstructions.on('text-change', () => { this.newRecipe.instuctions = quillInstructions.root.innerHTML; }); 

            const fileInput = document.getElementById('cover_img');

            // listen to file input changes and add the selected files to the form data
            fileInput.addEventListener('change', function () {
                for (let file of fileInput.files) {
                    this.newRecipeFormData.append('documents', file);
                }
                console.log(this.newRecipeFormData)
            }); 
        }
    }))
    Alpine.data('main', () => ({    
        init(){
            if(!pb.authStore.model){
                window.location.href = 'login.html'
            }
            this.renderPage('recipes')
        },
        newRecipeFormData: new FormData(),
        newRecipe: {
            name: "",
            description: "",
            video_link: "",
            ingredients: "<h4> Ingredients goes here. </h4>",
            instuctions: "<h4> instructions goes here. </h4>",
            cover_img: "",
            cooking_time: "",
            preparation_time: "",
            user: pb.authStore.model.id,
            favorite_by: []   
        },
        activeTab: '',
        recipes: null,
        recipeIsLoading: false,
        favorites: null,
        favoriteIsLoading: false,
        myRecipes: null,
        myRecipeIsLoading: false,
        isCreateRecipeLoading:false,

        async createRecipe(){
            try{
                this.isCreateRecipeLoading = true
                
                // const data = JSON.stringify(this.newRecipe)
                // const record = await pb.collection('recipes').create(data); 
                // if (record){
                //     record.expand.user = pb.authStore.model
                //     this.recipes.items.unshift(record)  
                // } 

 
                this.newRecipeV2.append('title', 'Hello world!');
                 
            }catch(error){
                console.log(error)
            }finally{
                $('.modal').modal('close')
                this.isCreateRecipeLoading = false
            }

        },
        renderPage(target){ 
            if(target === 'recipes'){
                if (!this.recipes){
                    this.fetchRecipes()
                }
                this.mainPage = this.recipeCards
                this.activeTab = 'recipes'
          
            }else if(target === 'favorites'){ 
                if (!this.favorites){
                    this.fetchFavorites()
                } 
                this.mainPage = this.favoriteCards
                this.activeTab = 'favorites'
            }else if(target === 'myRecipes'){ 
                if (!this.myRecipes){
                    this.fetchMyRecipes()
                } 
                this.mainPage = this.myRecipeCards
                this.activeTab = 'myRecipes'
            }
        }, 
        async fetchRecipes(){
            try {  
                this.recipeIsLoading = true 
                this.recipes = await pb.collection('recipes').getList(1, 10, { 
                    sort: '-created',
                    expand: 'user, comments(recipe).user'
                }); 
            }catch(error) {
                console.log(error)
            }finally{
                this.recipeIsLoading = false   
            }
        },
        async fetchFavorites(){
            try { 
                this.favoriteIsLoading = true;
                this.favorites  = await pb.collection('recipes').getList(1, 50, {
                    sort: '-created',
                    filter: `favorite_by~"${pb.authStore.model.id}"`,
                    expand: 'user, comments(recipe).user'
                });  
            }catch(error) {
                console.log(error)
            }finally{
                this.favoriteIsLoading = false; 
            }
        },
        async fetchMyRecipes(){
            try { 
                this.myRecipeIsLoading = true;
                this.myRecipes  = await pb.collection('recipes').getList(1, 50, {
                    sort: '-created',
                    filter: `user="${pb.authStore.model.id}"`,
                    expand: 'user, comments(recipe).user'
                });  
            }catch(error) {
                console.log(error)
            }finally{
                this.myRecipeIsLoading = false; 
            }
        },
        async fetchMoreRecipes(){
            try {
                this.recipeIsLoading = true 
                const moreRecords = await pb.collection('recipes').getList(this.recipes.page+1, 10,{ 
                    sort: '-created',
                    expand: 'user'
                });
                if(moreRecords){ 
                    this.recipes.items.push(...moreRecords.items)
                    this.recipes.page = moreRecords.page
                    this.recipes.perPage = moreRecords.perPage
                    this.recipes.totalItems = moreRecords.totalItems
                    this.recipes.totalPages = moreRecords.totalPages  
                }
            }catch(error) {
                console.log(error)
            }finally{
                this.recipeIsLoading = false
            }
        },
        async fetchMoreFavorites(){
            try {
                this.favoriteIsLoading = true 
                const moreRecords  = await pb.collection('recipes').getList(this.favorites.page+1, 50, {
                    sort: '-created',
                    filter: `favorite_by~"${pb.authStore.model.id}"`,
                    expand: 'user, comments(recipe).user'
                }); 
                if(moreRecords){ 
                    this.favorites.items.push(...moreRecords.items)
                    this.favorites.page = moreRecords.page
                    this.favorites.perPage = moreRecords.perPage
                    this.favorites.totalItems = moreRecords.totalItems
                    this.favorites.totalPages = moreRecords.totalPages  
                }
            }catch(error) {
                console.log(error)
            }finally{
                this.favoriteIsLoading = false
            }
        },
        async fetchMoreMyRecipes(){
            try {
                this.myRecipeIsLoading = true 
                const moreRecords  = await pb.collection('recipes').getList(this.myRecipes.page+1, 50, {
                    sort: '-created',
                    filter: `user="${pb.authStore.model.id}"`,
                    expand: 'user, comments(recipe).user'
                }); 
                if(moreRecords){ 
                    this.myRecipes.items.push(...moreRecords.items)
                    this.myRecipes.page = moreRecords.page
                    this.myRecipes.perPage = moreRecords.perPage
                    this.myRecipes.totalItems = moreRecords.totalItems
                    this.myRecipes.totalPages = moreRecords.totalPages  
                }
            }catch(error) {
                console.log(error)
            }finally{
                this.myRecipeIsLoading = false
            }
        },
        logout() {
            pb.authStore.clear();  
        },
        formatTimeSince(dateString) {
            const now = new Date();
            const then = new Date(dateString);
            const diffMs = now - then;
            const diffSec = Math.round(diffMs / 1000);
          
            if (diffSec < 60) {
              return "just now";
            } else if (diffSec < 3600) {
              const diffMin = Math.floor(diffSec / 60);
              return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
            } else if (diffSec < 86400) {
              const diffHr = Math.floor(diffSec / 3600);
              return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
            } else {
              const diffDay = Math.floor(diffSec / 86400);
              return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
            }
          },
        getImgUrl(collectionId, id, fileName){
            return `${pocketBaseURI}/api/files/${collectionId}/${id}/${fileName}`
        },
        mainPage: '',
        recipeCards: `
        <div class="row"> 
            <!-- CARDS -->
            <template x-if="recipes">
                <template x-for="
                    recipe in recipes.items;
                    $nextTick(() => {   $('.dropdown-trigger').dropdown();  });
                    " :key="recipe.id">
                <div class="col s12 m6 l4">
                    <div class="card large">  
                        <!-- START CARD IMAGE  -->
                        <div class="card-image" style="cursor: pointer;">
                            <img x-bind:src="getImgUrl(recipe.collectionId,  recipe.id, recipe.cover_image)" style="height: 250px; object-fit: cover;">
                            <span x-text="recipe.name" class="card-title main-title">Adobong Manok</span> 
                        </div> 
                        <!-- END CARD IMAGE  -->

                        <!-- START CARD CONTENT -->
                        <div class="card-content">
                            <div class="row">
                                <div class="col s2">
                                    <img class="profile_picture" src="./imgs/cook_snap_secondary.jpg" alt="">
                                </div>
                                <div class="col s10">
                                    <span><strong x-text="recipe.expand.user.username">Joey Rapista</strong> </span>
                                    <p x-text='formatTimeSince(recipe.created)' class="grey-text" style="font-size: 12px;">1h ago</p> 
                                </div> 
                            </div>
                            <p x-text="recipe.description"></p>
                        </div>
                        <!-- END CARD CONTENT -->

                        <!-- START CARD ACTIONS -->
                        <div class="card-action" style="display: flex; justify-content: space-between;">
 
                            <a class="dropdown-trigger waves-effect waves-red btn-flat grey-text" x-bind:data-target="'card-options' + recipe.id"><i class="material-icons grey-text">more_vert</i></a> 
                                  
                            <a class="activator waves-effect waves-red btn-flat grey-text" style="font-size: 11px;"><i class="material-icons grey-text">chat</i>300</a>  
                            
                            <a class="waves-effect waves-red btn-flat grey-text" style="font-size: 11px;"><i class="material-icons red-text">favorite</i>50K</a> 
                            
                            <!-- Dropdown Structure -->
                            <ul x-bind:id="'card-options' + recipe.id" class="dropdown-content">  
                                <li x-show="recipe.user !== pb.authStore.model.id"><a class="grey-text">Report</a></li>
                                <li x-show="recipe.user === pb.authStore.model.id"><a class="grey-text">Edit</a></li>
                                <li x-show="recipe.user === pb.authStore.model.id"><a class="grey-text">Remove</a></li> 
                            </ul>
                            
                        </div>
                        <!-- END CARD ACTIONS -->

                        <!-- START CARD REVEAL -->
                        <div class="card-reveal"> 
                            <span class="card-title"> Comments <i class="material-icons right">close</i></span> 
                            <ul class="collection"> 
                            <template x-if="recipe.expand.hasOwnProperty('comments(recipe)')">
                                <template x-for="comm in recipe.expand['comments(recipe)']">
                                    <li class="collection-item">
                                        <p><strong x-text="comm.expand.user.username"></strong> <span x-text="formatTimeSince(comm.created)" class="grey-text" style="font-size: 11px;"></span></p>   
                                        <p x-text="comm.comment" class="comment-text">asdasd</p> 
                                    </li>
                                </template>
                            </template>
                            </ul>
                            <template x-if="!recipe.expand.hasOwnProperty('comments(recipe)')">
                                <p> No comments yet </p>
                            </template>
                        </div>
                        <!-- END CARD REVEAL -->

                    </div>        
                </div>  
                </template>  
            </template> 
            <div x-show="recipeIsLoading" class="progress red lighten-1">
                <div class="indeterminate"></div> 
            </div>  
            <!-- CARDS -->    
        </div>
        <template x-if="recipes">  
            <p x-show="recipes.page !== recipes.totalPages" class="center-align">
                <a x-on:click="fetchMoreRecipes" class="waves-effect waves-light btn red lighten-1" x-bind:class="recipeIsLoading ? 'disabled':''">Load more</a>  
            </p>
        </template> 
        `,
        favoriteCards: `
        <br/>
        <div class="row">  
        <!-- CARDS -->
            <template x-if="favorites">
                <template x-for="
                    favorite in favorites.items;
                    $nextTick(() => {   $('.dropdown-trigger').dropdown();  });
                    " :key="favorite.id">
                <div class="col s12 m6 l4">
                    <div class="card large">  
                        <!-- START CARD IMAGE  -->
                        <div class="card-image" style="cursor: pointer;">
                            <img x-bind:src="getImgUrl(favorite.collectionId,  favorite.id, favorite.cover_image)" style="height: 250px; object-fit: cover;">
                            <span x-text="favorite.name" class="card-title main-title">Adobong Manok</span> 
                        </div> 
                        <!-- END CARD IMAGE  -->

                        <!-- START CARD CONTENT -->
                        <div class="card-content">
                            <div class="row">
                                <div class="col s2">
                                    <img class="profile_picture" src="./imgs/cook_snap_secondary.jpg" alt="">
                                </div>
                                <div class="col s10">
                                    <span><strong x-text="favorite.expand.user.username">Joey Rapista</strong> </span>
                                    <p x-text='formatTimeSince(favorite.created)' class="grey-text" style="font-size: 12px;">1h ago</p> 
                                </div> 
                            </div>
                            <p x-text="favorite.description"></p>
                        </div>
                        <!-- END CARD CONTENT -->

                        <!-- START CARD ACTIONS -->
                        <div class="card-action" style="display: flex; justify-content: space-between;"> 
                            <a class="dropdown-trigger waves-effect waves-red btn-flat grey-text" x-bind:data-target="'card-options' + favorite.id"><i class="material-icons grey-text">more_vert</i></a> 
                            <a class="activator waves-effect waves-red btn-flat grey-text" style="font-size: 11px;"><i class="material-icons grey-text">chat</i>300</a>  
                            <a class="waves-effect waves-red btn-flat grey-text" style="font-size: 11px;"><i class="material-icons red-text">favorite</i>50K</a> 

                            <!-- Dropdown Structure -->
                            <ul x-bind:id="'card-options' + favorite.id" class="dropdown-content">  
                                <li x-show="favorite.user !== pb.authStore.model.id"><a class="grey-text">Report</a></li>
                                <li x-show="favorite.user === pb.authStore.model.id"><a class="grey-text">Edit</a></li>
                                <li x-show="favorite.user === pb.authStore.model.id"><a class="grey-text">Remove</a></li> 
                            </ul>
                        </div>
                        <!-- END CARD ACTIONS -->

                        <!-- START CARD REVEAL -->
                        <div class="card-reveal"> 
                            <span class="card-title"> Comments <i class="material-icons right">close</i></span> 
                            <ul class="collection"> 
                            <template x-if="favorite.expand.hasOwnProperty('comments(recipe)')">
                                <template x-for="comm in favorite.expand['comments(recipe)']">
                                    <li class="collection-item">
                                        <p><strong x-text="comm.expand.user.username"></strong> <span x-text="formatTimeSince(comm.created)" class="grey-text" style="font-size: 11px;"></span></p>   
                                        <p x-text="comm.comment" class="comment-text">asdasd</p> 
                                    </li>
                                </template>
                            </template>
                            </ul>
                            <template x-if="!favorite.expand.hasOwnProperty('comments(recipe)')">
                                <p> No comments yet </p>
                            </template>
                        </div>
                        <!-- END CARD REVEAL -->

                    </div>        
                </div>  
                </template>  
            </template> 
            <div x-show="favoriteIsLoading" class="progress red lighten-1">
                <div class="indeterminate"></div> 
            </div>  
        <!-- CARDS -->    
        </div>
        <template x-if="favorites">  
            <p x-show="favorites.page !== favorites.totalPages" class="center-align">
                <a x-on:click="fetchMoreFavorites" class="waves-effect waves-light btn red lighten-1" x-bind:class="favoriteIsLoading ? 'disabled':''">Load more</a>  
            </p>
        </template> 
        `,
        myRecipeCards: `
        <br/>
        <div class="row">  
        <!-- CARDS -->
            <template x-if="myRecipes">
                <template x-for="
                    myRecipe in myRecipes.items;
                    $nextTick(() => {   $('.dropdown-trigger').dropdown();  });
                    " :key="myRecipe.id">
                <div class="col s12 m6 l4">
                    <div class="card large">  
                        <!-- START CARD IMAGE  -->
                        <div class="card-image" style="cursor: pointer;">
                            <img x-bind:src="getImgUrl(myRecipe.collectionId,  myRecipe.id, myRecipe.cover_image)" style="height: 250px; object-fit: cover;">
                            <span x-text="myRecipe.name" class="card-title main-title">Adobong Manok</span> 
                        </div> 
                        <!-- END CARD IMAGE  -->

                        <!-- START CARD CONTENT -->
                        <div class="card-content">
                            <div class="row">
                                <div class="col s2">
                                    <img class="profile_picture" src="./imgs/cook_snap_secondary.jpg" alt="">
                                </div>
                                <div class="col s10">
                                    <span><strong x-text="myRecipe.expand.user.username">Joey Rapista</strong> </span>
                                    <p x-text='formatTimeSince(myRecipe.created)' class="grey-text" style="font-size: 12px;">1h ago</p> 
                                </div> 
                            </div>
                            <p x-text="myRecipe.description"></p>
                        </div>
                        <!-- END CARD CONTENT -->

                        <!-- START CARD ACTIONS -->
                        <div class="card-action" style="display: flex; justify-content: space-between;"> 
                            <a class="dropdown-trigger waves-effect waves-red btn-flat grey-text" x-bind:data-target="'card-options' + myRecipe.id"><i class="material-icons grey-text">more_vert</i></a> 
                            <a class="activator waves-effect waves-red btn-flat grey-text" style="font-size: 11px;"><i class="material-icons grey-text">chat</i>300</a>  
                            <a class="waves-effect waves-red btn-flat grey-text" style="font-size: 11px;"><i class="material-icons red-text">favorite</i>50K</a> 

                            <!-- Dropdown Structure -->
                            <ul x-bind:id="'card-options' + myRecipe.id" class="dropdown-content">  
                                <li x-show="myRecipe.user !== pb.authStore.model.id"><a class="grey-text">Report</a></li>
                                <li x-show="myRecipe.user === pb.authStore.model.id"><a class="grey-text">Edit</a></li>
                                <li x-show="myRecipe.user === pb.authStore.model.id"><a class="grey-text">Remove</a></li> 
                            </ul>
                        </div>
                        <!-- END CARD ACTIONS -->

                        <!-- START CARD REVEAL -->
                        <div class="card-reveal"> 
                            <span class="card-title"> Comments <i class="material-icons right">close</i></span> 
                            <ul class="collection"> 
                            <template x-if="myRecipe.expand.hasOwnProperty('comments(recipe)')">
                                <template x-for="comm in myRecipe.expand['comments(recipe)']">
                                    <li class="collection-item">
                                        <p><strong x-text="comm.expand.user.username"></strong> <span x-text="formatTimeSince(comm.created)" class="grey-text" style="font-size: 11px;"></span></p>   
                                        <p x-text="comm.comment" class="comment-text">asdasd</p> 
                                    </li>
                                </template>
                            </template>
                            </ul>
                            <template x-if="!myRecipe.expand.hasOwnProperty('comments(recipe)')">
                                <p> No comments yet </p>
                            </template>
                        </div>
                        <!-- END CARD REVEAL -->

                    </div>        
                </div>  
                </template>  
            </template> 
            <div x-show="myRecipeIsLoading" class="progress red lighten-1">
                <div class="indeterminate"></div> 
            </div>  
        <!-- CARDS -->    
        </div>
        <template x-if="myRecipes">  
            <p x-show="myRecipes.page !== myRecipes.totalPages" class="center-align">
                <a x-on:click="fetchMoreMyRecipes" class="waves-effect waves-light btn red lighten-1" x-bind:class="myRecipeIsLoading ? 'disabled':''">Load more</a>  
            </p>
        </template> 
        `
    }))
})

