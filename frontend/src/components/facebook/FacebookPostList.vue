<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-facebook"></v-icon> &nbsp;
          Facebook пости
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus-circle"
          to="/admin/facebook-posts/add"
        >
          Додати пост
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-data-table
        :headers="headers"
        :items="posts"
        :loading="isLoading"
        loading-text="Завантаження постів..."
        no-data-text="Постів не знайдено."
        items-per-page="10"
        class="clickable-rows"
        @click:row="(_: any, { item }: { item: IFacebookPost }) => handleRowClick(item)"
      >
        <template v-slot:item.preview="{ item }">
          <div class="post-preview">
            <v-img
              v-if="getPostPreview(item).thumbnailUrl"
              :src="getPostPreview(item).thumbnailUrl"
              width="72"
              height="72"
              cover
              class="preview-image"
              @click.stop
            />
            <div
              v-else
              class="preview-image preview-image--placeholder d-flex align-center justify-center"
              @click.stop
            >
              <v-icon size="24">mdi-image-off</v-icon>
            </div>

            <a
              :href="getPostPreview(item).postUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="post-link"
              @click.stop
            >
              {{ getPostPreview(item).linkText }}
            </a>
          </div>
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleDateString('uk-UA') }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            variant="text"
            size="small"
            color="grey-darken-1"
            @click.stop="handleRowClick(item)"
          ><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn
            variant="text"
            size="small"
            color="red-lighten-1"
            @click.stop="promptDelete(item)"
          ><v-icon>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <ConfirmDeleteDialog
      v-model="isDeleteDialogOpen"
      :item-name="postToDelete?.title || 'Facebook пост'"
      item-type-name="пост"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { isAxiosError } from 'axios';
import { useFacebookPostsStore } from '@/stores/facebookPosts';
import mainApi from '@/api/main.api';
import type { IFacebookPost } from '@/interfaces';
import ConfirmDeleteDialog from '../shared/ConfirmDeleteForm.vue';

const router = useRouter();
const fbStore = useFacebookPostsStore();
const { posts } = storeToRefs(fbStore);
const isLoading = ref(true);

const fetchData = async () => {
  isLoading.value = true;
  await fbStore.fetchPosts();
  isLoading.value = false;
};

onMounted(fetchData);
onActivated(fetchData);

const headers = ref([
  { title: 'Назва', align: 'start' as const, key: 'title', sortable: true },
  { title: 'Пост', align: 'start' as const, key: 'preview', sortable: false },
  { title: 'Позиція', align: 'center' as const, key: 'position', sortable: true },
  { title: 'Дата', align: 'center' as const, key: 'created_at', sortable: true },
  { title: 'Дії', align: 'end' as const, key: 'actions', sortable: false },
]);

type ParsedPostPreview = {
  thumbnailUrl: string;
  postUrl: string;
  linkText: string;
};

const postPreviewCache = new Map<string, ParsedPostPreview>();

function extractFacebookPostUrl(embedHtml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(embedHtml, 'text/html');

    const iframe = doc.querySelector('iframe[src]');
    if (iframe) {
      const iframeSrc = iframe.getAttribute('src') || '';
      const iframeUrl = new URL(iframeSrc);
      const hrefParam = iframeUrl.searchParams.get('href');
      if (hrefParam) {
        return decodeURIComponent(hrefParam);
      }
    }

    const links = Array.from(doc.querySelectorAll('a[href]'));
    const fbLink = links
      .map(link => link.getAttribute('href') || '')
      .find(url => url.includes('facebook.com') && !url.includes('/plugins/'));

    return fbLink || '#';
  } catch {
    return '#';
  }
}

function extractFirstImageUrl(embedHtml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(embedHtml, 'text/html');
    const firstImg = doc.querySelector('img[src]');
    return firstImg?.getAttribute('src') || '';
  } catch {
    return '';
  }
}

function getPostPreview(item: IFacebookPost): ParsedPostPreview {
  const cacheKey = `${item.id}:${item.updated_at}`;
  const cached = postPreviewCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const parsed: ParsedPostPreview = {
    thumbnailUrl: extractFirstImageUrl(item.embed_html),
    postUrl: extractFacebookPostUrl(item.embed_html),
    linkText: item.title?.trim() || 'Перейти до поста',
  };

  postPreviewCache.set(cacheKey, parsed);
  return parsed;
}

const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const postToDelete = ref<IFacebookPost | null>(null);

function handleRowClick(item: IFacebookPost) {
  router.push(`/admin/facebook-posts/${item.id}`);
}

function promptDelete(item: IFacebookPost) {
  postToDelete.value = item;
  isDeleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!postToDelete.value) return;

  isDeleting.value = true;

  try {
    await mainApi.deleteFacebookPost(postToDelete.value.id);
    fbStore.removePost(postToDelete.value.id);
  } catch (err) {
    const message = isAxiosError(err)
      ? (err.response?.data?.message ?? err.message)
      : (err as Error)?.message ?? String(err);
    console.error(`Помилка: ${message}`);
  } finally {
    isDeleting.value = false;
    isDeleteDialogOpen.value = false;
    postToDelete.value = null;
  }
}
</script>

<style scoped>
.clickable-rows :deep(tbody tr) {
  cursor: pointer;
}

.post-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 240px;
}

.preview-image {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}

.preview-image--placeholder {
  width: 72px;
  height: 72px;
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.38);
}

.post-link {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}

.post-link:hover {
  text-decoration: underline;
}
</style>
