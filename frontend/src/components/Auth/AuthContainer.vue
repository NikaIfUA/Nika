<template>
  <div class="auth-container">
    <div class="tabs">
      <button :class="{ active: active === 'login' }" @click="active = 'login'">Login</button>
      <button :class="{ active: active === 'register' }" @click="active = 'register'">Register</button>
    </div>

    <div class="panel">
      <div v-if="active === 'login'">
        <slot />
      </div>
      <div v-else>
        <slot name="register" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const active = ref('login')
</script>

<style scoped>
.auth-container{
  display:flex;
  flex-direction:column;
  gap:16px;
  align-items:center;
}
.tabs{display:flex;gap:8px}
.tabs button{padding:8px 12px;border:1px solid #ccc;background:white;border-radius:6px;cursor:pointer}
.tabs button.active{background:#1976d2;color:white;border-color:#135ba1}
.panel{width:100%;max-width:480px}
</style>
