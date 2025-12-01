<template>
  <div class="permission-container">
    <div class="header">
      <h2>权限管理</h2>
      <button @click="showAddRoleModal = true" class="btn-primary">添加角色</button>
    </div>

    <!-- 角色列表 -->
    <div class="roles-section">
      <h3>角色管理</h3>
      <div class="roles-grid">
        <div v-for="role in roles" :key="role.id" class="role-card">
          <div class="role-header">
            <h4>{{ role.name }}</h4>
            <span class="role-description">{{ role.description }}</span>
          </div>
          <div class="role-permissions">
            <p><strong>权限:</strong></p>
            <ul>
              <li v-for="perm in role.permissions" :key="perm">
                {{ perm }}
              </li>
            </ul>
          </div>
          <div class="role-actions">
            <button @click="editRole(role)" class="btn-edit">编辑</button>
            <button @click="deleteRole(role.id)" class="btn-delete">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户权限分配 -->
    <div class="users-section">
      <h3>用户权限分配</h3>
      <div class="user-list">
        <div v-for="user in users" :key="user.id" class="user-item">
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <span class="email">{{ user.email }}</span>
          </div>
          <div class="user-role">
            <select v-model="user.roleId">
              <option value="">无角色</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加角色模态框 -->
    <div v-if="showAddRoleModal" class="modal-overlay">
      <div class="modal-content">
        <h3>添加新角色</h3>
        <form @submit.prevent="addRole">
          <div class="form-group">
            <label for="roleName">角色名称</label>
            <input id="roleName" v-model="newRole.name" type="text" required>
          </div>
          <div class="form-group">
            <label for="roleDesc">描述</label>
            <textarea id="roleDesc" v-model="newRole.description"></textarea>
          </div>
          <div class="form-group">
            <label>权限选择</label>
            <div class="permissions-checkboxes">
              <label v-for="perm in availablePermissions" :key="perm">
                <input
                  type="checkbox"
                  v-model="newRole.permissions"
                  :value="perm"
                >
                {{ perm }}
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddRoleModal = false">取消</button>
            <button type="submit">创建角色</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()

    // 数据
    const roles = ref([
      {
        id: 1,
        name: '管理员',
        description: '拥有全部系统权限',
        permissions: ['CREATE_USER', 'DELETE_USER', 'VIEW_LOGS', 'MANAGE_PERMISSIONS']
      },
      {
        id: 2,
        name: '普通用户',
        description: '基本操作权限',
        permissions: ['VIEW_DASHBOARD', 'VIEW_LOGS']
      }
    ])

    const users = ref([
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        roleId: 1
      },
      {
        id: 2,
        username: 'test_user',
        email: 'test@example.com',
        roleId: 2
      }
    ])

    const availablePermissions = [
      'CREATE_USER', 'DELETE_USER', 'UPDATE_USER',
      'VIEW_DASHBOARD', 'VIEW_LOGS', 'MANAGE_PERMISSIONS',
      'VIEW_ANALYTICS', 'EXPORT_DATA'
    ]

    const newRole = ref({
      name: '',
      description: '',
      permissions: []
    })

    const showAddRoleModal = ref(false)

    // 计算属性
    const currentUser = computed(() => store.state.user)

    // 方法
    const addRole = () => {
      if (newRole.value.name.trim()) {
        const role = {
          id: roles.value.length + 1,
          ...newRole.value
        }
        roles.value.push(role)
        newRole.value = { name: '', description: '', permissions: [] }
        showAddRoleModal.value = false
      }
    }

    const editRole = (role) => {
      // 实现编辑逻辑
      console.log('编辑角色:', role)
    }

    const deleteRole = (roleId) => {
      if (confirm('确定要删除这个角色吗？')) {
        roles.value = roles.value.filter(role => role.id !== roleId)

        // 更新用户的角色引用
        users.value.forEach(user => {
          if (user.roleId === roleId) {
            user.roleId = null
          }
        })
      }
    }

    return {
      roles,
      users,
      availablePermissions,
      newRole,
      showAddRoleModal,
      addRole,
      editRole,
      deleteRole,
      currentUser
    }
  }
}
</script>

<style scoped>
.permission-container {
  background-color: #f0f2f5;
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #096dd9;
}

.roles-section, .users-section {
  margin-bottom: 32px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.role-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
}

.role-header h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.role-description {
  color: #8c8c8c;
  font-size: 14px;
  margin-bottom: 16px;
}

.role-permissions ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.role-permissions li {
  margin-bottom: 8px;
  color: #595959;
}

.role-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn-edit {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.user-list {
  display: grid;
  gap: 12px;
}

.user-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  flex: 1;
}

.username {
  font-weight: bold;
  margin-bottom: 4px;
}

.email {
  color: #8c8c8c;
  font-size: 14px;
}

.user-role select {
  padding: 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.permissions-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.permissions-checkboxes label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background: none;
  color: #8c8c8c;
}

.modal-actions button:last-child {
  background-color: #1890ff;
  color: white;
  border: none;
}

.modal-actions button:hover {
  opacity: 0.9;
}
</style>