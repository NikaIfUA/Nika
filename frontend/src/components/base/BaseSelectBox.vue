<template>
  <select class="base-select" v-model="selectedValue" @change="$emit('update:modelValue', selectedValue)">
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'BaseSelectBox',
  props: {
    options: {
      type: Array,
      required: true,
      // Example: [{ value: '1', label: 'One' }, { value: '2', label: 'Two' }]
    },
    modelValue: {
      required: false
    }
  },
  data() {
    return {
      selectedValue: this.modelValue
    };
  },
  watch: {
    modelValue(newVal) {
      this.selectedValue = newVal;
    }
  }
};
</script>

<style scoped>
.base-select {
    margin: 10px;
    height: 50px;
    max-width: 250px;
    padding: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
}
</style>