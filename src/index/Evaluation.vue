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
        title: '态势评估',
        desc: '这里是态势评估的描述信息'
      }
    },
    components: {
      Panel
    }
  }
  </script>
  
  <style scoped>
  
  </style>