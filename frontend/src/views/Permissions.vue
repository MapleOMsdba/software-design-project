<!-- src/views/Permissions.vue -->
<template>
  <!--
    传递 props 给 PermissionManagement 组件（如果需要的话）
    例如，如果 PermissionManagement 需要 roles 和 users 数据：
    <PermissionManagement :roles="roles" :users="users" />
  -->
  <PermissionManagement />
</template>

<script setup>
// ✅ 使用 <script setup> 语法
import PermissionManagement from '@/components/PermissionManagement.vue'

// 如果 PermissionManagement 需要从 store 获取数据，你应该在这里 dispatch actions
// 例如：
/*
import { onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

onMounted(() => {
  store.dispatch('fetchRoles')
  store.dispatch('fetchUsers')
})
*/
</script>

<style scoped>
/* Your styles here */
</style>