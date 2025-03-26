import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/SimulationConfig.vue')
    },
    {
      path: '/simulation',
      name: 'simulation',
      component: () => import('@/components/SimulationConfig.vue')
    }
    // 其他路由配置...
  ]
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要认证信息
  if (to.path !== '/' && (!localStorage.getItem('appKey') || !localStorage.getItem('appSecret'))) {
    ElMessage.error('请先配置appKey和appSecret');
    next('/');
    return;
  }
  next();
});

export default router 