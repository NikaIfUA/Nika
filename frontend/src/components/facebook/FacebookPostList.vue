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
        <template v-slot:item.embed_html="{ item }">
          <span class="text-truncate d-inline-block" style="max-width: 300px;">
            {{ item.embed_html.substring(0, 80) }}...
          </span>
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
  { title: 'Embed код', align: 'start' as const, key: 'embed_html', sortable: false },
  { title: 'Позиція', align: 'center' as const, key: 'position', sortable: true },
  { title: 'Дата', align: 'center' as const, key: 'created_at', sortable: true },
  { title: 'Дії', align: 'end' as const, key: 'actions', sortable: false },
]);

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
</style>
