<template lang="html">
  <div
    class="select__form__wrp"
    :style="`
      width: ${computedWidth};
      height: ${computedHeight};
    `"
    :class="{disabled}"
  >
    <div class="select__cnt">
      <input
        class="input__form"
        :class="{
          infocus: inFocus || optionsPressed,
          disabled
        }"
        :placeholder="currentLabel && !inFocus ? '' : placeholder"
        v-model="filterText"
        autocomplete="off"
        @focus="onFocus"
        @input="$emit('filter', $event.target.value)"
        @blur="onBlurInput"
        ref="search"
        type="text"
      >
      <div class="select__label" v-show="currentLabel && !inFocus">{{currentLabel}}</div>
      <div v-show="!isLoading" class="arrow__icon__wrp" :class="{disabled}" @click.stop="onIconClicked">
        <div
          class="arrow__icon"
          :class="{ up__icon: inFocus }"
        >
          <svg width="12" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" id="arrow">
            <path d="M1 1L6.98746 7L13 1" stroke="#43B6B8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <div v-show="isLoading" class="load__icon">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>

    <transition name="slide">
      <ul
        v-if="filteredOptions.length && inFocus"
        class="options__items"
        :key="getListKey()"
        @mousedown="optionsPressed = true"
      >
        <li
          class="option__item"
          :class="{ selected: option[valueName] === observableValue }"
          v-for="(option,index) in filteredOptions"
          :key="`${option[valueName]}${index}`"
          @click.stop="optionClicked(option[valueName])"
        >
          {{option[labelName]}}
          <span v-if="option[valueName] === observableValue" class="ml-auto option__item--checked-text">Выбрано</span>
        </li>
        <li v-show="!filteredOptions.length && filterText" class="empty__item">
          Ничего не найдено
        </li>
      </ul>
    </transition>

  </div>
</template>

<script>
export default {
  name: 'CustomSelect',
  props: {
    /**
     * Делает селект не активный
     */
    disabled: Boolean,
    /**
     * Значение селекта (берется из v-model)
     */
    value: {
      type: [String, Number],
    },
    /**
     * Текст селекта
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Массив options
     */
    options: {
      type: Array,
      default: () => ([]),
    },
    /*
    * Показываем иконку что идет загрузка списка
    */
    isLoading: {
      type: Boolean,
      default: false,
    },
    /**
     * Какое поле прописывать в option в качестве текста
     */
    labelName: {
      type: String,
      default: 'label',
    },
    /**
     * Какое поле возвращать в v-model из текущего объекта
     */
    valueName: {
      type: String,
      default: 'value',
    },
    /**
     * Ширина
     */
    width: {
      type: [String, Number],
      default: '300',
    },
    /**
     * Высота
     */
    height: {
      type: [String, Number],
      default: '36',
    },
  },
  data () {
    return {
      filterText: '', // поиск в списке
      currentLabel: '', // label выбранного элемента
      observableValue: this.value, // value выбранного элемента
      inFocus: false,
      optionsPressed: false, // зажали мышкой на блоке options
      blurTime: null,
    }
  },
  mounted () {
    if (this.observableValue && this.options.length) {
      this.selectOption(this.observableValue)
    }
  },
  computed: {
    filteredOptions () {

      if (!this.filterText) {
        return this.options
      }

      const filter = String(this.filterText).toLowerCase()

      return this.options.filter(option => {
        const label = String(option[this.valueName]).toLowerCase()

        return ~label.indexOf(filter)
      })
    },
    computedHeight () {
      if (+this.height) {
        return this.height + 'px'
      } else {
        return this.height
      }
    },
    computedWidth () {
      if (+this.width) {
        return this.width + 'px'
      } else {
        return this.width
      }
    },
  },
  methods: {

    onIconClicked (e) {
      e.stopPropagation()
      this.optionsPressed = false

      if (this.inFocus) {
        this.onBlurInput()
      } else if (!this.blurTime || (new Date().getTime() > this.blurTime + 300)) {
        this.$refs.search.focus()
      }
    },

    onFocus (e) {
      this.inFocus = true
      this.$emit('filter', e.target.value)
    },

    onBlurInput () {
      if (this.optionsPressed) {
        return
      }

      this.inFocus = false

      if (this.filterText) {
        this.$emit('filter', '')
      }

      this.filterText = ''

      this.selectOption(this.observableValue)

      this.blurTime = new Date().getTime()
    },

    optionClicked (value) {
      this.filterText = ''
      this.selectOption(value)
      this.inFocus = false
      this.optionsPressed = false
    },

    selectOption (value, emitValue = true) {
      const currentLabel = this.getCurrentLabel(value)

      const oldValue = this.observableValue

      if (currentLabel) {

        this.observableValue = value

        this.currentLabel = currentLabel

      } else {
        this.observableValue = ''

        this.currentLabel = ''
      }

      if (emitValue) {
        /**
         * Событие срабатывает при любом выборе, даже того же значения
         * @property value
         */
        this.$emit('input', value)

        if (value !== oldValue) {
          /**
           * Событие срабатывает только когда изменяется значение у селекта
           * @property value
           */
          this.$emit('change', value)
        }
      }

      if (this.$refs.search) {
        this.$refs.search.value = ''
      }
    },

    getCurrentLabel (value, options = []) {
      options = options.length ? options : this.options.slice()

      const option = options.find(option => option[this.valueName] === value)

      return option ? option[this.labelName] : ''
    },

    getListKey () {
      return String(Math.random())
    },
  },
  watch: {
    value (value) {

      const currentLabel = this.getCurrentLabel(value)

      if (!currentLabel && this.options.length) {
        this.selectOption(null, true)
      }

      if (currentLabel) {
        this.selectOption(value, false)
      }
    },
    options (options) {

      if (!this.getCurrentLabel(this.observableValue, options)) {
        return
      }

      this.selectOption(this.observableValue)
    },
  },
}
</script>

<style lang="scss" scoped>
.select__form__wrp,
.select__cnt {
  position : relative;
  cursor   : pointer;

  &.disabled {
    cursor           : default;
    pointer-events   : none;
    background-color : $white-100;
    border-color     : $white-100;
  }
}

.input__form {
  width          : 100%;
  box-sizing     : border-box;
  font-family    : inherit;
  height         : 32px;
  border         : 1px solid $white-300;
  border-radius  : 4px;
  padding        : 0 12px;
  outline        : none;
  transition     : border-color 0.2s;
  font-size      : 14px;
  letter-spacing : 0.1px;
  cursor         : pointer;
}

.select__cnt:hover .input__form {
  border-color : $primary;
}

.input__form.infocus {
  transition       : none;
  background-color : $white-100;
  border-color     : $white-100 !important;
}

// Отключаем кнопку
.input__form.disabled,
.select__cnt:hover .input__form.disabled {
  cursor           : default;
  pointer-events   : none;
  background-color : $white-100;
  border-color     : $white-100;
  opacity          : 0.9;
}

.input__form::placeholder,
.input__form::-webkit-input-placeholder {
  opacity : .75;
}

.arrow__icon__wrp {
  width       : 32px;
  height      : 32px;
  position    : absolute;
  top         : 0;
  right       : 0;
  cursor      : pointer;
  user-select : none;

  &.disabled {
    cursor         : default;
    pointer-events : none;
    opacity        : .4;
  }
}

.arrow__icon {
  position       : absolute;
  top            : 50%;
  right          : 14px;
  display        : block;
  width          : 12px;
  height         : 8px;
  transform      : translateY(-50%);
  pointer-events : none;
}

.arrow__icon.up__icon {
  transform : rotate(180deg) translateY(65%)
}

.options__items {
  position         : absolute;
  top              : 40px;
  left             : 0;
  right            : 0;
  background-color : $white;
  z-index          : 10;
  box-shadow       : 0 2px 8px rgba(0, 0, 0, 0.12);
  border-radius    : 4px;
  margin           : 0;
  max-height       : 176px;
  overflow-y       : auto;
  padding          : 8px 0;
  color            : $black-100;
  font-size        : 12px;
  line-height      : 18px;

  &::-webkit-scrollbar-track {
    background-color : $white;
    border-radius    : 4px;
  }

  &::-webkit-scrollbar {
    width : 4px;
  }

  &::-webkit-scrollbar-thumb {
    background    : $primary-300;
    border-radius : 50px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background : darken($primary-300, 5%);
  }
}

.option__item,
.empty__item {
  display        : flex;
  align-items    : center;
  padding        : 0 12px;
  height         : 32px;
  font-size      : 12px;
  cursor         : pointer;
  letter-spacing : .4px;

  &--checked-text {
    font-size      : 11px;
    line-height    : 16px;
    color          : $black-500;
    font-weight    : normal;
    letter-spacing : .4px;
  }
}

.empty__item {
  cursor : default;
  color  : #888;
}

.option__item:hover {
  position         : relative;
  background-color : $primary-100;
  color            : $primary;

  &:not(.selected) {
    &:after {
      position       : absolute;
      content        : "Выбрать";
      right          : 12px;
      top            : 50%;
      transform      : translateY(-50%);
      font-size      : 11px;
      line-height    : 16px;
      letter-spacing : 0.4px;
      color          : $primary;
    }
  }
}

.option__item.selected {
  color          : $primary-700 !important;
  font-weight    : 500;
  letter-spacing : 0.25px;
}

.select__label {
  position       : absolute;
  color          : $black;
  left           : 12px;
  top            : 50%;
  right          : 38px;
  transform      : translateY(-50%);
  font-size      : 14px;
  white-space    : nowrap;
  overflow       : hidden;
  text-overflow  : ellipsis;
  pointer-events : none;
}

.arrow__icon /deep/ svg {
  display : block;
}

.load__icon {
  position   : absolute;
  top        : 50%;
  right      : 0;
  transform  : translateY(-50%);
  margin-top : -30px;
  width      : 20px;
  height     : 20px;
}

.load__icon div {
  display    : inline-block;
  position   : absolute;
  width      : 2px;
  background : #999;
  animation  : lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}

.load__icon div:nth-child(1) {
  animation-delay : -0.24s;
}

.load__icon div:nth-child(2) {
  left            : 4px;
  animation-delay : -0.12s;
}

.load__icon div:nth-child(3) {
  left            : 8px;
  animation-delay : 0s;
}

@keyframes lds-facebook {
  0% {
    top    : 20px;
    height : 38px;
  }
  50%, 100% {
    top    : 30px;
    height : 20px;
  }
}

.slide-enter-active {
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
}

.slide-leave-active {
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  padding : 0;
}

.slide-enter-to, .slide-leave {
  max-height: 176px;
}

.slide-enter, .slide-leave-to {
  max-height: 0;
}
</style>
