<template>
  <div>
    <mapViewer @showData="changeShow" :gridSize="gridSize"/>
    <showDatas v-show="showData" @gridsize="setGridSize"/>
  </div>
</template>

<script>
import mapViewer from "./mapViewer.vue"
import showDatas from './showDatas.vue'

export default {
  name: 'mainIndex',
  components: {
    showDatas,
    mapViewer
  },
  data() {
    return {
      showData: false,
      gridSize: null
    }
  },
  mounted() {

  },
  methods: {
    changeShow(e) {
      this.showData = true
    },
    setGridSize(e){
      this.gridSize = e
    }
  },
}
</script>

<style>

</style>
