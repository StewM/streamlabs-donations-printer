<template>
  <div>
    <Header />
    <b-container>
      <b-row align-v="center" align-h="center">
        <b-col class="text-center">
          <p v-if="!configured">Please configure the app to enable the printer</p>
          <b-button :variant="variant" @click="togglePrinter()">{{ buttonText }} Printer</b-button>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import Header from "./Header.vue";

export default {
  name: "landing-page",
  components: { Header },
  computed: {
    configured () {
      if (this.$store.state.Main.selectedPrinter != '' && this.$store.state.Main.apiToken != '') return true

      return false
    },
    variant () {
      if(this.configured && !this.$store.state.Main.running){
        return "success"
      } else if(this.configured && this.$store.state.Main.running){
        return "danger"
      } else {
        return "secondary"
      }
    },
    buttonText () {
      if(!this.$store.state.Main.running){
        return "Start"
      } else {
        return "Stop"
      }
    }
  },
  methods: {
    togglePrinter() {
      if(this.configured && !this.$store.state.Main.running) {
        this.$electron.ipcRenderer.send('start-printer')
      } else if(this.configured && this.$store.state.Main.running) {
        this.$electron.ipcRenderer.send('stop-printer')
      }
    }
  }
}
</script>

<style>
</style>
