<template>
  <RouterLink to="/admin">Go back</RouterLink>
  <div>
    <h2>Add Materials</h2>
    <form @submit.prevent="onSubmit">
      <BaseInput input="text" v-model="name" placeholder="Enter material name" />
      <button type="submit">Create</button>
      <p v-if="message">{{ message }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { API_URL } from '@/env';
import BaseInput from '@/components/BaseInput.vue';

const name = ref('');
const message = ref('');

async function onSubmit() {
  try {
    const res = await fetch(`${API_URL}/create-material`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value })
    });
    if (res.ok) {
      message.value = 'Material created';
      name.value = '';
    } else {
      const j = await res.json().catch(() => ({}));
      message.value = j?.error || 'Failed';
    }
  } catch (e) {
    console.error(e);
    message.value = 'Error';
  }
}
</script>
