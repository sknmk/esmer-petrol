import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const state = {
    session: {},
};

const getters = {
    getSession(state) {
        return state.session
    },
};

const mutations = {
    appendSession(state, object) {
        let key = Object.keys(object)[0]
        state.session = Object.assign({[key]: object[key]}, state.session)
    },
    destroySession(state) {
        state.session = {}
    }
};

const actions = {
    appendSession({ commit }, object) {
        commit("appendSession", object)
    },
    destroySession({commit}) {
        commit("destroySession")
    }
};

export default {
    state,
    getters,
    mutations,
    actions,
};
