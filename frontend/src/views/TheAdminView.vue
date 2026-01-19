<template>
  <div>
    <v-tabs v-model="activeTab" centered color="primary" class="mb-4">
      <v-spacer></v-spacer>

      <v-tab value="items">
        <v-icon start icon="mdi-package-variant-closed"></v-icon>
        Товари
      </v-tab>

      <v-tab value="category">
        <v-icon start icon="mdi-shape-plus"></v-icon>
        Категорії
      </v-tab>

      <v-tab value="material">
        <v-icon start icon="mdi-texture-box"></v-icon>
        Матеріали
      </v-tab>
      
      <v-tab value="technology">
        <v-icon start icon="mdi-lightning-bolt"></v-icon>
        Технології
      </v-tab>

      <v-spacer></v-spacer>
    </v-tabs>

    <v-container>
      <ItemChooseToUploadForm v-show="activeTab === 'items'" />
      <CategoryUploadForm v-show="activeTab === 'category'" />
      <MaterialUploadForm v-show="activeTab === 'material'" />
      <TechnologyUploadForm v-show="activeTab === 'technology'" />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ItemChooseToUploadForm from '@/components/ItemChooseToUploadForm.vue';
import CategoryUploadForm from '@/components/CategoryUploadForm.vue';
import MaterialUploadForm from '@/components/MaterialUploadForm.vue';
import TechnologyUploadForm from '@/components/TechnologyUploadForm.vue';

const activeTab = ref('items');
</script>