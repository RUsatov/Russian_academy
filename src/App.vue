<template>
  <div>
    <header class="header container">
      <h1>Учебные группы
        <span class="groups-count">{{countGroups}}</span>
      </h1>
      <Select v-model="yearFilter" :options="options" @change="changeYearFilter" width="176"/>
    </header>
    <main class="container">
      <div class="education-programs">
        <div v-if="countGroups" class="group-block" v-for="program in programs" :key="program.id">
          <div @click="program.openList = !program.openList" class="group-line px-2">
            <p class="group-block__title">{{program.caption}}</p>
            <svg :class="{open: program.openList}" class="group-block__icon" width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg" id="arrow">
              <path d="M1 1L6.98746 7L13 1" stroke="#43B6B8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <transition name="slide">
            <ul v-if="program.openList" class="group-block__list">
              <li class="group-block__item group-line" v-for="group in program.studyGroups" :key="group.id">
                <a href="#" class="group-block__link">{{group.caption}}</a>
              </li>
            </ul>
          </transition>
        </div>
        <p v-if="!countGroups" class="groups-not-found">За {{yearFilter}} год учебных групп не найдено</p>
      </div>
    </main>
  </div>
</template>

<script>
import Select from './components/forms/Select'

export default {
  name: 'App',
  components: { Select },
  data () {
    return {
      yearFilter: 'all',
      options: [
        {
          value: 'all',
          label: 'Все года'
        },
        {
          value: 2020,
          label: '2020'
        },
        {
          value: 2019,
          label: '2019'
        },
        {
          value: 2018,
          label: '2018'
        },
        {
          value: 2017,
          label: '2017'
        },
        {
          value: 2016,
          label: '2016'
        },
        {
          value: 2015,
          label: '2015'
        },
        {
          value: 2014,
          label: '2014'
        },
      ],
      programs: null,
    }
  },
  mounted () {
    this.$store.dispatch('fetchPrograms')
      .then(res => this.programs = res)
      .catch(e => console.error(e))
  },
  computed: {
    countGroups () {
      return this.$store.getters.countGroups
    }
  },
  methods: {
    changeYearFilter (year) {
      this.$store.dispatch('yearFilter', year)
        .then(res => this.programs = res)
        .catch(e => console.error(e))
    }
  }
}
</script>

<style lang="scss">
.header {
  display          : flex;
  align-items      : center;
  justify-content  : space-between;
  height           : 81px;
  background-color : $white;
  letter-spacing   : .25px;
  box-shadow       : 0 4px 12px rgba(117, 120, 123, .08);
}

.groups-count {
  font-weight : normal;
  color       : $black-100;
}

.education-programs {
  @extend %py-4;
}

.group-line {
  height           : 48px;
  display          : flex;
  align-items      : center;
  background-color : $white;
  cursor          : pointer;
}

.group-block {
  box-shadow    : 0 4px 12px rgba(117, 120, 123, 0.08);
  border-radius : 4px;
  overflow      : hidden;

  &:not(:last-child) {
    @extend %mb-1;
  }
}

.group-block__title {
  letter-spacing  : .5px;
  white-space     : nowrap;
  text-overflow   : ellipsis;
  flex: 1;
  max-width: 100%;
  overflow: hidden;
}
.group-block__icon {
  flex: 0 0 34px;
  &.open {
    transform: rotate(-180deg);
  }
}

.group-block__item {
  border-top : 1px solid $border-list;
}

.group-block__link {
  display        : flex;
  align-items    : center;
  height         : 100%;
  width          : 100%;
  font-size      : 12px;
  line-height    : 18px;
  letter-spacing : .5px;

  @extend %px-4;

  &:hover {
    background-color : $white-100;
  }
}

.slide-enter-active {
  transition-duration: 0.3s;
  transition-timing-function: ease-in;
}

.slide-leave-active {
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
}

.slide-enter-to, .slide-leave {
  max-height: 1000px;
  overflow: hidden;
}

.slide-enter, .slide-leave-to {
  overflow: hidden;
  max-height: 0;
}

.groups-not-found {
  text-align : center;
  font-size : 20px;
}
</style>
