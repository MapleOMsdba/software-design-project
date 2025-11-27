<template>
  <div class="home-container">
    <h1>软件综合设计项目</h1>
    <el-button type="primary" @click="fetchData">测试API连接</el-button>
    <div v-if="apiData" class="api-response">
      {{ apiData }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const apiData = ref(null)

const fetchData = async () => {
  try {
    const response = await axios.get('/api/test/')
    apiData.value = response.data
  } catch (error) {
    apiData.value = 'API连接失败: ' + error.message
  }
}
</script>

<style scoped>
.home-container {
  padding: 2rem;
  text-align: center;
}
.api-response {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  white-space: pre-wrap;
}
</style>