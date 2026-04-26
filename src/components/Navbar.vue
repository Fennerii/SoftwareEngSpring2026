<template>
    <div>
        <nav>
            <div class="nav-brand">
                <img src="../assets/newpaltz_logo_dark.jpg" alt="Logo" width="50" height="50" class="nav-logo">
            </div>

            <div class="nav-links">
                <RouterLink to="/">Home</RouterLink>
                <a @click="goProtected('/Academic')">Academic Buildings</a>
                <a @click="goProtected('/Dorms')">Dormitories</a>
                <a @click="goProtected('/Storage')">Storage</a>

                <span v-if="username" class="user">
                    Logged in as <b>{{ username }}</b>
                </span>

                <button v-if="username" @click="logout" class="logout-btn">
                    Logout
                </button>

                <RouterLink v-else to="/Auth">Login</RouterLink>
            </div>
        </nav>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref(null)

onMounted(() => {
    username.value = localStorage.getItem("username")
})

function logout() {
    localStorage.removeItem("user_id")
    localStorage.removeItem("username")
    window.location.href = "/"
}

function goProtected(path) {
    const user = localStorage.getItem("user_id")

    if (!user) {
        router.push('/Auth')
    } else {
        router.push(path)
    }
}
</script>
