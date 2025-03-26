<template>
  <div class="custom-json-editor">
    <json-editor
      ref="jsonEditorRef"
      v-model="localValue"
      :mode="editorMode"
      lang="zh"
      :options="editorOptions"
      class="json-editor"
    />
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from "vue";
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
    readOnly: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "code",
      validator: (value) => ["code", "view", "tree"].includes(value),
    },
  },
  emits: ["update:modelValue", "change", "error"],
  setup(props, { emit }) {
    const jsonEditorRef = ref(null);
    const localValue = ref(props.modelValue);

    const defaultOptions = {
      mode: "code",
      modes: ["code"],
      mainMenuBar: false,
      statusBar: false,
      search: false,
      enableSort: false,
      enableTransform: false,
    };

    const editorOptions = computed(() => ({
      ...defaultOptions,
      ...props.options,
      readOnly: props.readOnly,
      indentation: 2,
    }));

    const editorMode = computed(() => {
      // 即使在只读模式下也保持 code 显示方式
      return "code";
    });

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

    onMounted(() => {
      nextTick(() => {
        if (jsonEditorRef.value?.editor) {
          const editor = jsonEditorRef.value.editor;
          const initialValue = formatValue(props.modelValue);
          editor.set(initialValue);

          if (editor.aceEditor) {
            // 只在编辑器失焦时触发更新
            editor.aceEditor.on("blur", () => {
              try {
                const value = editor.get();
                const parsedValue =
                  typeof value === "string" ? JSON.parse(value) : value;
                if (typeof parsedValue === "object" && parsedValue !== null) {
                  emit("update:modelValue", parsedValue);
                  emit("change", parsedValue);
                }
              } catch (error) {
                console.warn("JSON parse error:", error);
                emit("error", error);
              }
            });
          }

          // 禁用编辑器（如果是只读模式）
          if (props.readOnly) {
            if (editor.aceEditor) {
              editor.aceEditor.setReadOnly(true);
              editor.aceEditor.renderer.setShowGutter(false);
              editor.aceEditor.textInput.getElement().disabled = true;
            }
          }

          // 隐藏不需要的元素
          const container = editor.container;
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
      editorMode,
    };
  },
};
</script>

<style lang="scss" scoped>
.custom-json-editor {
  width: 100%;

  :deep(.jsoneditor-vue) {
    height: v-bind("height + 'px'") !important;

    .jsoneditor {
      border: none;
    }

    .ace-jsoneditor {
      min-height: 100%;
    }

    .ace_editor {
      min-height: 100%;
    }

    .ace_content {
    }

    .ace_scroller {
      min-width: 100%;
      overflow: auto !important;

      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    }

    .ace_print-margin {
      display: none !important;
    }

    // 确保文本不会被截断
    .ace_line {
      white-space: pre !important;
      width: max-content !important;
    }
  }
}
</style> 