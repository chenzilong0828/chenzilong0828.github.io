<template>
  <el-card class="box-card">
    <div class="header-section">
      <h2>设备任务信息上报字段配置</h2>
    </div>
    <!-- 添加 MQTT 主题显示部分 -->
    <div v-if="choiceType === 'mqtt'">
      <div class="title-text">发布主题</div>
      <div class="public-topic">
        <span class="topic-text">/intelligent-device/client/{{ appKey }}</span>
      </div>
    </div>

    <div class="table-header">
      <div class="title-text">字段列表</div>
      <div class="table-actions">
        <!-- <el-button
          type="primary"
          size="small"
          @click="openJsonEditor"
          :icon="EditPen"
        >
          在线编辑
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="importJson"
          :icon="Download"
        >
          导入配置
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="exportToJson"
          :icon="Upload"
        >
          导出配置
        </el-button> -->
      </div>
    </div>

    <el-table
      :data="fields"
      style="width: 100%"
      table-layout="fixed"
      :key="forceUpdate"
    >
      <el-table-column prop="name" label="名称">
        <template #default="scope">
          <span>
            {{ scope.row.name }}
            <span v-if="scope.row.required" class="required-field">*</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="label" label="中文名称"></el-table-column>
      <el-table-column prop="type" label="类型"></el-table-column>
      <el-table-column width="500" prop="value" label="值">
        <template #default="scope">
          <template v-if="scope.row.name === 'taskDetail'">
            <div class="json-editor-wrapper">
              <custom-json-editor
                :key="scope.row.value"
                v-model="scope.row.value"
                @change="handleTaskDetailChange"
                height="200"
                class="stable-json-editor"
              />
            </div>
          </template>
          <el-date-picker
            v-else-if="scope.row.editorType === 'datetime'"
            v-model="scope.row.value"
            type="datetime"
            :placeholder="scope.row.placeholder || '选择日期时间'"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :clearable="true"
            style="width: 100%"
          />
          <el-input
            v-else-if="scope.row.editorType === 'input'"
            v-model="scope.row.value"
          />
          <el-input-number
            style="width: 100%"
            v-else-if="scope.row.editorType === 'input-number'"
            v-model="scope.row.value"
            :min="scope.row.min"
            :max="scope.row.max"
          />
          <el-select
            v-else-if="scope.row.editorType === 'select'"
            v-model="scope.row.value"
            :placeholder="scope.row.placeholder || '请选择'"
          >
            <el-option
              v-for="opt in scope.row.options"
              :key="opt"
              :label="scope.row.optionsLabel?.[opt] || opt"
              :value="opt"
            />
          </el-select>
          <template v-else-if="scope.row.editorType === 'tag-input'">
            <div class="fault-codes-container">
              <div class="tags-wrapper">
                <el-tag
                  v-for="code in JSON.parse(scope.row.value)"
                  :key="code"
                  closable
                  @close="removeFaultCode(scope.row, code)"
                  class="fault-code-tag"
                >
                  {{ code }}
                </el-tag>
              </div>
              <el-input
                v-model="newFaultCode"
                placeholder="输入故障码后按回车"
                @keyup.enter="addFaultCode(scope.row)"
                style="width: 100%"
              />
            </div>
          </template>
          <pre v-else>{{ scope.row.value }}</pre>
        </template>
      </el-table-column>
    </el-table>

    <el-form
      :model="fieldForm"
      :rules="formRules"
      label-width="120px"
      ref="formRef"
    >
      <el-card class="field-form-card" shadow="hover">
        <div class="custom-field-title">
          <span class="title-text">任务详情信息</span>
        </div>
        <field-form
          v-model="fieldForm"
          :rules="formRules"
          @change="handleJsonChange"
        />

        <div class="button-group">
          <el-button type="primary" @click="addField">添加字段</el-button>
          <!-- <el-button type="warning" @click="resetFields">初始化</el-button> -->
        </div>
      </el-card>
    </el-form>

    <!-- 修改模拟控制按钮组 -->
    <div class="simulation-controls">
      <div class="simulation-actions">
        <el-button
          type="primary"
          :loading="isSimulating"
          @click="startSimulation"
        >
          {{ isSimulating ? "发送中..." : "发送数据" }}
        </el-button>
        <el-button type="warning" @click="resetToDefault"> 重置数据 </el-button>
      </div>
      <div v-if="choiceType === 'mqtt'">
        <div class="title-text">订阅主题</div>
        <div class="public-topic">
          <span class="topic-text"
            >/intelligent-device/server/{{ appKey }}</span
          >
        </div>
      </div>
      <!-- 新的响应数据展示区域 -->
      <div class="response-section">
        <template v-if="choiceType === 'tcp'">
          <div class="response-column">
            <div class="response-header">
              <span class="response-title">TCP消息数据接口返回：</span>
              <el-tag
                v-if="showResponse"
                :type="tcpMsgResponse.success ? 'success' : 'danger'"
                size="small"
              >
                {{
                  showResponse
                    ? tcpMsgResponse.success
                      ? "请求成功"
                      : "请求失败"
                    : ""
                }}
              </el-tag>
            </div>
            <custom-json-editor
              v-if="showResponse"
              v-model="tcpMsgResponse.data.data"
              height="300"
              :readOnly="true"
              mode="view"
              class="response-editor"
              :key="'tcp-msg-' + Date.now()"
            />
            <el-empty v-else description="暂无响应数据" :image-size="100">
              <template #description>
                <span class="empty-text">点击"发送数据"按钮获取响应</span>
              </template>
            </el-empty>
          </div>

          <div class="response-column">
            <div class="response-header">
              <span class="response-title">TCP发送接口返回：</span>
              <el-tag
                v-if="showResponse"
                :type="tcpSendResponse.success ? 'success' : 'danger'"
                size="small"
              >
                {{
                  showResponse
                    ? tcpSendResponse.success
                      ? "请求成功"
                      : "请求失败"
                    : ""
                }}
              </el-tag>
            </div>
            <custom-json-editor
              v-if="showResponse"
              v-model="tcpSendResponse.data.data"
              height="300"
              :readOnly="true"
              mode="view"
              class="response-editor"
              :key="'tcp-send-' + Date.now()"
            />
            <el-empty v-else description="暂无响应数据" :image-size="100">
              <template #description>
                <span class="empty-text">点击"发送数据"按钮获取响应</span>
              </template>
            </el-empty>
          </div>
        </template>

        <template v-else>
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
        </template>
      </div>
    </div>
  </el-card>

  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="50%"
    align-center
    append-to-body
  >
    <field-form
      v-if="dialogVisible"
      v-model="editForm"
      json-editor-height="300px"
      @change="handleJsonEditorChange"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog
    v-model="jsonEditorVisible"
    title="编辑配置"
    width="800px"
    align-center
    append-to-body
    class="bulk-edit-dialog"
  >
    <custom-json-editor
      v-model="bulkJsonContent"
      height="500px"
      @change="handleBulkJsonChange"
      ref="bulkJsonEditorRef"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="jsonEditorVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBulkJson">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { reactive, ref, watch, nextTick, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CustomJsonEditor from "./JsonEditor.vue";
import FieldForm from "./FieldForm.vue";
import { EditPen, Download, Upload } from "@element-plus/icons-vue";
import {
  deviceTaskReport,
  generateSign,
  mqttSendMsg,
  getTcpMsgData,
  tcpSendMsg,
  getDictDataList,
} from "@/api/auth";
import { v4 as uuidv4 } from "uuid";

export default {
  name: "EquipmentTask",
  components: {
    CustomJsonEditor,
    FieldForm,
  },
  props: {
    choiceType: {
      type: String,
      required: true,
      validator: (value) => ["http", "mqtt", "tcp"].includes(value),
    },
  },
  emits: ["reset-protocol"],
  setup(props, { emit }) {
    const jsonEditor = ref(null);
    const fieldForm = reactive({
      name: "",
      type: "string",
      value: "",
      editorType: "input",
    });

    // 修改校验规则定义的位置，确保它被正确传递
    const formRules = {
      name: [{ required: true, message: "请输入字段名称", trigger: "blur" }],
      type: [{ required: true, message: "请选择字段类型", trigger: "change" }],
      value: [
        {
          validator: (rule, value, callback) => {
            if (fieldForm.type === "json") {
              if (!jsonEditor.value?.editor?.getText()?.trim()) {
                callback(new Error("请输入json字段值"));
              } else {
                callback();
              }
            } else {
              if (!value) {
                callback(new Error("请输入字段值"));
              } else {
                callback();
              }
            }
          },
          trigger: ["blur", "change"],
        },
      ],
    };

    // 修改默认字段定义中的数字类型处理
    const defaultFields = [
      {
        name: "deviceCode",
        type: "string",
        value: "HTW5678",
        isDefault: true,
        required: true,
        editorType: "input",
        placeholder: "请输入设备编号",
        label: "设备编号",
        description: "设备编号",
      },
      {
        name: "extendTaskId",
        type: "string",
        value: "6971656e-cf6b-422e-86a8-2af77762b0bf",
        isDefault: true,
        required: true,
        editorType: "input",
        placeholder: "请输入任务ID",
        label: "任务ID",
        description: "用于标识是同一任务",
      },
      {
        name: "taskType",
        type: "string",
        value: "",
        isDefault: true,
        required: true,
        editorType: "select",
        options: [],
        optionsLabel: {},
        placeholder: "请选择任务类型",
        label: "任务类型",
        description: "具体任务类型需根据接入设备定义",
      },
      {
        name: "taskStatus",
        type: "number",
        value: 1,
        isDefault: true,
        required: true,
        editorType: "select",
        options: [1, 2, 3, 4, 5],
        optionsLabel: {
          1: "执行中/开始执行",
          2: "暂停",
          3: "已完成",
          4: "已取消",
          5: "异常",
        },
        label: "任务状态",
        placeholder: "请选择任务状态",
        description: "任务状态",
      },
      {
        name: "startTime",
        type: "string",
        value: "",
        isDefault: true,
        required: false,
        editorType: "datetime",
        placeholder: "请选择任务开始时间",
        label: "开始时间",
        description:
          "状态为1-执行中/开始执行时，此值才能生效，默认为接口调用时间",
      },
      {
        name: "endTime",
        type: "string",
        value: "",
        isDefault: true,
        required: false,
        editorType: "datetime",
        placeholder: "请选择任务结束时间",
        label: "结束时间",
        description:
          "状态为3-已完成/4-已取消/5-异常时，此值才能生效，默认值为接口调用时间",
      },
      {
        name: "taskDetail",
        type: "string",
        value: "{}",
        isDefault: true,
        required: false,
        editorType: "json",
        label: "任务详情信息",
        description: "任务其他信息（JSON字符串）",
      },
    ];

    const fields = ref([...defaultFields]);
    const fileInput = ref(null);
    const forceUpdate = ref(0);
    // 监听类型变化，当切换到 json 类型时设置模式
    watch(
      () => fieldForm.type,
      (newType) => {
        if (newType === "json") {
          // 等待 DOM 更新后设置模式
          setTimeout(() => {
            if (jsonEditor.value?.editor) {
              jsonEditor.value.editor.setMode("code");
            }
          }, 0);
        }
      }
    );

    // 添加表单引用
    const formRef = ref(null);

    const handleTaskDetailChange = (value) => {
      const taskDetailField = fields.value.find((f) => f.name === "taskDetail");
      if (taskDetailField) {
        // 确保存储为字符串格式
        taskDetailField.value = JSON.stringify(value);

        // 更新 requestParams
        const taskData = { ...requestParams.value };
        taskData.taskDetail = taskDetailField.value;
        requestParams.value = taskData;
      }
    };

    const addField = async () => {
      formRef.value?.validate(async (valid) => {
        if (!valid) return;

        try {
          const extendStatusField = fields.value.find(
            (f) => f.name === "taskDetail"
          );
          if (!extendStatusField) {
            ElMessage.error("未找到 taskDetail 字段");
            return;
          }

          const currentValue = JSON.parse(extendStatusField.value || "{}");
          let fieldValue = fieldForm.value;

          if (fieldForm.type === "json") {
            fieldValue = JSON.parse(
              jsonEditor.value?.editor?.getText() || "{}"
            );
          }

          // 直接修改值，避免触发不必要的重渲染
          const newValue = {
            ...currentValue,
            [fieldForm.name]: fieldValue,
          };

          // 使用 Vue 的 nextTick 来确保状态更新是同步的
          await nextTick();
          extendStatusField.value = JSON.stringify(newValue, null, 2);

          // 重置表单
          formRef.value?.resetFields();
          fieldForm.name = "";
          fieldForm.type = "string";
          fieldForm.value = "";
          fieldForm.editorType = "input";

          ElMessage.success("字段添加成功");
        } catch (e) {
          console.error(e);
          ElMessage.error("操作失败：" + e.message);
        }
      });
    };

    const removeField = (index) => {
      if (!fields.value[index].isDefault) {
        fields.value.splice(index, 1);
      }
    };

    const dialogVisible = ref(false);
    const dialogTitle = ref("编辑字段");
    const currentIndex = ref(null);

    // 使用 reactive 而不是 ref 来管理表单数据
    const editForm = reactive({
      name: "",
      type: "",
      value: null,
    });

    const editField = (index) => {
      currentIndex.value = index;
      const field = fields.value[index];

      // 重置表单数据
      editForm.name = field.name;
      editForm.type = field.type;

      // 处理 JSON 类型的值
      if (field.type === "json") {
        try {
          editForm.value =
            typeof field.value === "string"
              ? JSON.parse(field.value)
              : field.value;
        } catch (e) {
          console.error("JSON parse error:", e);
          editForm.value = {};
        }
      } else {
        editForm.value = field.value;
      }

      dialogTitle.value = "编辑字段";
      dialogVisible.value = true;
    };

    const handleJsonChange = (value) => {
      const taskDetailField = fields.value.find((f) => f.name === "taskDetail");
      if (taskDetailField) {
        // 确保存储为字符串格式
        taskDetailField.value = JSON.stringify(value);

        // 更新 requestParams
        const taskData = { ...requestParams.value };
        taskData.taskDetail = taskDetailField.value;
        requestParams.value = taskData;
      }
    };

    // 添加导出JSON的方法
    const exportToJson = () => {
      const jsonData = {};
      const extendStatus = {};

      fields.value.forEach((field) => {
        try {
          if (field.isDefault) {
            jsonData[field.name] =
              field.type === "json" ? JSON.parse(field.value) : field.value;
          } else {
            extendStatus[field.name] =
              field.type === "json" ? JSON.parse(field.value) : field.value;
          }
        } catch (e) {
          if (field.isDefault) {
            jsonData[field.name] = field.value;
          } else {
            extendStatus[field.name] = field.value;
          }
        }
      });

      jsonData.taskDetail = extendStatus;

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "field-config.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    // 添加JSON编辑相关的响应式变量
    const jsonEditorVisible = ref(false);
    const bulkJsonContent = ref({});
    const bulkJsonEditorRef = ref(null);

    // 打开JSON编辑器
    const openJsonEditor = () => {
      // 将当前字段列表转换为JSON对象
      const jsonData = {};
      fields.value.forEach((field) => {
        try {
          if (field.type === "json") {
            jsonData[field.name] = JSON.parse(field.value);
          } else {
            // 根据字段类型转换值
            switch (field.type) {
              case "number":
                jsonData[field.name] = Number(field.value);
                break;
              case "boolean":
                jsonData[field.name] = field.value === "true";
                break;
              default:
                jsonData[field.name] = field.value;
            }
          }
        } catch (e) {
          console.error(`Error parsing field ${field.name}:`, e);
          jsonData[field.name] = field.value;
        }
      });

      // 直接设置 bulkJsonContent
      bulkJsonContent.value = jsonData;

      // 打开对话框
      jsonEditorVisible.value = true;
    };

    // 处理JSON变化
    const handleBulkJsonChange = (value) => {
      bulkJsonContent.value = value;
    };

    // 保存JSON编辑结果
    const saveBulkJson = () => {
      try {
        const jsonData = bulkJsonContent.value;
        const defaultFieldNames = defaultFields.map((f) => f.name);
        const newFields = [];

        // 处理默认字段
        defaultFields.forEach((defaultField) => {
          if (jsonData[defaultField.name] !== undefined) {
            newFields.push({
              ...defaultField,
              value:
                typeof jsonData[defaultField.name] === "object"
                  ? JSON.stringify(jsonData[defaultField.name], null, 2)
                  : String(jsonData[defaultField.name]),
            });
          } else {
            newFields.push(defaultField);
          }
        });

        // 处理自定义字段（非默认字段）
        Object.entries(jsonData).forEach(([key, value]) => {
          if (!defaultFieldNames.includes(key)) {
            const type = typeof value;
            newFields.push({
              name: key,
              type: type === "object" ? "json" : type,
              value:
                type === "object"
                  ? JSON.stringify(value, null, 2)
                  : String(value),
              isDefault: false,
            });
          }
        });

        // 更新字段列表
        fields.value = newFields;

        jsonEditorVisible.value = false;
        ElMessage.success("配置已更新");
      } catch (error) {
        ElMessage.error("保存失败：" + error.message);
        console.error(error);
      }
    };

    // 添加导入方法
    const importJson = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const jsonData = JSON.parse(e.target.result);
              const newFields = Object.entries(jsonData).map(
                ([key, value]) => ({
                  name: key,
                  type: typeof value === "object" ? "json" : typeof value,
                  value:
                    typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value),
                  isDefault: false,
                })
              );

              fields.value = newFields;
              ElMessage.success("配置导入成功");
            } catch (error) {
              ElMessage.error("JSON 格式错误，请检查文件内容");
              console.error(error);
            }
          };
          reader.readAsText(file);
        }
      };

      input.click();
    };

    // 添加模拟状态控制
    const isSimulating = ref(false);

    // 添加响应数据相关的响应式变量
    const responseData = ref({});
    const responseJsonEditorRef = ref(null);
    const lastResponse = ref(null);

    // 添加新的响应式变量
    const showResponse = ref(false);
    const requestParams = ref({});
    const tcpMsgResponse = ref({
      success: false,
      data: null,
    });
    const tcpSendResponse = ref({
      success: false,
      data: null,
    });

    const formattedResponseData = computed({
      get: () => {
        return props.choiceType === "http"
          ? lastResponse.value.data
          : lastResponse.value.data?.data;
      },
      set: (val) => {
        if (props.choiceType === "http") {
          lastResponse.value.data = val;
        } else {
          if (lastResponse.value.data) {
            lastResponse.value.data.data = val;
          }
        }
      },
    });

    const startSimulation = async () => {
      if (isSimulating.value) return;

      // 检查必要的认证信息
      const appKey = localStorage.getItem("appKey");
      const appSecret = localStorage.getItem("appSecret");

      if (!appKey || !appSecret) {
        ElMessage.error("未找到认证信息,请先配置appKey和appSecret");
        emit("reset-protocol");
        return;
      }

      try {
        isSimulating.value = true;
        showResponse.value = false; // 重置响应显示状态
        const deviceData = fields.value.reduce((acc, field) => {
          try {
            if (field.type === "number") {
              acc[field.name] = Number(field.value);
            } else if (field.type === "json") {
              acc[field.name] = field.value;
            } else {
              acc[field.name] = field.value;
            }
          } catch (e) {
            console.error(`Error processing field ${field.name}:`, e);
            acc[field.name] = field.value;
          }
          return acc;
        }, {});

        // 设置请求参数显示
        requestParams.value = deviceData;

        let response;
        const timestamp = Date.now();
        const mqttParams = {
          appKey: localStorage.getItem("appKey"),
          data: JSON.stringify(deviceData),
          msgId: uuidv4(),
          msgType: "deviceTaskReport",
          sign: generateSign(timestamp),
          timestamp: timestamp,
        };

        switch (props.choiceType) {
          case "http":
            response = await deviceTaskReport(deviceData);
            break;

          case "mqtt":
            response = await mqttSendMsg(mqttParams);
            break;

          case "tcp": {
            // 获取TCP消息数据
            const tcpParams = {
              appKey: localStorage.getItem("appKey"),
              messageText: JSON.stringify(deviceData),
              type: 7, // 设备任务上报的类型为7
            };
            const tcpMsgResult = await getTcpMsgData(tcpParams);
            tcpMsgResponse.value = {
              success: tcpMsgResult.code === 200,
              data: tcpMsgResult,
            };

            // 发送TCP消息
            const tcpSendResult = await tcpSendMsg({
              dataHexStr: tcpMsgResult.data.dataHexStr,
            });
            tcpSendResponse.value = {
              success: tcpSendResult.code === 200,
              data: tcpSendResult,
            };
            break;
          }

          default:
            throw new Error("不支持的协议类型");
        }

        if (props.choiceType !== "tcp") {
          lastResponse.value = {
            success: response.code === 200,
            data: {
              code: response.code,
              msg: response.msg,
              data: response.data,
            },
          };
        }
        showResponse.value = true;
      } catch (error) {
        console.error("发送数据错误:", error);
        lastResponse.value = {
          success: false,
          data: {
            code: error.response?.data?.code,
            msg: error.message || "发送数据失败",
            data: null,
          },
        };
        showResponse.value = true;
      } finally {
        isSimulating.value = false;
      }
    };

    const newFaultCode = ref("");

    const addFaultCode = (row) => {
      if (!newFaultCode.value.trim()) return;

      const codes = JSON.parse(row.value);
      if (!codes.includes(newFaultCode.value)) {
        codes.push(newFaultCode.value);
        row.value = JSON.stringify(codes);
      }
      newFaultCode.value = "";
    };

    const removeFaultCode = (row, codeToRemove) => {
      const codes = JSON.parse(row.value);
      const index = codes.indexOf(codeToRemove);
      if (index > -1) {
        codes.splice(index, 1);
        row.value = JSON.stringify(codes);
      }
    };

    const resetToDefault = () => {
      ElMessageBox.confirm("确定要重置所有数据到初始状态吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          fields.value = defaultFields.map((field) => ({
            ...field,
            value:
              field.name === "deviceCode"
                ? ""
                : field.name === "extendTaskId"
                ? ""
                : field.name === "taskType"
                ? ""
                : field.name === "taskStatus"
                ? ""
                : field.name === "startTime"
                ? ""
                : field.name === "endTime"
                ? ""
                : field.name === "taskDetail"
                ? "{}"
                : field.value,
          }));
          showResponse.value = false; // 重置响应显示状态
          ElMessage({
            type: "success",
            message: "数据已重置",
          });
        })
        .catch(() => {
          // 用户取消操作
        });
    };

    // 添加 resetFields 函数
    const resetFields = () => {
      formRef.value?.resetFields();
      fieldForm.name = "";
      fieldForm.type = "string";
      fieldForm.value = "";
    };

    // 添加 saveEdit 函数
    const saveEdit = () => {
      if (currentIndex.value !== null) {
        const field = fields.value[currentIndex.value];

        // 更新字段值
        field.name = editForm.name;
        field.type = editForm.type;
        field.value =
          editForm.type === "json"
            ? JSON.stringify(editForm.value, null, 2)
            : editForm.value;

        dialogVisible.value = false;
      }
    };

    // 添加监听 fields 的变化
    watch(
      () => fields.value,
      (newFields) => {
        const taskData = {};

        // 处理默认字段
        newFields.forEach((field) => {
          if (field.isDefault) {
            try {
              switch (field.type) {
                case "number":
                  taskData[field.name] = parseInt(field.value);
                  break;
                case "json":
                  taskData[field.name] = JSON.parse(field.value);
                  break;
                default:
                  taskData[field.name] = field.value;
              }
            } catch (e) {
              taskData[field.name] = field.value;
            }
          }
        });

        // 更新请求参数
        requestParams.value = taskData;
      },
      {
        deep: true,
        immediate: true, // 确保初始化时就执行
      }
    );

    // 添加监听 taskDetail 变化的 watch
    watch(
      () => fields.value.find((f) => f.name === "taskDetail")?.value,
      (newValue) => {
        if (newValue) {
          try {
            // 确保值是一个有效的 JSON 字符串
            const parsedValue =
              typeof newValue === "string" ? JSON.parse(newValue) : newValue;
            // 更新 taskDetail 字段的显示
            const taskDetailField = fields.value.find(
              (f) => f.name === "taskDetail"
            );
            if (taskDetailField) {
              taskDetailField.value = JSON.stringify(parsedValue, null, 2);
            }
          } catch (e) {
            console.error("Error updating taskDetail:", e);
          }
        }
      },
      { deep: true }
    );

    // 在 setup 中添加获取任务类型的方法
    const fetchTaskTypes = async () => {
      try {
        const response = await getDictDataList("device_task_type");
        if (response.code === 200 && response.data) {
          // 找到 taskType 字段
          const taskTypeField = fields.value.find((f) => f.name === "taskType");
          if (taskTypeField) {
            // 更新选项 - 使用 dictValue 作为值
            taskTypeField.options = response.data.map((item) => item.dictValue);
            // 更新显示标签 - 使用 dictLabel 作为显示文本
            taskTypeField.optionsLabel = response.data.reduce((acc, item) => {
              acc[item.dictValue] = item.dictLabel;
              return acc;
            }, {});

            // 如果当前没有值,设置第一个选项为默认值
            if (!taskTypeField.value && taskTypeField.options.length > 0) {
              taskTypeField.value = taskTypeField.options[0];
            }
          }
        }
      } catch (error) {
        console.error("获取任务类型失败:", error);
        ElMessage.error("获取任务类型列表失败");
      }
    };

    // 在 onMounted 中调用
    onMounted(() => {
      fetchTaskTypes();
    });

    // 添加 appKey 定义
    const appKey = ref(localStorage.getItem("appKey") || "");

    return {
      fieldForm,
      fields,
      fileInput,
      jsonEditor,
      addField,
      removeField,
      editField,
      resetFields,
      dialogVisible,
      editForm,
      saveEdit,
      formRef,
      formRules,
      handleJsonChange,
      exportToJson,
      EditPen,
      jsonEditorVisible,
      bulkJsonContent,
      bulkJsonEditorRef,
      openJsonEditor,
      handleBulkJsonChange,
      saveBulkJson,
      importJson,
      Upload,
      Download,
      dialogTitle,
      isSimulating,
      startSimulation,
      newFaultCode,
      addFaultCode,
      removeFaultCode,
      resetToDefault,
      responseData,
      responseJsonEditorRef,
      handleTaskDetailChange,
      forceUpdate,
      lastResponse,
      fetchTaskTypes,
      showResponse,
      requestParams,
      tcpMsgResponse,
      tcpSendResponse,
      formattedResponseData,
      appKey,
    };
  },
};
</script>

<style lang="scss" scoped>
// 变量定义
$border-color: #ebeef5;
$text-color: #606266;
$spacing-base: 10px;
$spacing-lg: 20px;

// Mixins
@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@mixin flex-gap($gap: $spacing-base) {
  display: flex;
  gap: $gap;
}

// 主要样式
.box-card {
  overflow: hidden;

  .header-section {
    @include flex-between;
    margin-bottom: $spacing-lg;
  }
}

.field-config-card {
  margin: $spacing-lg 0;

  :deep(.el-card__body) {
    padding: $spacing-lg;
  }
}
.button-group {
  @include flex-gap;
  margin-top: $spacing-lg;
  padding-top: $spacing-lg;
  border-top: 1px solid $border-color;
  margin-left: 120px;
}

.table-header {
  @include flex-between;
  margin: $spacing-lg 0;
  padding-bottom: $spacing-base;
  border-bottom: 1px solid $border-color;

  h3 {
    margin: 0;
    font-size: 16px;
    color: $text-color;
  }

  .table-actions {
    @include flex-gap;
    align-items: center;
  }
}

.json-editor {
  height: 200px;
  width: 100%;
}

.edit-json-editor {
  height: 500px;
  width: 100%;

  :deep(.jsoneditor-vue) {
    height: 500px !important;
  }
}

.default-tag {
  color: #909399;
  font-size: 12px;
}

// Dialog 相关样式
:deep(.el-dialog__body) {
  padding: $spacing-lg;
}

// Table 相关样式
.el-table {
  width: 100% !important;
  overflow: hidden;
}

.bulk-edit-dialog {
  :deep(.jsoneditor-vue) {
    height: 500px !important;
  }
}

.field-form-card {
  margin: $spacing-base 0;

  :deep(.el-card__body) {
    padding: $spacing-lg;
  }
}

.simulation-controls {
  margin-top: 20px;
  padding: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .simulation-actions {
    display: flex;
    justify-content: center;
    gap: 20px;

    .el-button {
      min-width: 120px;
    }
  }

  .response-section {
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
    }
  }
}

.required-field {
  color: #f56c6c;
  margin-left: 4px;
}

.fault-codes-container {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .fault-code-tag {
    margin: 2px;
  }
}

.custom-field-title {
  position: relative;
  margin-bottom: 20px;
}

.response-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}
.title-text {
  position: relative;
  display: inline-block;
  padding: 0 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  background: #fff;
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    width: 4px;
    height: 16px;
    background: #409eff;
    transform: translateY(-50%);
    border-radius: 2px;
  }
}
// 添加 taskDetail 编辑器的样式
:deep(.jsoneditor-vue) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.json-editor-wrapper {
  position: relative;
  width: 100%;
}

.stable-json-editor {
  :deep(.jsoneditor-vue) {
    height: 100%;

    .jsoneditor {
      height: 100%;
    }
  }
}

.el-table {
  :deep(.el-table__body-wrapper) {
    .cell {
      height: auto;
    }
  }
}

// 添加 MQTT 主题相关样式
.public-topic {
  margin: 10px 0;
  background: #f0f0f0;
  display: block;
  padding: 4px 12px;
  border-radius: 4px;
  width: fit-content;
}

.topic-text {
  color: #606266;
  font-size: 14px;
  font-family: monospace;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

.response-section {
  .response-column {
    :deep(.el-empty) {
      padding: 40px 0;
    }
  }
}
</style> 