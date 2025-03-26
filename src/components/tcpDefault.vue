<template>
  <el-card class="box-card">
    <div class="header-section">
      <h2>{{ tabTitle }}</h2>
    </div>

    <!-- 修改模拟控制按钮组 -->
    <div class="simulation-controls">
      <!-- 添加心跳间隔输入框 -->
      <div v-if="tcpType === 2" class="heartbeat-config">
        <span>心跳间隔：</span>
        <el-input-number
          v-model="heartbeatInterval"
          :min="1"
          :max="3600"
          :disabled="isSimulating"
        />
        <span class="unit">秒</span>
      </div>

      <div class="simulation-actions">
        <el-button
          type="primary"
          :loading="isSimulating"
          @click="startSimulation"
        >
          {{ isSimulating ? "发送中..." : "发送数据" }}
        </el-button>
        <!-- 添加取消心跳按钮 -->
        <el-button
          v-if="tcpType === 2 && heartbeatTimer"
          type="danger"
          @click="cancelHeartbeat"
        >
          取消心跳
        </el-button>
        <!-- <el-button type="warning" @click="resetToDefault"> 重置数据 </el-button> -->
      </div>

      <!-- 修改响应数据展示区域 -->
      <div class="response-section">
        <div class="response-column">
          <div class="response-header">
            <span class="response-title">请求参数：</span>
          </div>
          <custom-json-editor
            v-model="requestParams"
            height="300"
            :readOnly="true"
            mode="view"
            class="response-editor"
            :key="'request-' + Date.now()"
          />
        </div>

        <div class="response-column">
          <div class="response-header">
            <span class="response-title">接口返回数据：</span>
            <el-tag
              v-if="showResponse"
              :type="lastResponse.success ? 'success' : 'danger'"
              size="small"
            >
              {{
                showResponse
                  ? lastResponse.success
                    ? "请求成功"
                    : "请求失败"
                  : ""
              }}
            </el-tag>
          </div>
          <custom-json-editor
            v-if="showResponse"
            v-model="formattedResponseData"
            height="300"
            :readOnly="true"
            mode="view"
            class="response-editor"
            :key="'response-' + Date.now()"
          />
          <el-empty v-else description="暂无响应数据" :image-size="100">
            <template #description>
              <span class="empty-text">点击"发送数据"按钮获取响应</span>
            </template>
          </el-empty>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { ref, computed, onBeforeUnmount, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CustomJsonEditor from "./JsonEditor.vue";
import { getTcpMsgData, tcpSendMsg, generateSign } from "@/api/auth";

export default {
  name: "TcpDefault",
  components: {
    CustomJsonEditor,
  },
  props: {
    choiceType: {
      type: String,
      required: true,
      validator: (value) => ["tcp"].includes(value),
    },
    tcpType: {
      type: Number,
      required: true,
      validator: (value) => [1, 2, 3].includes(value),
    },
  },
  emits: ["reset-protocol", "login-success", "logout-success"],
  setup(props, { emit }) {
    const isSimulating = ref(false);
    const lastResponse = ref(null);
    const heartbeatInterval = ref(30); // 默认30秒
    let heartbeatTimer = null;
    // 添加响应式引用以便在模板中使用
    const heartbeatTimerRef = ref(null);

    // 添加新的响应式变量
    const showResponse = ref(false);
    const requestParams = computed(() => {
      const timestamp = Date.now();
      const sign = generateSign(timestamp);

      return {
        appKey: localStorage.getItem("appKey"),
        messageText:
          props.tcpType === 1
            ? JSON.stringify({
                timestamp,
                sign,
              })
            : "",
        type: props.tcpType,
      };
    });
    const formattedResponseData = computed(() => {
      return lastResponse.value?.data || null;
    });

    const tabTitle = computed(() => {
      switch (props.tcpType) {
        case 1:
          return "登录";
        case 2:
          return "心跳";
        case 3:
          return "登出";
        default:
          return "未知";
      }
    });

    // 添加取消心跳方法
    const cancelHeartbeat = () => {
      stopHeartbeat();
      ElMessage.success("已取消心跳");
    };

    // 修改 startHeartbeat 方法
    const startHeartbeat = () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
      heartbeatTimer = setInterval(() => {
        startSimulation();
      }, heartbeatInterval.value * 1000);
      heartbeatTimerRef.value = heartbeatTimer;
    };

    // 修改 stopHeartbeat 方法
    const stopHeartbeat = () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
        heartbeatTimerRef.value = null;
      }
    };

    const startSimulation = async () => {
      if (isSimulating.value) return;

      const appKey = localStorage.getItem("appKey");
      const appSecret = localStorage.getItem("appSecret");

      if (!appKey || !appSecret) {
        ElMessage.error("未找到认证信息,请先配置appKey和appSecret");
        emit("reset-protocol");
        return;
      }

      try {
        isSimulating.value = true;

        // 直接使用计算属性的值
        const tcpMsgResponse = await getTcpMsgData(requestParams.value);
        const response = await tcpSendMsg({
          dataHexStr: tcpMsgResponse.data.dataHexStr,
        });

        lastResponse.value = {
          success: response.code === 200,
          data: {
            code: response.code,
            msg: response.msg,
            data: response.data,
          },
        };
        showResponse.value = true;

        // 根据不同的操作类型和响应结果触发相应事件
        if (response.code === 200) {
          if (props.tcpType === 1) {
            // 登录成功
            emit("login-success");
            ElMessage.success("登录成功");
          } else if (props.tcpType === 3) {
            // 登出成功
            emit("logout-success");
            ElMessage.success("登出成功");
            stopHeartbeat(); // 确保登出时停止心跳
          }
          // 心跳成功后启动定时器
          if (props.tcpType === 2) {
            startHeartbeat();
          }
        } else {
          ElMessage.error(response.msg || "操作失败");
          // 操作失败时停止心跳
          if (props.tcpType === 1 || props.tcpType === 2) {
            stopHeartbeat();
          }
        }
      } catch (error) {
        console.error("发送数据错误:", error);
        lastResponse.value = {
          success: false,
          data: {
            code: 500,
            msg: error.message || "发送数据失败",
            data: null,
          },
        };
        showResponse.value = true;
        ElMessage.error(error.message || "操作失败");
        // 发生错误时也停止心跳
        if (props.tcpType === 1 || props.tcpType === 2) {
          stopHeartbeat();
        }
      } finally {
        isSimulating.value = false;
      }
    };

    const resetToDefault = () => {
      ElMessageBox.confirm("确定要重置所有数据到初始状态吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          ElMessage({
            type: "success",
            message: "数据已重置",
          });
        })
        .catch(() => {});
    };

    // 监听登出事件
    watch(
      () => props.tcpType,
      (newVal) => {
        if (newVal === 3) {
          stopHeartbeat();
        }
      }
    );

    // 组件销毁前清除定时器
    onBeforeUnmount(() => {
      stopHeartbeat();
    });

    return {
      isSimulating,
      startSimulation,
      resetToDefault,
      lastResponse,
      tabTitle,
      heartbeatInterval,
      heartbeatTimer: heartbeatTimerRef, // 暴露给模板
      cancelHeartbeat, // 暴露新方法
      showResponse,
      requestParams,
      formattedResponseData,
    };
  },
};
</script>

<style lang="scss" scoped>
$spacing-lg: 20px;

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  overflow: hidden;

  .header-section {
    @include flex-between;
  }

  .simulation-controls {
    .response-section {
      margin-top: 20px;
      padding: 20px;
      border-top: 1px solid #ebeef5;
      display: flex;
      gap: 20px;

      .response-column {
        flex: 1;
        min-width: 0;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        padding: 16px;
        background-color: #fafafa;

        .response-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;

          .response-title {
            font-size: 14px;
            font-weight: 500;
            color: #606266;
          }
        }

        .response-editor {
          :deep(.jsoneditor-vue) {
            border: 1px solid #dcdfe6;
            border-radius: 4px;
          }
        }

        :deep(.el-empty) {
          padding: 40px 0;
        }
      }
    }

    .heartbeat-config {
      margin-bottom: $spacing-lg;
      display: flex;
      align-items: center;
      gap: 10px;

      .unit {
        color: #606266;
      }
    }
  }
}

.empty-text {
  color: #909399;
  font-size: 14px;
}
</style> 