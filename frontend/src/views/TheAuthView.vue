<template>
  <div class="auth-view">
    <AuthContainer>
      <template #default>
          <LoginForm @login="handleLogin" :loading="loading" :error="auth.error" />
      </template>
      <template #register>
          <RegisterForm @register="handleRegister" :loading="loading" :error="auth.error" />
      </template>
    </AuthContainer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthContainer from '@/components/Auth/AuthContainer.vue'
import LoginForm from '@/components/Auth/LoginForm.vue'
import RegisterForm from '@/components/Auth/RegisterForm.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)

const handleLogin = async (credentials) => {
  loading.value = true
  try {
    await auth.login(credentials)
    // on success, redirect to admin or home
    router.push({ name: 'TheAdminView' }).catch(() => {})
  } catch (err) {
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

const handleRegister = async (userInfo) => {
  loading.value = true
  try {
    await auth.register(userInfo)
    router.push({ name: 'TheAdminView' }).catch(() => {})
  } catch (err) {
    console.error('Registration error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>