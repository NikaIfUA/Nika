<template>
  <div class="home-page">
    <div class="header">
      <h1>З увагою до деталей</h1>
      <h3>Майстерня реклами NIKA</h3>
    </div>

    <v-row class="home-content">
      <!-- Main content column -->
      <v-col cols="12" md="8">
        <!-- Gallery Section -->
        <section class="gallery-section">
          <h2 class="section-title">Наші кращі проєкти</h2>

          <div v-if="itemsLoading">
            <p>Завантаження...</p>
          </div>

          <div v-else-if="itemsError">
            <p>Виникла помилка: {{ itemsError }}</p>
          </div>

          <div v-else class="gallery-wrapper">
            <GalleryForm :items="items" @item-click="openModal" />
          </div>

          <div class="gallery-footer">
            <v-btn variant="text" color="primary" :to="{ name: 'shop' }">
              Дивитись всі →
            </v-btn>
          </div>
        </section>

        <!-- About Section -->
        <section class="about-section">
          <v-card variant="outlined">
            <v-card-title class="text-h6">Про нас</v-card-title>
            <v-card-text>
              <p>
                Майстерня реклами NIKA — це команда професіоналів, яка спеціалізується
                на виготовленні рекламної продукції з увагою до кожної деталі. Ми працюємо
                з різноманітними матеріалами та використовуємо сучасні технології,
                щоб створювати якісну рекламу для вашого бізнесу.
              </p>
              <v-btn
                variant="text"
                color="primary"
                :to="{ name: 'contacts' }"
                class="mt-2"
              >
                Детальніше →
              </v-btn>
            </v-card-text>
          </v-card>
        </section>

        <!-- Quick Links Section -->
        <section class="quick-links-section">
          <HomeQuickLinks />
        </section>
      </v-col>

      <!-- Sidebar column -->
      <v-col cols="12" md="4">
        <HomeBlogSidebar />
      </v-col>
    </v-row>

    <ImageDetailsModal v-if="selectedItemId" :itemId="selectedItemId" @close="closeModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import type { IItem } from '../interfaces';
import { useItemsStore } from '@/stores';
import ImageDetailsModal from '@/components/gallery/ImageDetailsModal.vue';
import GalleryForm from '@/components/gallery/GalleryForm.vue';
import HomeQuickLinks from '@/components/shared/HomeQuickLinks.vue';
import HomeBlogSidebar from '@/components/shared/HomeBlogSidebar.vue';

const itemsStore = useItemsStore();
const { portfolioItems: items, imageUrls, itemsLoading, itemsError } = storeToRefs(itemsStore);

const selectedItemId = ref<string | null>(null);

onMounted(() => {
  itemsStore.fetchItems();
});

function openModal(item: IItem) {
  selectedItemId.value = item.id;
}

function closeModal() {
  selectedItemId.value = null;
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.header h1,
.header h3 {
  text-align: center;
  margin: 0;
}

.section-title {
  margin-bottom: 1rem;
}

.gallery-section {
  margin-bottom: 2rem;
}

.gallery-wrapper {
  max-height: 50vh;
  overflow: hidden;
  position: relative;
}

.gallery-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, white);
  pointer-events: none;
}

.gallery-footer {
  text-align: center;
  margin-top: 0.5rem;
}

.about-section {
  margin-bottom: 2rem;
}

.quick-links-section {
  margin-bottom: 2rem;
}
</style>