<template>
  <span class="spoiler-wrapper" @click="reveal">
    <span class="spoiler-text">{{ text }}</span>
    <span
      class="spoiler-cover"
      :class="{ revealed: revealed }"
    ></span>
  </span>
</template>

<script>
export default {
  name: "Spoiler",
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      revealed: false,
    };
  },
  methods: {
    reveal() {
      this.revealed = true;
    },
  },
};
</script>

<style scoped>
.spoiler-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.spoiler-text {
  z-index: 0;
  color: inherit;
}

/* Always present, only opacity changes */
.spoiler-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 1;
  border-radius: 2px;
  pointer-events: none;
  transition: opacity 1s ease;
  opacity: 1;
}

.spoiler-cover.revealed {
  opacity: 0;
}
</style>