import Vue from 'vue'
import VueRouter from 'vue-router'
const login = () => import("../views/login")
const Home = () => import("../views/home")

Vue.use(VueRouter)

const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes,
  mode: "history"
})

router.beforeEach((to, from, next) => {
  //如果用户访问的是登录页，直接放行
  if (to.path === '/login') return next()
  //从sessionStorage获取保存的token值
  const tokenStr = sessionStorage.getItem('token');
  //没有token强制跳转至login
  if (!tokenStr) return next('/login')
  next()
})

export default router
