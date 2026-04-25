<template>
    <div>
        <nav>
            <div class="nav-brand">
                <img src="../assets/newpaltz_logo_dark.jpg" alt="Logo" width="50" height="50" class="nav-logo">
            </div>

            <div class="nav-links">
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/Academic">Academic Buildings</RouterLink>
                <RouterLink to="/Dorms">Dormitories</RouterLink>
                <RouterLink to="/Storage">Storage</RouterLink>
            </div>
        </nav>
    </div>
</template>

<script setup>
</script>

<style scoped>
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 35px 20px;
    background-color: #012242;
}
.nav-links a {
    color: white;
    text-decoration: none;
    margin-left: 20px;
    font-size: 1.2rem;
}
.nav-logo {
 width: auto;
 height: 70px;
 }
</style>