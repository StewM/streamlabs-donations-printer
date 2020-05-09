<template>
    <div>
        <Header />
        <b-container>
            <b-row>
                <b-col>
                    <h1>Streamlabs Donation Printer v{{ $store.state.Main.version }}</h1>
                    <h3>Printer</h3>
                    <b-form-select v-model="selectedPrinter" :options="printerOptions" class="mb-3"></b-form-select>
                    <h3>Minimum Donation</h3>
                    <b-form-input v-model="minDonation" type="number" class="mb-3"></b-form-input>
                    <b-form-checkbox v-model="printColor">Print in color</b-form-checkbox>
                    <h4 v-if="printColor">Minimum Donation for Color</h4>
                    <b-form-input v-model="minColor" type="number" class="mb-3" v-if="printColor"></b-form-input>
                    <b-button @click="saveConfig" variant="success">Save</b-button>
                </b-col>
            </b-row>
            <b-row>
                <b-button @click="logout" variant="danger" class="mt-5">Logout and Close App</b-button>
            </b-row>
        </b-container>
    </div>
</template>
<script>
import Header from "./Header.vue"
export default {
    components: {Header},
    data() {
        return {
            selectedPrinter: null,
            minDonation: 0,
            minColor: 0,
            printColor: false
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
        }
    },
    methods: {
        saveConfig() {
            let values = {
                selectedPrinter: this.selectedPrinter,
                minDonation: this.minDonation,
                minColor: this.minColor,
                printColor: this.printColor
            }

            this.$electron.ipcRenderer.send('update-config', values)
        },
        logout() {
            this.$electron.ipcRenderer.send('logout')
        }
    },
    mounted() {
        this.selectedPrinter = this.$store.state.Main.selectedPrinter
        this.minDonation = this.$store.state.Main.minimumDonation
        this.minColor = this.$store.state.Main.minColor
        this.printColor = this.$store.state.Main.printColor
    }
}
</script>