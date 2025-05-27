<template>
  <div class="container">
    <iframe :src="graphIp" id="mobsf" scrolling="no" frameborder="0" width="100%" height="100%"></iframe>
  </div>
</template>

<script>
import Panel from "../components/Panel.vue"
export default {
  data() {
    return {
      title: '事件溯源分析',
      desc: '这里是事件溯源分析的描述信息',
      graphIp: 'http://39.103.172.54'
    }
  },
  components: {
    Panel
  }
}
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>