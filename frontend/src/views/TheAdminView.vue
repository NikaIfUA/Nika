<template>
  <div class="admin-links">
    <h2>Admin</h2>
    <ul>
      <li><RouterLink to="/admin/upload-image">Upload Image</RouterLink></li>
      <li><RouterLink to="/admin/add-category">Add Category</RouterLink></li>
      <li><RouterLink to="/admin/add-materials">Add Materials</RouterLink></li>
    </ul>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.admin-links ul { list-style: none; padding: 0; }
.admin-links li { margin: 6px 0; }
.admin-quick-upload { margin-top: 20px; }
</style>