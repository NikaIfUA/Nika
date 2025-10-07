<template>
  <form @submit.prevent="onSubmit" class="register-form">
    <div>
      <label for="name">Name</label>
      <input id="name" v-model="name" type="text" required />
    </div>
    <div>
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" required />
    </div>
    <div>
      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" required minlength="6" :disabled="loading" />
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <button type="submit" :disabled="loading">{{ loading ? 'Registering...' : 'Register' }}</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['register'])
const props = defineProps({ loading: { type: Boolean, default: false }, error: { type: String, default: '' } })
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

const onSubmit = () => {
  error.value = ''
  if (!name.value || !email.value || !password.value) {
    error.value = 'Please fill all fields'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  emit('register', { name: name.value, email: email.value, password: password.value })
}
</script>

<style scoped>
.error{color:var(--danger, #d9534f);margin:8px 0}
form{display:flex;flex-direction:column;gap:12px}
label{font-size:0.9rem}
input{padding:8px;border:1px solid #ccc;border-radius:4px}
button{padding:8px 12px;border:none;background:#2e7d32;color:white;border-radius:4px}
</style>
