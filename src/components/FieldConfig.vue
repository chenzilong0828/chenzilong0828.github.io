<template>
  <el-card class="box-card">
    <div class="header-section">
      <h2>实时数据字段配置</h2>
    </div>

    <el-form
      :model="fieldForm"
      :rules="rules"
      label-width="120px"
      ref="formRef"
    >
      <el-form-item label="类型选择" prop="protocol">
        <el-radio-group v-model="fieldForm.protocol">
          <el-radio :value="'tcp'">TCP</el-radio>
          <el-radio :value="'http'">HTTP</el-radio>
          <el-radio :value="'mqtt'">MQTT</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="发送周期" prop="interval">
        <div class="interval-config">
          <el-input-number
            v-model="sendInterval"
            :min="1"
            placeholder="发送间隔（毫秒）"
            class="input-group"
          ></el-input-number>
          <span class="interval-unit">分钟</span>
        </div>
      </el-form-item>

      <el-card class="field-form-card" shadow="hover">
        <field-form v-model="fieldForm" @change="handleJsonChange" />

        <div class="button-group">
          <el-button type="primary" @click="addField">添加字段</el-button>
          <el-button type="warning" @click="resetFields">初始化</el-button>
        </div>
      </el-card>
    </el-form>

    <div class="table-header">
      <h3>字段列表</h3>
      <div class="table-actions">
        <el-button
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
        </el-button>
      </div>
    </div>

    <el-table
      :data="fields"
      style="width: 100%"
      table-layout="fixed"
      :max-height="500"
    >
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="type" label="类型"></el-table-column>
      <el-table-column prop="value" label="值">
        <template #default="scope">
          <pre>{{ scope.row.value }}</pre>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-button
              v-if="!scope.row.isDefault"
              type="default"
              size="small"
              @click="editField(scope.$index)"
            >
              编辑
            </el-button>
            <el-button
              v-if="!scope.row.isDefault"
              type="danger"
              size="small"
              @click="removeField(scope.$index)"
            >
              删除
            </el-button>
            <span v-else class="default-tag">默认字段</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
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
import { reactive, ref, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import CustomJsonEditor from "./JsonEditor.vue";
import FieldForm from "./FieldForm.vue";
import { EditPen, Download, Upload } from "@element-plus/icons-vue";

export default {
  name: "FieldConfig",
  components: {
    CustomJsonEditor,
    FieldForm,
  },
  setup() {
    const jsonEditor = ref(null);
    const fieldForm = reactive({
      protocol: "tcp",
      name: "",
      type: "json",
      value: "",
    });

    // 定义默认字段
    const defaultFields = [
      {
        name: "固定的字段1",
        type: "string",
        value: "TCP Value 1",
        isDefault: true,
      },
      { name: "固定的字段2", type: "number", value: "100", isDefault: true },
    ];

    const fields = ref([...defaultFields]);
    const fileInput = ref(null);
    // 在组件加载时根据默认协议更新字段
    onMounted(() => {
      updateDefaultFields(fieldForm.protocol);
      document.getElementsByClassName("jsoneditor-poweredBy")[0].style.display =
        "none";
      document.getElementsByClassName("jsoneditor-modes")[0].style.display =
        "none";
    });
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

    // 监听协议类型变化，当切换到不同协议时更新默认字段
    watch(
      () => fieldForm.protocol,
      (newProtocol) => {
        updateDefaultFields(newProtocol);
      }
    );

    // 新增方法：根据协议更新默认字段
    const updateDefaultFields = (protocol) => {
      const protocolBasedFields = {
        tcp: [
          {
            name: "tcpField1",
            type: "string",
            value: "TCP Value 1",
            isDefault: true,
          },
          { name: "tcpField2", type: "number", value: "100", isDefault: true },
        ],
        http: [
          {
            name: "httpField1",
            type: "string",
            value: "HTTP Value 1",
            isDefault: true,
          },
          {
            name: "httpField2",
            type: "boolean",
            value: "true",
            isDefault: true,
          },
        ],
        mqtt: [
          {
            name: "mqttField1",
            type: "string",
            value: "MQTT Value 1",
            isDefault: true,
          },
          { name: "mqttField2", type: "number", value: "200", isDefault: true },
        ],
      };

      fields.value = [...protocolBasedFields[protocol], ...defaultFields];
    };

    // 修改校验规则
    const rules = {
      name: [{ required: true, message: "请输入字段名称", trigger: "blur" }],
      type: [{ required: true, message: "请选择字段类型", trigger: "change" }],
      value: [
        {
          validator: (rule, value, callback) => {
            if (fieldForm.type === "json") {
              // JSON类型时，检查json-editor的值
              if (!jsonEditor.value?.editor?.getText()?.trim()) {
                callback(new Error("请输入json字段值"));
              } else {
                callback();
              }
            } else {
              // 其他类型时，检查普通input的值
              if (!value) {
                callback(new Error("请输入普通字段值"));
              } else {
                callback();
              }
            }
          },
          trigger: ["blur", "change"],
        },
      ],
    };

    // 添加表单引用
    const formRef = ref(null);

    // 修改 addField 函数
    const addField = () => {
      formRef.value?.validate((valid) => {
        if (!valid) {
          return;
        }

        // JSON类型时进行格式校验
        if (fieldForm.type === "json") {
          if (!validateJSON(jsonEditor.value.editor)) {
            ElMessage({
              message: "JSON 格式不正确，请检查后重试",
              type: "error",
              duration: 3000,
            });
            return;
          }
        }

        fields.value.push({
          name: fieldForm.name,
          type: fieldForm.type,
          value:
            fieldForm.type === "json"
              ? jsonEditor.value.editor.getText()
              : fieldForm.value,
        });

        // 重置表单
        formRef.value?.resetFields();
        fieldForm.name = "";
        fieldForm.type = "string";
        fieldForm.value = "";
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

    const validateJSON = (jsonEditor) => {
      try {
        const jsonText = jsonEditor.getText();
        JSON.parse(jsonText);
        return true;
      } catch (error) {
        return false;
      }
    };

    const saveEdit = () => {
      if (currentIndex.value !== null) {
        const updatedField = {
          name: editForm.name,
          type: editForm.type,
          value:
            editForm.type === "json"
              ? JSON.stringify(editForm.value, null, 2)
              : editForm.value,
        };

        fields.value[currentIndex.value] = updatedField;
        dialogVisible.value = false;

        // 可选：清空表单
        Object.assign(editForm, {
          name: "",
          type: "",
          value: null,
        });
      }
    };

    const resetFields = () => {
      // 重置表单
      fieldForm.name = "";
      fieldForm.value = "";
      fieldForm.type = "number"; // 重置为默认类型
      fieldForm.protocol = "tcp"; // 重置为默认协议

      // 重置表格数据
      fields.value = [...defaultFields]; // 恢复默认字段
      updateDefaultFields(fieldForm.protocol);
    };

    const editJsonEditor = ref(null);

    const handleJsonEditorChange = (value) => {
      editForm.value = value;
    };

    const handleJsonChange = (value) => {
      fieldForm.value = value; // 将 json-editor 的值同步到表单的 value 字段
      // 手动触发表单验证
      formRef.value?.validateField("value");
    };

    // 添加发送周期的响应式变量
    const sendInterval = ref(60);

    // 添加导出JSON的方法
    const exportToJson = () => {
      const jsonData = {};
      fields.value.forEach((field) => {
        try {
          jsonData[field.name] =
            field.type === "json" ? JSON.parse(field.value) : field.value;
        } catch (e) {
          jsonData[field.name] = field.value;
        }
      });

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
        const newFields = Object.entries(bulkJsonContent.value).map(
          ([key, value]) => {
            const type = typeof value;
            return {
              name: key,
              type: type === "object" ? "json" : type,
              value:
                type === "object"
                  ? JSON.stringify(value, null, 2)
                  : String(value),
              isDefault: false,
            };
          }
        );

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
      editJsonEditor,
      handleJsonEditorChange,
      formRef,
      rules,
      handleJsonChange,
      sendInterval,
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

.interval-config {
  @include flex-gap;
  align-items: center;

  .interval-unit {
    color: $text-color;
  }
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
</style> 