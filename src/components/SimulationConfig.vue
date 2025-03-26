<template>
  <div class="container">
    <el-button
      class="back-button"
      type="primary"
      :icon="ArrowLeft"
      @click="handleBack"
      >返回</el-button
    >
    <!-- <div class="cyber-corner top-left"></div> -->
    <div class="cyber-corner top-right"></div>
    <div class="cyber-corner bottom-left"></div>
    <div class="cyber-corner bottom-right"></div>
    <div class="scan-lines"></div>
    <div class="glitch-wrapper">
      <h1 class="cyber-glitch" data-text="数据模拟配置界面">
        {{ protocol }}数据模拟配置界面
      </h1>
      <div class="digital-rain"></div>
    </div>
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane v-if="protocol === 'tcp'" label="登录" name="login">
        <TcpDefault
          v-if="activeTab === 'login'"
          :choiceType="protocol"
          :tcpType="1"
          @reset-protocol="handleResetProtocol"
          @login-success="handleLoginSuccess"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="protocol === 'tcp'"
        label="心跳"
        name="heart"
        :disabled="!isLoggedIn"
      >
        <TcpDefault
          v-if="activeTab === 'heart'"
          :choiceType="protocol"
          :tcpType="2"
          @reset-protocol="handleResetProtocol"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="protocol === 'tcp'"
        label="登出"
        name="logout"
        :disabled="!isLoggedIn"
      >
        <TcpDefault
          v-if="activeTab === 'logout'"
          :choiceType="protocol"
          :tcpType="3"
          @reset-protocol="handleResetProtocol"
          @logout-success="handleLogout"
        />
      </el-tab-pane>
      <el-tab-pane
        label="设备状态信息上报"
        name="status"
        :disabled="protocol === 'tcp' && !isLoggedIn"
      >
        <EquipmentStatus
          v-if="activeTab === 'status'"
          :choiceType="protocol"
          @reset-protocol="handleResetProtocol"
        />
      </el-tab-pane>
      <el-tab-pane
        label="设备位置信息上报"
        name="location"
        :disabled="protocol === 'tcp' && !isLoggedIn"
      >
        <EquipmentLocation
          v-if="activeTab === 'location'"
          :choiceType="protocol"
          @reset-protocol="handleResetProtocol"
        />
      </el-tab-pane>
      <el-tab-pane
        label="设备事件信息上报"
        name="event"
        :disabled="protocol === 'tcp' && !isLoggedIn"
      >
        <EquipmentEvent
          v-if="activeTab === 'event'"
          :choiceType="protocol"
          @reset-protocol="handleResetProtocol"
        />
      </el-tab-pane>
      <el-tab-pane
        label="设备任务信息上报"
        name="task"
        :disabled="protocol === 'tcp' && !isLoggedIn"
      >
        <EquipmentTask
          v-if="activeTab === 'task'"
          :choiceType="protocol"
          @reset-protocol="handleResetProtocol"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref } from "vue";
import { ArrowLeft } from "@element-plus/icons-vue";
import EquipmentStatus from "./EquipmentStatus.vue";
import EquipmentLocation from "./EquipmentLocation.vue";
import EquipmentEvent from "./EquipmentEvent.vue";
import EquipmentTask from "./EquipmentTask.vue";
import TcpDefault from "./tcpDefault.vue";
import { ElTabs, ElTabPane, ElButton } from "element-plus";

export default {
  name: "SimulationConfig",
  components: {
    EquipmentStatus,
    EquipmentLocation,
    EquipmentEvent,
    EquipmentTask,
    TcpDefault,
    ElTabs,
    ElTabPane,
    ElButton,
  },
  props: {
    protocol: {
      type: String,
      required: true,
      validator: (value) => ["http", "mqtt", "tcp"].includes(value),
    },
  },
  emits: ["reset-protocol"],
  setup(props, { emit }) {
    const activeTab = ref(props.protocol === "tcp" ? "login" : "status");
    const isLoggedIn = ref(false);

    const handleLoginSuccess = () => {
      isLoggedIn.value = true;
    };

    const handleLogout = () => {
      isLoggedIn.value = false;
      activeTab.value = "login";
    };

    const handleResetProtocol = () => {
      isLoggedIn.value = false;
      emit("reset-protocol");
    };

    const handleBack = () => {
      emit("reset-protocol");
    };

    return {
      activeTab,
      isLoggedIn,
      handleBack,
      ArrowLeft,
      handleResetProtocol,
      handleLoginSuccess,
      handleLogout,
    };
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Orbitron", sans-serif;
  background: linear-gradient(45deg, #0f0c29, #302b63, #24243e);
  color: #fff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
}

.container {
  width: 90%;
  max-width: 1200px;
  background: rgba(13, 18, 38, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(0, 255, 255, 0.05);
  margin: 0px auto;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 255, 0.2);
  transition: box-shadow 0.3s ease;
}

.container:hover {
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.glitch-wrapper {
  margin-top: 20px;
}

.cyber-glitch {
  color: #0ff;
  font-family: "Orbitron", sans-serif;
  font-size: 2.5em;
  font-weight: bold;
  text-transform: uppercase;
  position: relative;
  margin: 20px 0;
}

.input-group {
  margin-bottom: 20px;
}

.custom-input,
.custom-select,
.custom-input-number {
  width: 100%;
  padding: 12px;
  margin-top: 5px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: #fff;
  font-family: "Orbitron", sans-serif;
}

.custom-button {
  padding: 12px 30px;
  font-size: 16px;
  background: linear-gradient(45deg, #00ffff, #00ff00);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
  font-family: "Orbitron", sans-serif;
  position: relative;
  overflow: hidden;
}

.custom-button.glow {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2);
}

.custom-button[type="success"] {
  background: linear-gradient(45deg, #00ffff, #00ff00);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}

.custom-button[type="success"]:hover {
  background: linear-gradient(45deg, #00ff00, #00ffff);
  box-shadow: 0 0 25px rgba(0, 255, 0, 0.5);
}

/* 为"停止模拟"按钮添加特殊样式 */
.custom-button.warning {
  background: linear-gradient(45deg, #ff3e3e, #ff8f00);
}

.custom-button.warning:hover {
  background: linear-gradient(45deg, #ff8f00, #ff3e3e);
  box-shadow: 0 0 25px rgba(255, 62, 62, 0.6), 0 0 45px rgba(255, 62, 62, 0.3);
}

.custom-button:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.custom-button:active {
  transform: translateY(1px);
}

/* 添加按钮内发光效果 */
.custom-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: 0.5s;
}

.custom-button:hover::before {
  left: 100%;
}

.field-item,
.event-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.field-item:hover,
.event-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
}

.field-info {
  flex-grow: 1;
  margin-right: 10px;
}

@keyframes glow {
  0% {
    text-shadow: 0 0 5px #00ffff;
  }
  50% {
    text-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff;
  }
  100% {
    text-shadow: 0 0 5px #00ffff;
  }
}

.glow {
  animation: glow 2s infinite;
}

.button-group {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 添加按钮悬浮时的光晕效果 */
.custom-button::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.custom-button:hover::after {
  opacity: 1;
}

/* 优化按钮点击效果 */
.custom-button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* 添加 tab 切换时的微妙动画 */
:deep(.el-tab-pane) {
  transition: opacity 0.3s ease;
}

/* 优化标题发光效果 */
h1.glow {
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3),
    0 0 30px rgba(0, 255, 255, 0.1);
}

/* 添加角标装饰 */
.cyber-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #0ff;
  opacity: 0.5;
}

.cyber-corner.top-left {
  top: 50px;
  left: 50px;
  border-right: none;
  border-bottom: none;
}

.cyber-corner.top-right {
  top: 10px;
  right: 10px;
  border-left: none;
  border-bottom: none;
}

.cyber-corner.bottom-left {
  bottom: 10px;
  left: 10px;
  border-right: none;
  border-top: none;
}

.cyber-corner.bottom-right {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
}

/* 添加扫描线效果 */
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.02) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1;
}

/* 数字雨效果 */
.digital-rain {
  position: absolute;
  top: 0;
  right: 0;
  font-family: monospace;
  font-size: 14px;
  color: #0ff;
  opacity: 0.3;
  pointer-events: none;
  user-select: none;
}

.digital-rain::before {
  content: "1 0 1 0 1\A 0 1 0 1 0\A 1 0 1 0 1";
  white-space: pre;
  animation: rain 2s linear infinite;
}

/* 按钮故障效果 */
.btn-glitch-effect {
  position: relative;
  display: inline-block;
}

.btn-glitch-effect::before {
  content: attr(data-text);
  position: absolute;
  left: -2px;
  text-shadow: 1px 0 #ff0000;
  top: 0;
  color: #0ff;
  background: #000;
  overflow: hidden;
  clip: rect(0, 900px, 0, 0);
  animation: btn-glitch 2s infinite linear alternate-reverse;
}

/* 容器边框发光效果 */
.container {
  position: relative;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  animation: border-glow 4s infinite alternate;
}

/* 动画定义 */
@keyframes rain {
  from {
    transform: translateY(-20px);
  }
  to {
    transform: translateY(20px);
  }
}

@keyframes btn-glitch {
  2%,
  64% {
    transform: translate(2px, 0) skew(0deg);
  }
  4%,
  60% {
    transform: translate(-2px, 0) skew(0deg);
  }
  62% {
    transform: translate(0, 0) skew(5deg);
  }
}

@keyframes border-glow {
  from {
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
  }
  to {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }
}

/* 美化返回按钮样式 */
.back-button {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 2;
  background: transparent;
  border: 1px solid #0ff;
  color: #0ff;
  padding: 8px 20px;
  font-family: "Orbitron", sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.back-button:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.2);
}

.back-button:active {
  transform: scale(0.95);
}

.back-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(0, 255, 255, 0.3),
    transparent
  );
  transition: 0.5s;
}

.back-button:hover::before {
  left: 100%;
}
</style> 