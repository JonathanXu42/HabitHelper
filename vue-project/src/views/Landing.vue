<template>
  <div class="landing">
    <h1>Hello World</h1>

    <a class="view-progress-log" @click.prevent="$router.push('/progress-log')">View progress log</a>
  </div>
</template>

<script>
export default {
  name: 'Landing'
};
</script>

<style scoped>
.landing {
  text-align: center;
  margin-top: 100px;
}
</style>