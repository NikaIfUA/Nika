<template>
  <v-card class="blog-sidebar" variant="outlined">
    <v-card-title class="text-h6">Блог</v-card-title>
    <v-card-text>
      <!-- Saved Facebook post embeds from admin -->
      <div v-if="posts.length" class="fb-posts-list">
        <div
          v-for="post in posts"
          :key="post.id"
          class="fb-post-embed mb-4"
        >
          <div v-if="post.title" class="text-subtitle-2 mb-1">{{ post.title }}</div>
          <div v-html="post.embed_html" class="fb-embed-content"></div>
        </div>
      </div>

      <!-- Fallback: page plugin when no posts saved -->
      <div v-else class="fb-embed-container">
        <iframe
          :src="fbEmbedUrl"
          width="100%"
          :height="height"
          style="border: none; overflow: hidden"
          scrolling="no"
          frameborder="0"
          allowfullscreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        ></iframe>
      </div>

      <div class="fb-fallback">
        <v-btn
          :href="fbPageUrl"
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
          color="primary"
          prepend-icon="mdi-facebook"
        >
          Слідкуйте за нами на Facebook
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useFacebookPostsStore } from '@/stores/facebookPosts';

const props = withDefaults(defineProps<{
  pageUrl?: string;
  height?: number;
}>(), {
  pageUrl: 'https://www.facebook.com/profile.php?id=100063669091798',
  height: 500,
});

const fbStore = useFacebookPostsStore();
const { posts } = storeToRefs(fbStore);

onMounted(() => {
  fbStore.fetchPosts();
});

const fbPageUrl = computed(() => props.pageUrl);

const fbEmbedUrl = computed(() => {
  const encodedUrl = encodeURIComponent(props.pageUrl);
  return `https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=340&height=${props.height}&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`;
});
</script>

<style scoped>
.blog-sidebar {
  position: sticky;
  top: 1rem;
}

.fb-embed-container {
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.fb-embed-container iframe {
  display: block;
}

.fb-embed-content :deep(iframe) {
  max-width: 100%;
  max-height: 300px;
  border: none;
}

.fb-post-embed {
  max-height: 320px;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 8px;
}

.fb-fallback {
  margin-top: 0.5rem;
  text-align: center;
}
</style>
