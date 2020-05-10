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