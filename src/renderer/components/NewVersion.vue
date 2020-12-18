<template>
    <div>
        <b-toast id="new-version" title="New Version Available!" toaster="b-toaster-bottom-left" no-auto-hide @hide="closeToast">
            Version {{ $store.state.Main.githubVersion }} is now available! Click <a @click="openLink" href="#">here</a> to get it.
        </b-toast>
    </div>
</template>

<script>
export default {
    name: "new-version",
    methods: {
        closeToast: function () {
            this.$store.dispatch('hide_new_version')
        },
        openLink: function () {
            this.$electron.ipcRenderer.send('open-link')
        }
    },
    mounted: function () {
        if(this.$store.state.Main.showNewVersion) {
            this.$bvToast.show('new-version')
        }
    }
}
</script>