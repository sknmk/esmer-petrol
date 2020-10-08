import VueRouter from "vue-router"
import Login from "../views/Login/Login.vue"


const router = new VueRouter({
    routes: [
        {path: "/", component: Login},
        {path: "", component: Login},
        {path: "/Login", component: Login},
    ]
})

export default router
