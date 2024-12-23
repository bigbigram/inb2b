<template>
  <div class="base-layout">
    <!-- Navigation component -->
    <nav>
      <!-- Navigation items -->
      <button @click="handleLogout">Logout</button>
    </nav>

    <!-- Main content area -->
    <main>
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth.service';
import { useNotificationStore } from '@/stores/notification';

const router = useRouter();
const notificationStore = useNotificationStore();

const handleLogout = async () => {
  try {
    await authService.logout();
    // Redirection and notification are now handled in the auth service
  } catch (error) {
    console.error('Logout error:', error);
    // Additional error handling if needed
  }
};
</script>

<style scoped>
.base-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

nav {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f8f9fa;
}

main {
  flex-grow: 1;
  padding: 1rem;
}
</style>
