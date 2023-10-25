<template>
  <div id="app">
    <mainIndex />
  </div>
</template>

<script>
import mainIndex from "./components/mainIndex.vue";

export default {
  name: "App",
  components: {
    mainIndex
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
</style>
