import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import("../views/Login")
const Home = () => import("../views/Home")
const welcome = () => import("../components/WelCome")
const users = () => import("../components/user/user")

Vue.use(VueRouter)

const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: welcome },
      { path: '/users', component: users }
    ]
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
