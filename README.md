# Vue API
- CRUD Operation in vue api.
VueJs | Materialize


![vue-api](https://user-images.githubusercontent.com/33843231/81558483-9107f880-93af-11ea-8c11-bcf7e10d9b03.png)

## Command
- vue create vue-api <br>
- npm run serve <br>
- npm vue-router <br>
- npm install materialize-css@next <br>

## App.vue
```vue
<template>
  <div>
    <Navbar></Navbar>
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar';
import '../node_modules/materialize-css/dist/css/materialize.min.css';
import '../node_modules/materialize-css/dist/js/materialize.min.js';

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

```
## Home.vue
```vue
<template>
    <div>
        <div class="row">
            <div class="col s6">
                <PostForm @postCreated="addPost" :editingPost="editingPost"/>
            </div>

            <div class="col s3" style="margin: 50px;">
                <p>Limit Number of Posts</p>
                <input type="number" v-model="postLimit">
                <button @click="setLimit()" class="waves-effect waves-light btn">Set</button>
            </div>
        </div>

        <div class="row">
            <div class="col s6" v-for="(post, index) in posts"
                 v-bind:item="post"
                 :index="index"
                 :key="post.id"
                >

                <div class="card">
                    <div class="card-content">
                        <p class="card-title">{{ post.title }}</p>
                        <p class="timestamp">{{ post.createdAt | formatDate }}</p>
                        <p>{{ post.body }}</p>
                    </div>
                    <div class="card-action">
                        <a href="#" @click="editPost(post)">Edit</a>
                        <a href="#" class="delete-btn" @click="deletePost(post.id)">Delete</a>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
    import PostService from '../PostService';
    import PostForm from '../components/PostForm';

    const postService = new PostService();

    export default {
        name: "Home",

        components: {
            PostForm
        },

        data () {
            return {
                posts: [],
                postLimit: 5,
                editingPost: null,
            }
        },

        methods: {
            addPost(post) {
                if(this.posts.find(p => p.id === post.id)) {
                    const index = this.posts.findIndex(p => p.id === post.id);
                    this.posts.splice(index, 1, post);
                }
                else {
                    this.posts.unshift(post);
                }
            },

            editPost(post) {
                this.editingPost = post;
            },

            deletePost(id) {
                postService.deletePost(id)
                    .then(() => {
                        this.posts = this.posts.filter(p => p.id !== id);
                    })
                    .catch(err => console.log(err));
            },

            setLimit() {
                postService.getPosts(this.postLimit)
                    .then(res => this.posts = res.data)
                    .catch(err => console.log(err));
            }
        },

        created() {
            postService.getAllPosts()
                .then(res => {
                    this.posts = res.data;
                    console.log(this.posts);
                })
                .catch(err => console.error(err));
        },

        filters: {
            formatDate (date) {
                date = new Date(date);
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
            }
        }
    }
</script>

<style scoped>
    .card .card-content .card-title {
        margin-bottom: 0;
    }

    .card .card-content p.timestamp {
        color: #999;
        margin-bottom: 10px;
    }

    .delete-btn{
        color: red !important;
    }
</style>
```
## PostForm.vue
```vue
<template>
    <div>
        <form v-if="!loading"  class="form" v-on:submit.prevent="onSubmit">

            <div class="input-field">
                <label for="title">Title</label>
                <input type="text" name="title" v-model="title"
                       :class="[errors.title ? 'invalid' : 'validate']">
                <span class="helper-text" data-error="Title must not be empty"></span>
            </div>

            <div class="input-field">
                <label for="body">Body</label>
                <input type="text" name="body" v-model="body"
                       :class="[errors.body ? 'invalid' : 'validate']">
                <span class="helper-text" data-error="Body must not be empty"></span>
            </div>

            <button type="submit" class="btn waves-effect waves-light">
                {{ id ? 'Update' : 'Add'}}
            </button>

        </form>

        <div class="progress" v-else-if="loading">
            <div class="indeterminate"></div>
        </div>

    </div>
</template>

<script>
    import PostService from '../PostService';
    const postService = new PostService();

    export default {
        name: "PostForm",

        props: {
          editingPost: Object
        },

        data(){
            return {
                loading: false,
                title: '',
                body: '',
                id: null,
                errors: {},
            }
        },

        methods: {
            onSubmit () {
                this.loading = true;

                if( ! this.validForm() ) {
                    this.loading = false;
                    return;
                }

                const post = {
                    title: this.title,
                    body: this.body,
                    id: this.id,
                };

                postService.writePost(post)
                    .then(res => {
                        this.loading = false;
                        this.title = '';
                        this.body = '';
                        this.$emit('postCreated', res.data);
                        console.log(res.data);
                    })
                    .catch(err => console.error(err));
            },

            validForm(){
                this.errors = {};

                if(this.title.trim() === '') {
                    this.errors.title = 'Title';
                }

                if(this.body.trim() === '') {
                    this.errors.body = 'Body';
                }

                if(Object.keys(this.errors).length > 0) {
                    return false;
                }
                else {
                    return true;
                }

            }
        },
        watch: {
            editingPost(post) {
                this.title = post.title;
                this.body = post.body;
                this.id = post.id;
            }
        }

    }
</script>

<style scoped>
    form {
         margin: 50px;
    }

    .progress {
        margin: 100px 0;
    }
</style>
```
## PostService.js
```js
import axios from 'axios';

axios.defaults.baseURL = 'https://ndb99xkpdk.execute-api.eu-west-2.amazonaws.com/dev';

export default class PostService {

    getAllPosts () {
        return axios.get('/posts');
    }

    getPosts(number) {
        return axios.get(`/posts/${number}`);
    }

    writePost(post) {
        if(post.id) {
            return axios.put(`/post/${post.id}`, post);
        }
        else {
            return axios.post('/post', post);
        }
    }

    deletePost(id) {
        return axios.delete(`/post/${id}`);
    }
}
```
## main.js
```js
import Vue from 'vue'
import App from './App.vue'

import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

```
## router.js
```js
import Vue from 'vue';
import Router from 'vue-router';

import About from './views/About';
import Home from './views/Home';

Vue.use(Router);

export default new Router ({
    mode: 'history',

    routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
    ],

});
```

## Navbar.vue
```vue
<template>
    <nav>
        <div class="nav-wrapper">
            <div class="container">
                <router-link to="/" class="brand-logo">Logo</router-link>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><router-link to="/">Home</router-link></li>
                    <li><router-link to="/about">About</router-link></li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>

</script>
```
