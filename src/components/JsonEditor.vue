<template>
  <div class="custom-json-editor">
    <json-editor
      ref="jsonEditorRef"
      v-model="localValue"
      mode="code"
      lang="zh"
      :options="editorOptions"
      class="json-editor"
      @change="handleChange"
    />
  </div>
</template>

<script>
import { ref, watch, onMounted, nextTick } from "vue";
import JsonEditor from "vue-json-editor";

export default {
  name: "CustomJsonEditor",
  components: {
    JsonEditor,
  },
  props: {
    modelValue: {
      type: [String, Object],
      default: () => ({}),
    },
    height: {
      type: [String, Number],
      default: "200px",
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue", "change", "error"],
  setup(props, { emit }) {
    const jsonEditorRef = ref(null);
    const localValue = ref(props.modelValue);

    const defaultOptions = {
      modes: ["code", "tree"],
      mainMenuBar: false,
      statusBar: false,
    };

    const editorOptions = {
      ...defaultOptions,
      ...props.options,
    };

    // 格式化 JSON 数据
    const formatValue = (value) => {
      if (!value) return {};
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn("Invalid JSON string:", e);
          return {};
        }
      }
      return value;
    };

    // 监听外部值变化
    watch(
      () => props.modelValue,
      (newVal) => {
        localValue.value = formatValue(newVal);
      },
      { immediate: true }
    );

    // 处理编辑器值变化
    const handleChange = (value) => {
      try {
        const parsedValue =
          typeof value === "string" ? JSON.parse(value) : value;
        emit("update:modelValue", parsedValue);
        emit("change", parsedValue);
      } catch (error) {
        console.warn("JSON parse error:", error);
        emit("error", error);
      }
    };

    onMounted(() => {
      nextTick(() => {
        if (jsonEditorRef.value?.editor) {
          // 初始化时设置一个有效的 JSON
          const initialValue = formatValue(props.modelValue);
          jsonEditorRef.value.editor.set(initialValue);
          jsonEditorRef.value.editor.format();

          // 隐藏不需要的元素
          const container = jsonEditorRef.value.editor.container;
          const poweredBy = container.querySelector(".jsoneditor-poweredBy");
          const modes = container.querySelector(".jsoneditor-modes");
          if (poweredBy) poweredBy.style.display = "none";
          if (modes) modes.style.display = "none";
        }
      });
    });

    return {
      jsonEditorRef,
      localValue,
      editorOptions,
      handleChange,
    };
  },
};
</script>

<style lang="scss" scoped>
.custom-json-editor {
  width: 100%;

  :deep(.jsoneditor-vue) {
    height: v-bind("height") !important;
  }
}
</style> 