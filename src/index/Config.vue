<template>
  <div>
    <Panel :title="title" :desc="desc" />
  </div>
</template>

<script>
import Panel from "../components/Panel.vue"
export default {
  data() {
    return {
      title: '物联网配置',
      desc: '这里是物联网配置的描述信息'
    }
  },
  components: {
    Panel
  }
}
</script>

<style scoped>

</style>