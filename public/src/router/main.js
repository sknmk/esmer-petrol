import VueRouter from "vue-router"
import Login from "../views/Login.vue"
import Dashboard from "../views/Dashboard.vue"


const router = new VueRouter({
    routes: [
        {path: "/", component: Login},
        {path: "", component: Login},
        {path: "/Login", component: Login},
        {path: "/Dashboard", component: Dashboard},
    ]
})

export default router
