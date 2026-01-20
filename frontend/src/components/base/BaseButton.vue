<template>
  <button
    :type="type"
    :class="['base-button', { disabled }]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['click']);
</script>

<style scoped>
.base-button {
  width: 150px;
  padding: 0.5em 1.2em;
  border: none;
  border-radius: 4px;
  background: #1976d2;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.base-button:hover:not(.disabled) {
  background: #1565c0;
}
.base-button.disabled,
.base-button:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}
</style>