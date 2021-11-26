import Vue from 'vue';
import Vuex from 'vuex';
import * as d3 from 'd3';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    selectedYear: 2006,
    selectedStates: [],
    educationRates: [],
    personalIncome: [],
    combinedData: [],
    rectProps:[]
  },
  mutations: {
    changeSelectedYear(state, year) {
      state.selectedYear = year;
    },
    changeSelectedState(state, val) {
      state.selectedStates.push(val);
    },
    changeFiltered(state, val) {
      for (let i =0; i<state.combinedData.length; i++){
        if(state.combinedData[i].state === val.state){
          state.combinedData[i].filtered = val.value;
        }
      }
      
    },
    changeRectProps(state, val){
      state.rectProps = val;
    }
    
  },
  getters: {
    rectProps: (state) => state.rectProps,
    selectedYear: (state) => state.selectedYear,
    selectedStates: (state) => state.selectedStates,
    educationRates(state) {
      let result = [];
      for (let i = 0; i < state.educationRates.length; i++) {
        if (state.selectedYear in state.educationRates[i]) {
          result.push({
            state: state.educationRates[i].State,
            value: +state.educationRates[i][state.selectedYear]
          })
        }
      }
      return result;
    },
    personalIncome(state) {
      let result = [];
      for (let i = 0; i < state.personalIncome.length; i++) {
        if (state.selectedYear in state.personalIncome[i]) {
          result.push({
            state: state.personalIncome[i].State,
            value: +state.personalIncome[i][state.selectedYear]
          })
        }
      }
      return result;
    },
    combinedData(state) {
      let result = [];
      for (let i = 0; i < state.personalIncome.length; i++) {
        if ((state.selectedYear in state.personalIncome[i]) && (state.selectedYear in state.educationRates[i])) {
          result.push({
            state: state.personalIncome[i].State,
            personalIncome: +state.personalIncome[i][state.selectedYear],
            educationRate: +state.educationRates[i][state.selectedYear],
            filtered: false,
          })
            state.combinedData=result;
        }
      }
      return result;
    },
  },
  actions: {
    loadData({ state }) {
      d3.csv('./usa_ba-degree-or-higher_2006-2019.csv').then((data) => {
        state.educationRates = data;
      })

      d3.csv('./usa_personal-income-by-state_2006-2019.csv').then((data) => {
        state.personalIncome = data;
      })

    },
  }
})

export default store;
