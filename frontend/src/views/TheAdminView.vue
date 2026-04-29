<template>
  <div>
    <v-tabs v-model="activeTab" centered color="primary" class="mb-4">
      <v-spacer></v-spacer>

      <v-tab value="items" to="/admin/items">
        <v-icon start icon="mdi-package-variant-closed"></v-icon>
        Товари
      </v-tab>

      <v-tab value="category" to="/admin/categories">
        <v-icon start icon="mdi-shape-plus"></v-icon>
        Категорії
      </v-tab>

      <v-tab value="material" to="/admin/materials">
        <v-icon start icon="mdi-texture-box"></v-icon>
        Матеріали
      </v-tab>
      
      <v-tab value="technology" to="/admin/technologies">
        <v-icon start icon="mdi-lightning-bolt"></v-icon>
        Технології
      </v-tab>

      <v-tab value="facebook" to="/admin/facebook-posts">
        <v-icon start icon="mdi-facebook"></v-icon>
        Facebook
      </v-tab>

      <v-spacer></v-spacer>
    </v-tabs>

    <v-container>
      <router-view />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('items');

// Оновлюємо активну табу залежно від поточного маршруту
watch(() => route.path, () => {
  if (route.path.includes('materials')) activeTab.value = 'material';
  else if (route.path.includes('categories')) activeTab.value = 'category';
  else if (route.path.includes('technologies')) activeTab.value = 'technology';
  else if (route.path.includes('facebook')) activeTab.value = 'facebook';
  else if (route.path.includes('items')) activeTab.value = 'items';
  else activeTab.value = 'items';
}, { immediate: true });
</script>