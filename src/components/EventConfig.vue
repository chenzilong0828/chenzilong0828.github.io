<template>
  <el-card class="box-card">
    <h2>模拟事件数据配置</h2>
    <el-form :model="eventForm" label-width="120px">
      <el-form-item label="事件名称" prop="name" required>
        <el-input
          v-model="eventForm.name"
          placeholder="请输入事件名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="事件数据" prop="data" required>
        <json-editor
          ref="jsonEditor"
          v-model="eventForm.data"
          :options="editorOptions"
          style="width: 100%"
          @error="(error) => ElMessage.error('JSON格式错误: ' + error)"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addEvent">添加事件</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="events" style="width: 100%">
      <el-table-column prop="name" label="名称" width="180"></el-table-column>
      <el-table-column prop="data" label="数据">
        <template #default="scope">
          <pre>{{ JSON.stringify(scope.row.data, null, 2) }}</pre>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button
            type="danger"
            size="small"
            @click="removeEvent(scope.$index)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import { ref, onMounted } from "vue";
import JsonEditor from "vue-json-editor";
import { ElMessage } from "element-plus";

export default {
  name: "EventConfig",
  components: {
    JsonEditor,
  },
  setup() {
    const eventForm = ref({
      name: "",
      data: {},
    });
    const events = ref([]);
    const jsonEditor = ref(null);
    const editorOptions = {
      mode: "tree",
      modes: ["code", "tree"],
      mainMenuBar: false,
      statusBar: false,
    };

    const addEvent = () => {
      // 添加日志调试
      console.log("添加事件被触发", eventForm.value);

      // 检查数据是否有效
      if (!eventForm.value.name.trim()) {
        ElMessage.warning("请输入事件名称");
        return;
      }

      try {
        // 从 jsonEditor 获取数据
        const jsonData = jsonEditor.value.editor.getText();
        const eventData = JSON.parse(jsonData);

        events.value.push({
          name: eventForm.value.name,
          data: eventData,
        });

        // 清空表单
        eventForm.value.name = "";
        eventForm.value.data = {};

        // 提示成功
        ElMessage.success("事件添加成功");
      } catch (error) {
        console.error("添加事件失败:", error);
        ElMessage.error("事件数据格式无效");
      }
    };

    const removeEvent = (index) => {
      events.value.splice(index, 1);
      ElMessage.success("事件删除成功");
    };

    onMounted(() => {
      if (jsonEditor.value && jsonEditor.value.editor) {
        jsonEditor.value.editor.setMode("code");

        // 使用setTimeout确保DOM完全加载
        setTimeout(() => {
          const poweredBy = document.querySelector(".jsoneditor-poweredBy");
          const modes = document.querySelector(".jsoneditor-modes");

          if (poweredBy) poweredBy.style.display = "none";
          if (modes) modes.style.display = "none";
        }, 100);
      }
    });

    return {
      eventForm,
      events,
      addEvent,
      removeEvent,
      editorOptions,
      jsonEditor,
    };
  },
};
</script>

<style scoped>
.box-card {
  margin: 20px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}
</style> 