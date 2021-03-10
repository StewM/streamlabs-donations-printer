<template>
    <div>
        <Header />
        <b-container>
            <b-row>
                <b-col>
                    <h1>Streamlabs Donation Printer v{{ $store.state.Main.version }}</h1>
                    <h3 class="title">Socket API Token</h3>
                    <font-awesome-icon icon="info-circle" id="token-tooltip" />
                    <b-tooltip target="token-tooltip">
                        You can get this from the Streamlabs settings in API Settings > API Tokens
                    </b-tooltip>
                    <b-form-input v-model="apiToken" :type="showToken ? 'text' : 'password'"></b-form-input>
                    <b-form-checkbox v-model="showToken">Show Token</b-form-checkbox>
                    <h3>Printer</h3>
                    <b-form-select v-model="selectedPrinter" :options="printerOptions" class="mb-3"></b-form-select>
                    <h3>Minimum Donation Currency</h3>
                    <b-form-select v-model="selectedCurrency" :options="currencyOptions" class="mb-3"></b-form-select>
                    <b-form-checkbox v-model="enforceCurrency">Only print donations in this currency <font-awesome-icon icon="info-circle" id="currency-tooltip" /></b-form-checkbox>
                    <b-tooltip target="currency-tooltip">
                        If this is not checked, the app will just compare the amounts directly as if they were the same currency. There is currently no conversion.
                    </b-tooltip>
                    <h3>Minimum Donation</h3>
                    <b-form-input v-model="minDonation" type="number" class="mb-3"></b-form-input>
                    <b-form-checkbox v-model="printColor">Print in color</b-form-checkbox>
                    <h4 v-if="printColor">Minimum Donation for Color</h4>
                    <b-form-input v-model="minColor" type="number" class="mb-3" v-if="printColor"></b-form-input>
                    <b-form-checkbox v-model="enableSuperChats">Enable Super Chats (beta)</b-form-checkbox>
                    <b-button @click="saveConfig" variant="success">Save</b-button>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>
<script>
var cc = require('currency-codes')
import Header from "./Header.vue"
export default {
    components: {Header},
    data() {
        return {
            selectedPrinter: null,
            minDonation: 0,
            minColor: 0,
            printColor: false,
            apiToken: null,
            showToken: false,
            selectedCurrency: 'USD',
            enforceCurrency: true,
            enableSuperChats: false
        }
    },
    computed: {
        printerOptions() {
            let printers = []
            printers.push({value: '', text: 'Choose a printer to use'})
            this.$store.state.Main.printers.forEach(printer => {
                printers.push({value: printer, text: printer})
            })

            return printers
        },
        currencyOptions() {
            let codes = []
            cc.codes().forEach(code => {
                let data = cc.code(code)
                let name = code + " - " + data.currency
                codes.push({value: code, text: name})
            })
            return codes
        }
    },
    methods: {
        saveConfig() {
            let values = {
                selectedPrinter: this.selectedPrinter,
                minDonation: this.minDonation,
                minColor: this.minColor,
                printColor: this.printColor,
                apiToken: this.apiToken,
                selectedCurrency: this.selectedCurrency,
                enforceCurrency: this.enforceCurrency,
                enableSuperChats: this.enableSuperChats
            }

            this.$electron.ipcRenderer.send('update-config', values)
        }
    },
    mounted() {
        this.selectedPrinter = this.$store.state.Main.selectedPrinter
        this.minDonation = this.$store.state.Main.minimumDonation
        this.minColor = this.$store.state.Main.minColor
        this.printColor = this.$store.state.Main.printColor
        this.apiToken = this.$store.state.Main.apiToken
        this.selectedCurrency = this.$store.state.Main.selectedCurrency
        this.enforceCurrency = this.$store.state.Main.enforceCurrency
        this.enableSuperChats = this.$store.state.Main.enableSuperChats
    }
}
</script>
<style lang="scss" scoped>
.title {
    display: inline-block;
    margin-right: 5px;
}
</style>