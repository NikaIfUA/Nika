<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="onCancel"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title class="headline">{{ title }}</v-card-title>
      <v-card-text>
        Ви впевнені, що хочете видалити {{ itemTypeName }}
        <strong>"{{ itemName }}"</strong>? Цю дію не можна скасувати.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="onCancel" :disabled="loading">Скасувати</v-btn>
        <v-btn
          color="red darken-1"
          text
          @click="onConfirm"
          :loading="loading"
        >
          Видалити
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">

defineProps({
  modelValue: { type: Boolean, default: false },
  itemName: { type: String, required: true },
  itemTypeName: { type: String, default: 'елемент' },
  title: { type: String, default: 'Підтвердження видалення' },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

function onCancel() {
  emit('update:modelValue', false);
}

function onConfirm() {
  emit('confirm');
}
</script>