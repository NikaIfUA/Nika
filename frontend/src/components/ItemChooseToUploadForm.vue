<template>
  <v-card>
    <v-card-title>
      Items
    </v-card-title>

    <v-card-text>
      <v-row align="center" justify="center" v-if="loading">
        <v-progress-circular indeterminate color="primary" />
      </v-row>

      <v-alert v-if="errorMessage" type="error" dense>
        {{ errorMessage }}
      </v-alert>

      <div v-if="!loading && !errorMessage && localItems.length === 0" class="pa-4">
        No items found.
      </div>

      <div v-else>
        <!-- DataTables.net Vue3 wrapper -->
        <DataTable :columns="dtColumns" :data="dtData" :options="dtOptions" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { API_URL } from '@/env'
import placeholderImg from '@/assets/logo.png'
// datatables wrapper and styles (ESM entry + correct CSS filename)
import DataTable from 'datatables.net-vue3/dist/datatables.net-vue3.mjs'
import 'datatables.net-dt/css/dataTables.dataTables.css'

const props = defineProps({
  // optional items passed from parent; if empty, component will fetch from API
  items: {
    type: Array,
    default: () => []
  },
  // if true and no items provided, component will fetch from backend
  fetchFromApi: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select'])

const headers = [
  { text: 'Image', value: 'image', sortable: false },
  { text: 'Name', value: 'title' }
]

const localItems = ref([])
let objectUrls = []
const loading = ref(false)
const errorMessage = ref('')

// Helper: create item shape used by the table
function makeTableItem(raw) {
  // raw may be the backend IItem shape or a minimal object
  const id = raw.id ?? raw._id ?? raw.uuid
  const title = raw.title ?? raw.name ?? raw.label ?? 'Untitled'

  // Prefer API-provided coverImageUrl, then nested coverImage or images array
  let imageUrl = null
  if (raw.coverImageUrl) imageUrl = raw.coverImageUrl
  else if (raw.coverImage?.url) imageUrl = raw.coverImage.url
  else if (Array.isArray(raw.images) && raw.images.length) imageUrl = raw.images[0]?.url
  else if (raw.imageUrl) imageUrl = raw.imageUrl

  if (!imageUrl) imageUrl = placeholderImg

  return { id, title, _raw: raw, imageUrl }
}

async function fetchRemoteImageAsObjectUrl(itemId) {
  try {
    const resp = await fetch(`${API_URL}/items/${itemId}/image`)
    if (!resp.ok) return null
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    objectUrls.push(url)
    return url
  } catch (e) {
    console.error('fetch image failed', e)
    return null
  }
}

async function populateFromApi() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch(`${API_URL}/items`)
    if (!response.ok) {
      const txt = await response.text().catch(() => '')
      console.error('Failed to fetch items', response.status, txt)
      errorMessage.value = `Failed to fetch items: ${response.status}`
      return
    }
    const data = await response.json()

    console.log('ItemChooseToUploadForm: fetched items', data)

    localItems.value = []
    for (const raw of data) {
      const tableItem = makeTableItem(raw)
      // if there's no imageUrl but API exposes an endpoint to fetch blob, try that
      if (!tableItem.imageUrl) {
        const url = await fetchRemoteImageAsObjectUrl(tableItem.id)
        tableItem.imageUrl = url ?? placeholderImg
      }
      localItems.value.push(tableItem)
    }
  } catch (e) {
    console.error('Error fetching items', e)
    errorMessage.value = 'Error fetching items (see console)'
  } finally {
    loading.value = false
  }
}

// Initialize: use provided props.items if present, otherwise fetch from API when allowed
onMounted(() => {
  if (Array.isArray(props.items) && props.items.length) {
    localItems.value = props.items.map(makeTableItem)
  } else if (props.fetchFromApi) {
    populateFromApi()
  }
})

// Watch for prop changes: update localItems if parent passes new items
watch(() => props.items, (newVal) => {
  if (Array.isArray(newVal) && newVal.length) {
    // revoke old object URLs to avoid leaks
    objectUrls.forEach(u => URL.revokeObjectURL(u))
    objectUrls = []
    localItems.value = newVal.map(makeTableItem)
  }
})

onBeforeUnmount(() => {
  // Clean up object URLs
  objectUrls.forEach(url => URL.revokeObjectURL(url))
})

function onRowClick(item) {
  // item here is the table row object (the tableItem shape)
  emit('select', item._raw ?? item)
}

// DataTables configuration
const dtColumns = [
  { title: 'Image', data: 'imageUrl', render: function (data) { return `<img src="${data}" style="width:48px;height:48px;object-fit:cover;border-radius:4px;"/>` } },
  { title: 'Title', data: 'title' }
]

const dtOptions = {
  paging: true,
  searching: true,
  info: true,
  responsive: true
}

const dtData = computed(() => localItems.value.map(i => ({ imageUrl: i.imageUrl, title: i.title, _raw: i._raw })))
</script>

<style scoped>
.v-avatar img {
  object-fit: cover;
}
</style>