import Vue from 'vue'
import Vuex from 'vuex'
import data from './test.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    programs: [],
    countGroups: null
  },
  mutations: {
    programs (state, programs) {
      state.programs = programs
    },
    countGroups (state, countGroups) {
      state.countGroups = countGroups
    },
  },
  actions: {
    fetchPrograms ({ commit, dispatch }) {
      const programs = data.result.map((el, idx) => ({ ...el, openList: idx === 0 }))
      commit('programs', programs)
      dispatch('countGroups', programs)
      return programs
    },
    yearFilter ({ state, commit, dispatch }, year) {
      let filterPrograms = [...state.programs]
      if (year !== 'all') {
        filterPrograms = filterPrograms.filter(program => {
          return !!program.studyGroups.filter(group => {
            const fullYear = new Date(group.startDate).getFullYear()
            return fullYear === year
          }).length
        })
      }
      dispatch('countGroups', filterPrograms)
      return filterPrograms
    },
    countGroups ({ commit }, programs) {
      const countGroups = programs.reduce((total, program) => total + program.studyGroups.length, 0)
      commit('countGroups', countGroups)
    },
  },
  getters: {
    countGroups: state => state.countGroups,
  },
  modules: {},
})
