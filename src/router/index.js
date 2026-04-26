import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/Home.vue'
import Academic from '../views/Academic.vue'
import Dorms from '../views/Dorms.vue'
import Storage from '../views/Storage.vue'
import Auth from '../views/Auth.vue'

const routes = [
    { path: '/', component: Home },
    {path: '/Academic', component: Academic},
    {path: '/Dorms', component: Dorms},
    {path: '/Storage', component: Storage},
    {path: '/Auth', component: Auth}
]

export default createRouter({
    history: createWebHistory(),
    routes,
})