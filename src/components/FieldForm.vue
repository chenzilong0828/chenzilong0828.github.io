<template>
  <el-form :model="form" :rules="rules" label-width="120px">
    <el-form-item
      label="字段名称"
      prop="name"
      :rules="[{ required: true, message: '请输入字段名称', trigger: 'blur' }]"
    >
      <el-input v-model="form.name" placeholder="字段名称" />
    </el-form-item>

    <el-form-item label="字段类型" prop="type">
      <el-select v-model="form.type" placeholder="选择字段类型">
        <el-option label="数字" value="number" />
        <el-option label="字符串" value="string" />
        <el-option label="布尔值" value="boolean" />
        <el-option label="JSON" value="json" />
      </el-select>
    </el-form-item>

    <el-form-item label="字段值" prop="value">
      <template v-if="form.type === 'json'">
        <custom-json-editor
          v-model="form.value"
          :height="jsonEditorHeight"
          @change="handleJsonChange"
        />
      </template>
      <el-input v-else v-model="form.value" placeholder="字段值" />
    </el-form-item>
  </el-form>
</template>

<script>
import { defineComponent, computed } from "vue";
import CustomJsonEditor from "./JsonEditor.vue";

export default defineComponent({
  name: "FieldForm",
  components: {
    CustomJsonEditor,
  },
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    jsonEditorHeight: {
      type: String,
      default: "200px",
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const form = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const handleJsonChange = (value) => {
      emit("change", value);
    };

    return {
      form,
      handleJsonChange,
    };
  },
});
</script> 