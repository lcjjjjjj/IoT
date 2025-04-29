<template>
  <div class="panel-heading">
    <div class="panel-lead">
      <div class="title">
          {{title}}
      </div>
      <p class="description">
          {{desc}}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Panel",
  props:{
    title: {
      type: String,
      default: ""
    },
    desc: {
      type: String,
      default: ""
    }
  },
  mounted() {
    console.log(this.title,this.desc);
  }
}
</script>

<style scoped>
.panel-heading{
  padding: 12px;
  position: relative;
}

.panel-lead {
  display: flex;
  flex-direction: column ！important;
  align-items: flex-start ！important;
}

.title {
  font-weight: bold;
  font-style: normal;
  font-size: 18px;
  color: #000000;
}

.description {
  margin: 8px 0 0 12px;
  
  font-size: 12px;
  color: #999;
}
</style>