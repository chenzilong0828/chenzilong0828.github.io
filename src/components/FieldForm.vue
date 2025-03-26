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
        <!-- <el-option label="JSON" value="json" /> -->
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
      <el-input-number
        v-else-if="form.type === 'number'"
        v-model="form.value"
        :controls="true"
        placeholder="请输入数字"
      />
      <el-select
        v-else-if="form.type === 'boolean'"
        v-model="form.value"
        placeholder="请选择布尔值"
      >
        <el-option :label="'true'" :value="true" />
        <el-option :label="'false'" :value="false" />
      </el-select>
      <el-input v-else v-model="form.value" placeholder="字段值" />
    </el-form-item>
  </el-form>
</template>

<script>
import { defineComponent, computed, watch } from "vue";
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
    rules: {
      type: Object,
      default: () => ({}),
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

    // 监听类型变化，更新字段值
    watch(
      () => form.value.type,
      (newType) => {
        let defaultValue;
        switch (newType) {
          case "number":
            defaultValue = 0;
            break;
          case "boolean":
            defaultValue = false;
            break;
          case "json":
            defaultValue = {};
            break;
          default:
            defaultValue = "";
        }
        form.value = { ...form.value, value: defaultValue };
      }
    );

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