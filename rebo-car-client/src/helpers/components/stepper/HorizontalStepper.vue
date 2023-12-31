<template>
  <div class="stepper-box">
    <div class="top">
      <div class="divider-line" :style="{ width: `${(100 / (steps.length) * (steps.length - 1)) - 10}%` }"></div>
      <div class="steps-wrapper">
        <template v-if="topButtons">
          <div v-if="currentStep.index > 0" class="stepper-button-top previous" @click="backStep()">
            <i class="material-icons">keyboard_arrow_left</i>
          </div>
        </template>
        <!-- eslint-disable -->
        <template v-for="(step, index) in steps" :key="index"><!-- eslint-disable vue/no-v-for-template-key -->
          <!-- eslint-enable -->
          <div :class="['step', isStepActive(index, step)]" :style="{ width: `${100 / steps.length}%` }">
            <div class="circle">
              <i class="material-icons md-18">
                {{ (step.completed) ? 'done' : step.icon }}
              </i>
            </div>
            <div class="step-title">
              <h4>{{ step.title }}</h4>
              <h5 class="step-subtitle">{{ step.subtitle }}</h5>
            </div>
          </div>

        </template>
        <div v-if="topButtons" :class="['stepper-button-top next', !canContinue ? 'deactivated' : '']"
          @click="nextStep()">
          <i class="material-icons">keyboard_arrow_right</i>
        </div>
      </div>
    </div>
    <div class="content">
      <transition :enter-active-class="enterAnimation" :leave-active-class="leaveAnimation" mode="out-in">
        <!--If keep alive-->
        <keep-alive v-if="keepAliveData">
          <component ref="keepAliveCompRef" :is="steps[currentStep.index].component"
            :clickedNext="nextButton[currentStep.name]" @can-continue="proceed" :handleNextBtnClick="handleNextBtnClick"
            @change-next="changeNextBtnValue" :current-step="currentStep"></component>
        </keep-alive>
        <!--If not show component and destroy it in each step change-->
        <component v-else ref="CompRef" :is="steps[currentStep.index].component"
          :clickedNext="nextButton[currentStep.name]" :handleNextBtnClick="handleNextBtnClick" @can-continue="proceed"
          @change-next="changeNextBtnValue" :current-step="currentStep"></component>
      </transition>
    </div>
    <div :class="['bottom', (currentStep.index > 0) ? '' : 'only-next']">
      <div v-if="currentStep.index > 0" class="stepper-button previous" @click="backStep()">
        <i class="material-icons">keyboard_arrow_left</i>
        <span>Quay lại</span>
      </div>
      <div :class="['stepper-button next', !canContinue ? 'deactivated' : '']" @click="nextStep()">
        <span>{{ (finalStep) ? 'Hoàn thành' : 'Tiếp theo' }}</span>
        <i class="material-icons">keyboard_arrow_right</i>
      </div>
    </div>
  </div>
</template>

<script>


export default {

  props: {
    locale: {
      type: String,
      default: "en"
    },
    topButtons: {
      type: Boolean,
      default: false
    },
    steps: {
      type: Array,
      default: function () {
        return [
          {
            icon: "mail",
            name: "first",
            title: "Sample title 1",
            subtitle: "Subtitle sample"
          },
          {
            icon: "report_problem",
            name: "second",
            title: "Sample title 2",
            subtitle: "Subtitle sample"
          }
        ];
      }
    },
    keepAlive: {
      type: Boolean,
      default: true
    },
    reset: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      currentStep: {},
      previousStep: {},
      nextButton: {},
      canContinue: false,
      finalStep: false,
      keepAliveData: this.keepAlive,
      handleNextBtnClick: false
    };
  },

  computed: {
    enterAnimation() {
      if (this.currentStep.index < this.previousStep.index) {
        return "animated quick fadeInLeft";
      } else {
        return "animated quick fadeInRight";
      }
    },
    leaveAnimation() {
      if (this.currentStep.index > this.previousStep.index) {
        return "animated quick fadeOutLeft";
      } else {
        return "animated quick fadeOutRight";
      }
    }
  },

  methods: {
    isStepActive(index, step) {
      if (this.currentStep.index === index) {
        return "activated";
      } else {
        return "deactivated";
      }
    },

    activateStep(index, back = false) {
      if (this.steps[index]) {
        this.previousStep = this.currentStep;
        this.currentStep = {
          name: this.steps[index].name,
          index: index
        };

        if (index + 1 === this.steps.length) {
          this.finalStep = true;
        } else {
          this.finalStep = false;
        }

        if (!back) {
          this.$emit("completed-step", this.previousStep);
        }
      }
      this.$emit("active-step", this.currentStep);
    },

    nextStepAction() {
      this.handleNextBtnClick = true
      this.nextButton[this.currentStep.name] = true;
      if (this.canContinue) {
        if (this.finalStep) {
          this.$emit("stepper-finished", this.currentStep);
        }
        let currentIndex = this.currentStep.index + 1;

        this.activateStep(currentIndex);
      }
      this.canContinue = false;
      this.$forceUpdate();
    },

    nextStep() {
      this.$refs.keepAliveCompRef.handleNextBtnClick()
      if (!this.$listeners || !this.$listeners['before-next-step']) {
        this.nextStepAction()
      }

      this.canContinue = false;

      this.$emit("before-next-step", { currentStep: this.currentStep }, (next = true) => {
        this.canContinue = true;
        if (next) {

          this.nextStepAction()
        }
      });
    },
    backStep() {
      this.$emit("clicking-back");
      let currentIndex = this.currentStep.index - 1;
      if (currentIndex >= 0) {
        this.activateStep(currentIndex, true);
      }
    },

    proceed(payload) {
      this.canContinue = payload.value;
    },

    changeNextBtnValue(payload) {
      this.nextButton[this.currentStep.name] = payload.nextBtnValue;
      this.$forceUpdate();
    },

    init() {
      // Initiate stepper
      this.activateStep(0);
      this.steps.forEach(step => {
        this.nextButton[step.name] = false;
      });
    }
  },

  watch: {
    reset(val) {
      if (!val) {
        return;
      }

      this.keepAliveData = false;

      this.init();
      this.previousStep = {};

      this.$nextTick(() => {
        this.keepAliveData = this.keepAlive;
        this.$emit('reset', true);
      });

    }
  },

  created() {
    this.init();
  }
};
</script>

<style src="./HorizontalStepper.scss" scoped lang="scss"></style>
<style scoped>
/* fallback */
@font-face {
  font-family: "Material Icons";
  font-style: normal;
  font-weight: 400;
  src: local("Material Icons"), local("MaterialIcons-Regular"),
    url(https://fonts.gstatic.com/s/materialicons/v17/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format("woff2");
}

.material-icons {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}
</style>
