<template>
  <div class="app-container">
    <div v-if="!selectedProtocol" class="protocol-selection">
      <div class="cyber-container">
        <h1 class="cyber-title">选择通信协议</h1>
        <div class="protocol-options">
          <div
            class="protocol-card"
            :class="{ active: tempProtocol === 'http' }"
            @click="tempProtocol = 'http'"
          >
            <i class="el-icon-connection"></i>
            <span>HTTP</span>
          </div>
          <div
            class="protocol-card"
            :class="{ active: tempProtocol === 'mqtt' }"
            @click="tempProtocol = 'mqtt'"
          >
            <i class="el-icon-message"></i>
            <span>MQTT</span>
          </div>
          <div
            class="protocol-card"
            :class="{ active: tempProtocol === 'tcp' }"
            @click="tempProtocol = 'tcp'"
          >
            <i class="el-icon-monitor"></i>
            <span>TCP</span>
          </div>
        </div>

        <!-- 修改输入框部分的模板 -->
        <div class="auth-inputs">
          <el-input
            v-model="appKey"
            class="auth-input"
            placeholder="请输入appKey"
          >
            <template #prepend>
              <span class="required-label"
                >AppKey <span class="required-star">*</span></span
              >
            </template>
          </el-input>
          <el-input
            v-model="appSecret"
            class="auth-input"
            placeholder="请输入appSecret"
          >
            <template #prepend>
              <span class="required-label"
                >AppSecret <span class="required-star">*</span></span
              >
            </template>
          </el-input>
        </div>

        <el-button
          type="primary"
          class="confirm-btn"
          :disabled="!tempProtocol || !appKey || !appSecret"
          @click="confirmProtocol"
        >
          确认选择
        </el-button>
      </div>
    </div>
    <SimulationConfig
      v-else
      :protocol="selectedProtocol"
      @reset-protocol="resetProtocol"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import SimulationConfig from "./components/SimulationConfig.vue";
import { onUnmounted } from "vue";
import { getAccessToken } from "./api/auth";

export default {
  name: "App",
  components: {
    SimulationConfig,
  },
  setup() {
    const selectedProtocol = ref(null);
    const tempProtocol = ref(null);
    const connectionStatus = ref(false);
    const client = ref(null);
    const appKey = ref(localStorage.getItem("appKey") || "");
    const appSecret = ref(localStorage.getItem("appSecret") || "");

    const initHttpConnection = async () => {
      try {
        const res = await getAccessToken();
        // 存储token和过期时间供后续使用
        localStorage.setItem("accessToken", res.data.token);
        localStorage.setItem("tokenExpireIn", res.data.expireIn);

        // 设置协议选择状态
        selectedProtocol.value = tempProtocol.value;
        connectionStatus.value = true;

        return true;
      } catch (error) {
        console.error("HTTP连接初始化失败:", error);
        return false;
      }
    };

    const initMqttConnection = () => {
      return new Promise((resolve) => {
        const socket = new WebSocket(
          "ws://192.168.9.139:8080/intelligent-device-mock/websocket"
        );

        socket.onopen = () => {
          client.value = socket;
          connectionStatus.value = true;
          console.log("WebSocket连接成功");
          resolve(true);
        };

        socket.onclose = () => {
          console.log("WebSocket连接已关闭");
          connectionStatus.value = false;
        };

        socket.onerror = (error) => {
          console.error("WebSocket连接错误:", error);
          resolve(false);
        };

        socket.onmessage = (event) => {
          if (!event.data) {
            console.warn("收到空消息");
            return false;
          }
          try {
            const data = JSON.parse(event.data);
            if (data.sessionId) {
              localStorage.setItem("sessionId", data.sessionId);
            }
          } catch (error) {
            console.error("消息解析失败:", error);
            return false;
          }
        };
      });
    };

    const confirmProtocol = async () => {
      // 存储 appKey 和 appSecret
      localStorage.setItem("appKey", appKey.value);
      localStorage.setItem("appSecret", appSecret.value);

      let success = false;

      switch (tempProtocol.value) {
        case "http":
          success = await initHttpConnection();
          break;
        case "mqtt":
          success = await initMqttConnection();
          break;
        case "tcp":
          success = await initMqttConnection();
          break;
      }

      if (success) {
        selectedProtocol.value = tempProtocol.value;
      } else {
        tempProtocol.value = null;
      }
    };

    const resetProtocol = () => {
      selectedProtocol.value = null;
      tempProtocol.value = null;
    };

    // 组件卸载时清理连接
    onUnmounted(() => {
      if (client.value) {
        if (selectedProtocol.value === "mqtt") {
          client.value.close();
        } else if (selectedProtocol.value === "tcp") {
          client.value.destroy();
        }
      }
    });

    return {
      selectedProtocol,
      tempProtocol,
      confirmProtocol,
      connectionStatus,
      client,
      resetProtocol,
      appKey,
      appSecret,
    };
  },
};
</script>

<style>
/* 修改全局样式 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.app-container {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(45deg, #0f0c29, #302b63, #24243e);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 40px 0; /* 添加上下内边距 */
  box-sizing: border-box; /* 确保padding不会增加容器总大小 */
}

.protocol-selection {
  height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.cyber-container {
  background: rgba(13, 18, 38, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.15);
  border: 1px solid rgba(0, 255, 255, 0.2);
  text-align: center;
}

.cyber-title {
  color: #0ff;
  font-family: "Orbitron", sans-serif;
  font-size: 2em;
  margin-bottom: 40px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.protocol-options {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.protocol-card {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.protocol-card i {
  font-size: 2em;
  color: #0ff;
  margin-bottom: 10px;
}

.protocol-card span {
  font-size: 20px;
  color: #fff;
  font-family: "Orbitron", sans-serif;
}

.protocol-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.protocol-card.active {
  background: rgba(0, 255, 255, 0.1);
  border-color: #0ff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.confirm-btn {
  margin-top: 20px;
}

.simulation-config-container {
  min-height: calc(100vh - 80px);
  width: 100%;
  display: flex;
  flex-direction: column;
}

.auth-inputs {
  margin: 30px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 400px;
}

.auth-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.auth-input :deep(.el-input__wrapper:hover),
.auth-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
}

.auth-input :deep(.el-input__inner) {
  color: #fff;
  height: 40px;
}

.auth-input .el-input-group__prepend {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: #fff;
  padding: 0 15px;
  width: 100px;
  text-align: left;
}

.required-label {
  font-size: 14px;
}

.required-star {
  color: #ff4949;
  margin-left: 2px;
}
</style>
