<template>
  <div class="input-wrapper">
    <label v-if="label">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :autocomplete="autocomplete"
      :required="required"
    />
  </div>
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    modelValue: String,
    type: {
      type: String,
      default: 'text'
    },
    placeholder: String,
    label: String,
    required: {
      type: Boolean,
      default: false
    },
    autocomplete: String
  }
};
</script>

<style>
input {
  width: 275px;
  border: 3px solid #131111;
  border-radius: 12px;
  padding: 8px;
  font-size: 16px;
}
</style>