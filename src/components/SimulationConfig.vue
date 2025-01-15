<template>
  <div id="particles-js"></div>
  <div class="container">
    <div class="cyber-corner top-left"></div>
    <div class="cyber-corner top-right"></div>
    <div class="cyber-corner bottom-left"></div>
    <div class="cyber-corner bottom-right"></div>
    <div class="scan-lines"></div>
    <div class="glitch-wrapper">
      <h1 class="cyber-glitch" data-text="数据模拟配置界面">
        数据模拟配置界面
      </h1>
      <div class="digital-rain"></div>
    </div>
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="实时数据字段配置" name="field">
        <FieldConfig v-if="activeTab === 'field'" />
      </el-tab-pane>
      <el-tab-pane label="模拟事件数据配置" name="event">
        <EventConfig v-if="activeTab === 'event'" />
      </el-tab-pane>
      <el-tab-pane label="模拟故障数据配置" name="fault">
        <FaultConfig v-if="activeTab === 'fault'" />
      </el-tab-pane>
      <el-tab-pane label="模拟任务类型配置" name="task">
        <TaskConfig v-if="activeTab === 'task'" />
      </el-tab-pane>
    </el-tabs>
    <div class="button-group">
      <el-button class="custom-button glow start-btn" @click="startSimulation"
        >开始模拟</el-button
      >
      <el-button class="custom-button warning" @click="stopSimulation"
        >停止模拟</el-button
      >
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import FieldConfig from "./FieldConfig.vue";
import EventConfig from "./EventConfig.vue";
import FaultConfig from "./FaultConfig.vue";
import TaskConfig from "./TaskConfig.vue";
import { ElTabs, ElTabPane, ElButton } from "element-plus";
import "particles.js";
import gsap from "gsap";
import MouseFollower from "mouse-follower";

// 将 GSAP 注册到 MouseFollower
MouseFollower.registerGSAP(gsap);

export default {
  name: "SimulationConfig",
  components: {
    FieldConfig,
    EventConfig,
    FaultConfig,
    TaskConfig,
    ElTabs,
    ElTabPane,
    ElButton,
  },
  setup() {
    const activeTab = ref("field");
    let cursor = null;

    const startSimulation = () => {
      console.log("Simulation started");
      // 添加炫酷的开始动画
      gsap
        .timeline()
        .to(".custom-button.glow", {
          scale: 1.1,
          duration: 0.2,
        })
        .to(".custom-button.glow", {
          scale: 1,
          duration: 0.1,
        })
        .to(".container", {
          boxShadow: "0 0 50px rgba(0, 255, 255, 0.8)",
          duration: 0.3,
          yoyo: true,
          repeat: 1,
        });
    };

    const stopSimulation = () => {
      console.log("Simulation stopped");
      // 添加停止动画
      gsap
        .timeline()
        .to(".custom-button.warning", {
          scale: 1.1,
          duration: 0.2,
        })
        .to(".custom-button.warning", {
          scale: 1,
          duration: 0.1,
        })
        .to(".container", {
          boxShadow: "0 0 50px rgba(255, 62, 62, 0.8)",
          duration: 0.3,
          yoyo: true,
          repeat: 1,
        });
    };

    onMounted(() => {
      window.particlesJS("particles-js", {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: 0.5, random: false },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 6,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 },
          },
        },
        retina_detect: true,
      });

      nextTick(() => {
        cursor = new MouseFollower({
          container: document.body,
          speed: 0.7,
          ease: "expo.out",
          skewing: 2,
          className: "mf-cursor",
          innerClassName: "mf-cursor-inner",
          textClassName: "mf-cursor-text",
          mediaClassName: "mf-cursor-media",
          mediaBoxClassName: "mf-cursor-media-box",
          textStyle: {
            color: "#000",
            mixBlendMode: "normal",
          },
          stateDetection: {
            "-pointer": "a,button,.el-button,.el-tabs__item",
            "-hidden": "iframe",
          },
        });

        const startBtn = document.querySelector(".start-btn");
        if (startBtn) {
          startBtn.addEventListener("mouseenter", () => {
            cursor.setText("启动");
            cursor.addState("-danger -lg");
            gsap.to(startBtn, {
              scale: 1.1,
              duration: 0.3,
              ease: "power2.out",
            });
          });

          startBtn.addEventListener("mouseleave", () => {
            cursor.removeText();
            cursor.removeState("-danger -lg");
            gsap.to(startBtn, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        }
      });

      // 为标题添加特效
      const title = document.querySelector("h1");
      title.addEventListener("mouseenter", () => {
        cursor.setText("汉特云");
        cursor.addState("-danger -lg");
      });
      title.addEventListener("mouseleave", () => {
        cursor.removeText();
        cursor.removeState("-danger -lg");
      });

      // 为按钮添加特效
      const stopBtn = document.querySelector(".custom-button.warning");
      stopBtn.addEventListener("mouseenter", () => {
        cursor.setText("停止");
        cursor.addState("-danger -lg");
      });
      stopBtn.addEventListener("mouseleave", () => {
        cursor.removeText();
        cursor.removeState("-danger -lg");
      });

      // 添加页面载入动画
      const tl = gsap.timeline();

      tl.from(".container", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      })
        .from(
          "h1",
          {
            y: -20,
            opacity: 0,
            duration: 0.7,
            ease: "back.out(1.7)",
          },
          "-=0.5"
        )
        .from(
          ".el-tabs",
          {
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .from(
          ".button-group",
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2"
        );
    });

    onUnmounted(() => {
      if (cursor) {
        cursor.destroy();
      }
    });

    return {
      activeTab,
      startSimulation,
      stopSimulation,
    };
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Orbitron", sans-serif;
  background: linear-gradient(45deg, #0f0c29, #302b63, #24243e);
  color: #fff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
}

.container {
  width: 90%;
  max-width: 1200px;
  background: rgba(13, 18, 38, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(0, 255, 255, 0.05);
  margin: 40px auto;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 255, 255, 0.2);
  transition: box-shadow 0.3s ease;
}

.container:hover {
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.glitch-wrapper {
  margin-bottom: 20px;
}

.cyber-glitch {
  color: #0ff;
  font-family: "Orbitron", sans-serif;
  font-size: 2.5em;
  font-weight: bold;
  text-transform: uppercase;
  position: relative;
  text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
    -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
    0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  animation: glitch 500ms infinite;
}

.cyber-glitch::before,
.cyber-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cyber-glitch::before {
  animation: cyber-glitch-1 2s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  transform: translate(-0.025em, -0.0125em);
  opacity: 0.75;
}

.cyber-glitch::after {
  animation: cyber-glitch-2 2s infinite;
  clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
  transform: translate(0.025em, 0.025em);
  opacity: 0.75;
}

@keyframes cyber-glitch-1 {
  0% {
    transform: none;
    opacity: 0.75;
  }
  7% {
    transform: translate(2px, 3px);
    opacity: 0.75;
  }
  10% {
    transform: none;
    opacity: 0.75;
  }
  27% {
    transform: none;
    opacity: 0.75;
  }
  30% {
    transform: translate(5px, 2px);
    opacity: 0.75;
  }
  35% {
    transform: none;
    opacity: 0.75;
  }
  52% {
    transform: none;
    opacity: 0.75;
  }
  55% {
    transform: translate(5px, 1px);
    opacity: 0.75;
  }
  50% {
    transform: none;
    opacity: 0.75;
  }
  72% {
    transform: none;
    opacity: 0.75;
  }
  75% {
    transform: translate(2px, 6px);
    opacity: 0.75;
  }
  80% {
    transform: none;
    opacity: 0.75;
  }
  100% {
    transform: none;
    opacity: 0.75;
  }
}

@keyframes cyber-glitch-2 {
  0% {
    transform: none;
    opacity: 0.25;
  }
  7% {
    transform: translate(-2px, -3px);
    opacity: 0.25;
  }
  10% {
    transform: none;
    opacity: 0.25;
  }
  27% {
    transform: none;
    opacity: 0.25;
  }
  30% {
    transform: translate(-5px, -2px);
    opacity: 0.25;
  }
  35% {
    transform: none;
    opacity: 0.25;
  }
  52% {
    transform: none;
    opacity: 0.25;
  }
  55% {
    transform: translate(-5px, -1px);
    opacity: 0.25;
  }
  50% {
    transform: none;
    opacity: 0.25;
  }
  72% {
    transform: none;
    opacity: 0.25;
  }
  75% {
    transform: translate(-2px, -6px);
    opacity: 0.25;
  }
  80% {
    transform: none;
    opacity: 0.25;
  }
  100% {
    transform: none;
    opacity: 0.25;
  }
}

.input-group {
  margin-bottom: 20px;
}

.custom-input,
.custom-select,
.custom-input-number {
  width: 100%;
  padding: 12px;
  margin-top: 5px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: #fff;
  font-family: "Orbitron", sans-serif;
}

.custom-button {
  padding: 12px 30px;
  font-size: 16px;
  background: linear-gradient(45deg, #00ffff, #00ff00);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
  font-family: "Orbitron", sans-serif;
  position: relative;
  overflow: hidden;
}

.custom-button.glow {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2);
}

.custom-button[type="success"] {
  background: linear-gradient(45deg, #00ffff, #00ff00);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}

.custom-button[type="success"]:hover {
  background: linear-gradient(45deg, #00ff00, #00ffff);
  box-shadow: 0 0 25px rgba(0, 255, 0, 0.5);
}

/* 为"停止模拟"按钮添加特殊样式 */
.custom-button.warning {
  background: linear-gradient(45deg, #ff3e3e, #ff8f00);
}

.custom-button.warning:hover {
  background: linear-gradient(45deg, #ff8f00, #ff3e3e);
  box-shadow: 0 0 25px rgba(255, 62, 62, 0.6), 0 0 45px rgba(255, 62, 62, 0.3);
}

.custom-button:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.custom-button:active {
  transform: translateY(1px);
}

/* 添加按钮内发光效果 */
.custom-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: 0.5s;
}

.custom-button:hover::before {
  left: 100%;
}

.field-item,
.event-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.field-item:hover,
.event-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
}

.field-info {
  flex-grow: 1;
  margin-right: 10px;
}

@keyframes glow {
  0% {
    text-shadow: 0 0 5px #00ffff;
  }
  50% {
    text-shadow: 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff;
  }
  100% {
    text-shadow: 0 0 5px #00ffff;
  }
}

.glow {
  animation: glow 2s infinite;
}

#particles-js {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1;
  background: linear-gradient(45deg, #0f0c29, #302b63, #24243e);
}

.button-group {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 添加按钮悬浮时的光晕效果 */
.custom-button::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.custom-button:hover::after {
  opacity: 1;
}

/* 优化按钮点击效果 */
.custom-button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* 添加 tab 切换时的微妙动画 */
:deep(.el-tab-pane) {
  transition: opacity 0.3s ease;
}

/* 优化标题发光效果 */
h1.glow {
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3),
    0 0 30px rgba(0, 255, 255, 0.1);
}

/* 添加鼠标跟随样式 */
:deep(.mf-cursor) {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 250;
  contain: layout style size;
  pointer-events: none;
  will-change: transform;
}

:deep(.mf-cursor-inner) {
  position: absolute;
  top: -4px;
  left: -4px;
  transform: translate(var(--mouse-x), var(--mouse-y));
  width: 8px;
  height: 8px;
  background: rgba(0, 255, 255, 0.8);
  border-radius: 50%;
  transition: width 0.2s, height 0.2s, opacity 0.2s;
}

:deep(.mf-cursor.-inverse .mf-cursor-inner) {
  color: #000;
  background: #fff;
  mix-blend-mode: difference;
}

:deep(.mf-cursor.-danger .mf-cursor-inner) {
  background: #ff3e3e;
}

:deep(.mf-cursor.-lg .mf-cursor-inner) {
  width: 32px;
  height: 32px;
}

:deep(.mf-cursor-text) {
  position: absolute;
  top: -18px;
  left: -18px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(var(--mouse-x), var(--mouse-y));
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.4s;
}

:deep(.mf-cursor.-text .mf-cursor-text) {
  opacity: 1;
}

:deep(.mf-cursor.-text.-inverse .mf-cursor-text) {
  color: #000;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
}

:deep(.mf-cursor.-text.-danger .mf-cursor-text) {
  color: #ff3e3e;
}

/* 添加角标装饰 */
.cyber-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #0ff;
  opacity: 0.5;
}

.cyber-corner.top-left {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
}

.cyber-corner.top-right {
  top: 10px;
  right: 10px;
  border-left: none;
  border-bottom: none;
}

.cyber-corner.bottom-left {
  bottom: 10px;
  left: 10px;
  border-right: none;
  border-top: none;
}

.cyber-corner.bottom-right {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
}

/* 添加扫描线效果 */
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.02) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1;
}

/* 数字雨效果 */
.digital-rain {
  position: absolute;
  top: 0;
  right: 0;
  font-family: monospace;
  font-size: 14px;
  color: #0ff;
  opacity: 0.3;
  pointer-events: none;
  user-select: none;
}

.digital-rain::before {
  content: "1 0 1 0 1\A 0 1 0 1 0\A 1 0 1 0 1";
  white-space: pre;
  animation: rain 2s linear infinite;
}

/* 按钮故障效果 */
.btn-glitch-effect {
  position: relative;
  display: inline-block;
}

.btn-glitch-effect::before {
  content: attr(data-text);
  position: absolute;
  left: -2px;
  text-shadow: 1px 0 #ff0000;
  top: 0;
  color: #0ff;
  background: #000;
  overflow: hidden;
  clip: rect(0, 900px, 0, 0);
  animation: btn-glitch 2s infinite linear alternate-reverse;
}

/* 容器边框发光效果 */
.container {
  position: relative;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  animation: border-glow 4s infinite alternate;
}

/* 动画定义 */
@keyframes rain {
  from {
    transform: translateY(-20px);
  }
  to {
    transform: translateY(20px);
  }
}

@keyframes btn-glitch {
  2%,
  64% {
    transform: translate(2px, 0) skew(0deg);
  }
  4%,
  60% {
    transform: translate(-2px, 0) skew(0deg);
  }
  62% {
    transform: translate(0, 0) skew(5deg);
  }
}

@keyframes border-glow {
  from {
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
  }
  to {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }
}

/* 优化按钮样式 */
.custom-button {
  position: relative;
  overflow: hidden;
}

.custom-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(0, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.custom-button:hover::before {
  left: 100%;
}

/* 添加霓虹文字效果 */
.el-tabs__item {
  transition: text-shadow 0.3s;
}

.el-tabs__item:hover {
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

/* 确保容器可以显示所有效果 */
.container {
  overflow: visible !important;
}
</style> 