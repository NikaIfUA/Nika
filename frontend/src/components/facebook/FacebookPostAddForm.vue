<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-btn icon variant="text" to="/admin/facebook-posts" class="me-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon icon="mdi-facebook"></v-icon> &nbsp;
        {{ isEditing ? 'Редагування Facebook поста' : 'Додати Facebook пост' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="postTitle"
              label="Назва (необов'язково)"
              variant="outlined"
              placeholder="Наприклад: Наш новий проєкт"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="embedHtml"
              label="Embed HTML код з Facebook"
              placeholder='Вставте HTML код (iframe), отриманий через "Вставити" (Embed) у Facebook...'
              variant="outlined"
              rows="6"
              :rules="[v => !!v?.trim() || 'Embed код є обов\'язковим']"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="postPosition"
              label="Позиція (порядок)"
              variant="outlined"
              type="number"
              min="0"
            />
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <!-- Preview -->
        <div v-if="sanitizedHtml" class="mb-4">
          <h4 class="mb-2">Попередній перегляд:</h4>
          <v-card variant="outlined" class="pa-4">
            <div v-html="sanitizedHtml" class="fb-preview"></div>
          </v-card>
        </div>

        <v-alert type="info" variant="tonal" class="mb-4">
          <strong>Як отримати embed код:</strong>
          <ol class="mt-2">
            <li>Відкрийте публічний пост у Facebook</li>
            <li>Натисніть ... → "Вставити" (Embed)</li>
            <li>Скопіюйте згенерований HTML код</li>
            <li>Вставте його у поле вище</li>
          </ol>
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          closable
          class="mt-4"
          :text="successMessage"
          @update:modelValue="successMessage = ''"
        />
        <v-alert
          v-if="errorMessage"
          type="error"
          closable
          class="mt-4"
          :text="errorMessage"
          @update:modelValue="errorMessage = ''"
        />

        <v-card-actions class="pa-0 mt-6">
          <v-spacer />
          <v-btn @click="cancel" color="primary" variant="text">
            Скасувати
          </v-btn>
          <v-btn
            :loading="isSaving"
            :disabled="isSaving"
            @click="save"
            :color="isEditing ? 'success' : 'primary'"
            variant="flat"
            :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus-circle'"
          >
            {{ isEditing ? 'Оновити' : 'Додати' }}
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { isAxiosError } from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { useFacebookPostsStore } from '@/stores/facebookPosts';
import mainApi from '@/api/main.api';
import type { IFacebookPost } from '@/interfaces';

const router = useRouter();
const route = useRoute();
const fbStore = useFacebookPostsStore();

const postTitle = ref('');
const embedHtml = ref('');
const postPosition = ref(0);
const isSaving = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const isEditing = computed(() => !!route.params.id);

// Only allow iframe-based embeds from facebook.com for safety
const sanitizedHtml = computed(() => {
  const html = embedHtml.value.trim();
  if (!html) return '';

  // Allow Facebook iframe embeds and FB SDK div+script embeds
  const iframeFbRegex = /<iframe[^>]+src=["']https:\/\/www\.facebook\.com\/plugins\/[^"']+["'][^>]*>[\s\S]*?<\/iframe>/gi;
  const divFbRegex = /<div[^>]+class=["'][^"']*fb-post[^"']*["'][^>]*>[\s\S]*?<\/div>/gi;
  const scriptFbRegex = /<script[^>]+src=["']https:\/\/connect\.facebook\.net\/[^"']+["'][^>]*>[\s\S]*?<\/script>/gi;

  const iframes = html.match(iframeFbRegex) || [];
  const divs = html.match(divFbRegex) || [];
  const scripts = html.match(scriptFbRegex) || [];

  const safe = [...iframes, ...divs, ...scripts].join('\n');
  return safe || html;
});

onMounted(async () => {
  if (route.params.id) {
    if (fbStore.posts.length === 0) {
      await fbStore.fetchPosts();
    }
    const post = fbStore.posts.find(p => p.id === route.params.id);
    if (post) {
      postTitle.value = post.title || '';
      embedHtml.value = post.embed_html;
      postPosition.value = post.position;
    }
  }
});

async function save() {
  if (!embedHtml.value.trim()) {
    errorMessage.value = 'Embed HTML код є обов\'язковим.';
    successMessage.value = '';
    return;
  }

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    if (isEditing.value && route.params.id) {
      const response = await mainApi.updateFacebookPost(route.params.id as string, {
        title: postTitle.value.trim() || undefined,
        embed_html: embedHtml.value.trim(),
        position: postPosition.value,
      });
      fbStore.updatePost(response.data);
      successMessage.value = 'Пост успішно оновлено!';
    } else {
      const response = await mainApi.saveFacebookPost({
        title: postTitle.value.trim() || undefined,
        embed_html: embedHtml.value.trim(),
        position: postPosition.value,
      });
      fbStore.addPost(response.data);
      successMessage.value = 'Пост успішно додано!';
    }
    setTimeout(() => {
      router.push('/admin/facebook-posts');
    }, 1500);
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    errorMessage.value = `Помилка: ${message}`;
  } finally {
    isSaving.value = false;
  }
}

function cancel() {
  router.push('/admin/facebook-posts');
}
</script>

<style scoped>
.fb-preview :deep(iframe) {
  max-width: 100%;
  border: none;
}
</style>
