<template>
  <v-card class="contact-form-card" elevation="2">
    <v-card-title class="text-h5 text-center pa-4">
      Зв'яжіться з нами
    </v-card-title>

    <v-card-text>
      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="formData.email"
          label="Ваш Email *"
          type="email"
          :rules="emailRules"
          variant="outlined"
          prepend-inner-icon="mdi-email"
          required
          class="mb-3"
        ></v-text-field>

        <v-text-field
          v-model="formData.subject"
          label="Тема повідомлення *"
          :rules="subjectRules"
          variant="outlined"
          prepend-inner-icon="mdi-format-title"
          required
          class="mb-3"
        ></v-text-field>

        <v-select
          v-model="formData.source"
          label="Звідки дізнались про нас?"
          :items="sourceOptions"
          variant="outlined"
          prepend-inner-icon="mdi-information"
          class="mb-3"
        ></v-select>

        <v-textarea
          v-model="formData.description"
          label="Ваше повідомлення *"
          :rules="descriptionRules"
          variant="outlined"
          prepend-inner-icon="mdi-message-text"
          rows="5"
          required
          class="mb-3"
        ></v-textarea>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-3"
        >
          {{ successMessage }}
        </v-alert>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-3"
        >
          {{ errorMessage }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          :loading="isSending"
          :disabled="!isFormValid || isSending"
        >
          <v-icon left class="mr-2">mdi-send</v-icon>
          Відправити
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { isAxiosError } from 'axios';
import mainApi from '@/api/main.api';
import { generateEmailHTML, generateEmailText } from '@/utils/emailTemplate';

const formRef = ref<any>(null);
const isFormValid = ref(false);
const isSending = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const formData = reactive({
  email: '',
  subject: '',
  source: '',
  description: '',
});

const sourceOptions = [
  'Google / Пошук',
  'Соціальні мережі',
  'Рекомендація друзів',
  'Реклама',
  'Інше',
];

const emailRules = [
  (v: string) => !!v || 'Email обов\'язковий',
  (v: string) => /.+@.+\..+/.test(v) || 'Email має бути коректним',
];

const subjectRules = [
  (v: string) => !!v || 'Тема обов\'язкова',
  (v: string) => v.length >= 3 || 'Тема має містити мінімум 3 символи',
  (v: string) => v.length <= 100 || 'Тема має містити максимум 100 символів',
];

const descriptionRules = [
  (v: string) => !!v || 'Повідомлення обов\'язкове',
  (v: string) => v.length >= 10 || 'Повідомлення має містити мінімум 10 символів',
  (v: string) => v.length <= 1000 || 'Повідомлення має містити максимум 1000 символів',
];

async function handleSubmit() {
  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isSending.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    // Генеруємо HTML та текстову версію email на frontend
    const htmlContent = generateEmailHTML(formData);
    const textContent = generateEmailText(formData);
    
    await mainApi.sendContactMessage({
      email: formData.email,
      subject: formData.subject,
      source: formData.source,
      description: formData.description,
      html: htmlContent,
      text: textContent,
    } as any);
    
    successMessage.value = 'Ваше повідомлення успішно відправлено! Ми зв\'яжемося з вами найближчим часом.';
    
    // Очищаємо форму
    formData.email = '';
    formData.subject = '';
    formData.source = '';
    formData.description = '';
    formRef.value.reset();
    
    // Прокручуємо до повідомлення про успіх
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.error ?? err.message)
      : (err as Error)?.message ?? String(err);
    errorMessage.value = `Помилка: ${message}`;
  } finally {
    isSending.value = false;
  }
}
</script>

<style scoped>
.contact-form-card {
  max-width: 600px;
  margin: 0 auto;
}
</style>
