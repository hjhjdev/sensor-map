import Vue from 'vue'
import VueRouter from 'vue-router'
import VueCookies from 'vue-cookies'
import decode from 'jwt-decode'
import axios from 'axios'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "main-app" */'../views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "main-app" */ '../views/Admin.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import( '../views/Login.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  // global axios setting
  axios.defaults.withCredentials = true;
  let user = VueCookies.get('user');
  let isAlive = false;

  // check logged in
  if (user)
    isAlive = Date.now() < new Date(decode(user).exp * 1000) ? true : false;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // requires auth and not logged in
    // redirect to login
    if (!isAlive) {
      next('login');
    // requires auth and logged in; pass
    } else {
      next();
    }
    // redirect to / if user visits login page
    // and already logged in
  } else {
    if (isAlive && to.name === "Login") {
      next({
        path: '/'
      });
    } else {
      next();
    }
  }

  /*
  if (to.path === '/login') {
    // pass checking
    next();
  } else {
    // check token is valid
    if (VueCookies.get('user')) {
      // check token expiration
      let exp = new Date(decode(VueCookies.get('user')).exp * 1000);
      if (Date.now() < exp) {
        // token not expired
        next();
      } else {
        // token expired. redirect to login
        next('login');
        alert("로그인 시간이 만료 되었습니다.");
      }
    } else {
      // token doesn't exists. redirect to login
      
    }
  }
  */
})

export default router
