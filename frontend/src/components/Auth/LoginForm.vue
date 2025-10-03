<template>
  <form @submit.prevent="onSubmit" class="login-form">
    <div>
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" required />
    </div>
    <div>
      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" required :disabled="loading" />
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <button type="submit" :disabled="loading">{{ loading ? 'Logging...' : 'Login' }}</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['login'])
const props = defineProps({ loading: { type: Boolean, default: false }, error: { type: String, default: '' } })
const email = ref('')
const password = ref('')
const error = ref('')

const onSubmit = () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Please fill all fields'
    return
  }
  emit('login', { email: email.value, password: password.value })
}
</script>

<style scoped>
.error{color:var(--danger, #d9534f);margin:8px 0}
form{display:flex;flex-direction:column;gap:12px}
label{font-size:0.9rem}
input{padding:8px;border:1px solid #ccc;border-radius:4px}
button{padding:8px 12px;border:none;background:#1976d2;color:white;border-radius:4px}
</style>
