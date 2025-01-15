<template>
  <SimulationConfig />
</template>

<script>
import SimulationConfig from "./components/SimulationConfig.vue";

export default {
  name: "App",
  components: {
    SimulationConfig,
  },
};
</script>

<style>
#particles-js {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  background: linear-gradient(45deg, #0f0c29, #302b63, #24243e);
}
</style>
