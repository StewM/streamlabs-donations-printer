const state = {
    printers: [],
    selectedPrinter: '',
    minimumDonation: 0,
    running: false,
    printColor: false,
    minColor: 0,
    version: '',
    apiToken: '',
    githubVersion: '',
    newVersionLink: '',
    showNewVersion: false,
    selectedCurrency: 'USD',
    enforceCurrency: true
}

const mutations = {
    set_version(state, version) {
        state.version = version
    },
    set_printers(state, printers) {
        state.printers = printers
    },
    set_selected_printer(state, printer) {
        state.selectedPrinter = printer
    },
    set_min_donation(state, amount) {
        state.minimumDonation = amount
    },
    set_min_color(state, amount) {
        state.minColor = amount
    },
    set_print_color(state, value) {
        state.printColor = value
    },
    set_api_token(state, value) {
        state.apiToken = value
    },
    start_running(state) {
        state.running = true
    },
    stop_running(state) {
        state.running = false
    },
    set_github_version(state, version) {
        state.githubVersion = version
    },
    set_version_link(state, link) {
        state.newVersionLink = link
    },
    show_new_version(state) {
        state.showNewVersion = true
    },
    hide_new_version(state) {
        state.showNewVersion = false
    },
    set_selected_currency(state, currency) {
        state.selectedCurrency = currency
    },
    set_enforce_currency(state, enforce) {
        state.enforceCurrency = enforce
    }
}

const actions = {
    set_version({ commit }, version) {
        commit('set_version', version)
    },
    set_printers({ commit }, printers) {
        commit('set_printers', printers)
    },
    set_selected_printer({ commit }, printer) {
        commit('set_selected_printer', printer)
    },
    set_min_donation({ commit }, amount) {
        commit('set_min_donation', amount)
    },
    set_min_color({ commit }, amount) {
        commit('set_min_color', amount)
    },
    set_print_color({ commit }, value) {
        commit('set_print_color', value)
    },
    set_api_token({ commit }, value) {
        commit('set_api_token', value)
    },
    start_running({ commit }) {
        commit('start_running')
    },
    stop_running({ commit }) {
        commit('stop_running')
    },
    set_github_version({ commit }, version) {
        commit('set_github_version', version)
    },
    set_version_link({ commit }, link) {
        commit('set_version_link', link)
    },
    show_new_version({ commit }) {
        commit('show_new_version')
    },
    hide_new_version({ commit }) {
        commit('hide_new_version')
    },
    set_selected_currency({ commit }, currency) {
        commit('set_selected_currency', currency)
    },
    set_enforce_currency({ commit }, enforce) {
        commit('set_enforce_currency', enforce)
    }
}

export default {
    state,
    mutations,
    actions
}