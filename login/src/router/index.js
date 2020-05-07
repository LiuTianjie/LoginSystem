import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
    meta: { isPublic: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
    meta: { isPublic: true }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import(/* webpackChunkName: "about" */ '../views/SignUp.vue'),
    meta: { isPublic: true }
  },
  {
    path: '/index:id',
    name: 'index',
    component: () => import(/* webpackChunkName: "about" */ '../views/index.vue'),
    meta: { isPublic: false }
  },
  {
    path: '*',
    name: 'notfound',
    component: () => import(/* webpackChunkName: "about" */ '../views/notfound.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
//全局导航守卫
router.beforeEach((to, from, next) => {
  if (!to.meta.isPublic && !localStorage.token) {
    Vue.prototype.$message({
      type: "warning",
      message: "请先登录"
    });
    next('/login')
  }
  next()
})
export default router
