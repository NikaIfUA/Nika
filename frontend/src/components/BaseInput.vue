<template>
    <input
        type="text"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="base-input"
        v-bind="$attrs"
    />
</template>

<script setup>
defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.base-input {
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