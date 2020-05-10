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