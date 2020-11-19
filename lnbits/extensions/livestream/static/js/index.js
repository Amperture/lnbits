/* globals Quasar, Vue, _, VueQrcode, windowMixin, LNbits, LOCALE */

Vue.component(VueQrcode.name, VueQrcode)

new Vue({
  el: '#vue',
  mixins: [windowMixin],
  data() {
    return {
      selectedWallet: null,
      nextCurrentTrack: null,
      livestream: {
        tracks: [],
        producers: []
      },
      trackDialog: {
        show: false,
        data: {}
      }
    }
  },
  computed: {
    sortedTracks() {
      return this.livestream.tracks.sort((a, b) => a.name - b.name)
    },
    tracksMap() {
      return Object.fromEntries(
        this.livestream.tracks.map(track => [track.id, track])
      )
    },
    producersMap() {
      return Object.fromEntries(
        this.livestream.producers.map(prod => [prod.id, prod])
      )
    }
  },
  methods: {
    getTrackLabel(trackId) {
      let track = this.tracksMap[trackId]
      return `${track.name}, ${this.producersMap[track.producer].name}`
    },
    disabledAddTrackButton() {
      return (
        !this.trackDialog.data.name ||
        this.trackDialog.data.name.length === 0 ||
        !this.trackDialog.data.price_sat ||
        !this.trackDialog.data.producer ||
        this.trackDialog.data.producer.length === 0
      )
    },
    changedWallet(wallet) {
      this.selectedWallet = wallet
      this.loadLivestream()
    },
    loadLivestream() {
      LNbits.api
        .request(
          'GET',
          '/livestream/api/v1/livestream',
          this.selectedWallet.inkey
        )
        .then(response => {
          this.livestream = response.data
          this.nextCurrentTrack = this.livestream.current_track
        })
        .catch(err => {
          LNbits.utils.notifyApiError(err)
        })
    },
    addTrack() {
      let {name, producer, price_sat, download_url} = this.trackDialog.data

      LNbits.api
        .request(
          'POST',
          '/livestream/api/v1/livestream/tracks',
          this.selectedWallet.inkey,
          {
            download_url:
              download_url && download_url.length > 0
                ? download_url
                : undefined,
            name,
            price_msat: price_sat * 1000,
            producer_name: typeof producer === 'string' ? producer : undefined,
            producer_id: typeof producer === 'object' ? producer.id : undefined
          }
        )
        .then(response => {
          this.$q.notify({
            message: `Track '${this.trackDialog.data.name}' added.`,
            timeout: 700
          })
          this.loadLivestream()
          this.trackDialog.show = false
          this.trackDialog.data = {}
        })
        .catch(err => {
          LNbits.utils.notifyApiError(err)
        })
    },
    deleteTrack(trackId) {
      LNbits.utils
        .confirmDialog('Are you sure you want to delete this track?')
        .onOk(() => {
          LNbits.api
            .request(
              'DELETE',
              '/livestream/api/v1/livestream/tracks/' + trackId,
              this.selectedWallet.inkey
            )
            .then(response => {
              this.$q.notify({
                message: `Track deleted`,
                timeout: 700
              })
              this.livestream.tracks.splice(
                this.livestream.tracks.findIndex(track => track.id === trackId),
                1
              )
            })
            .catch(err => {
              LNbits.utils.notifyApiError(err)
            })
        })
    },
    updateCurrentTrack(track) {
      if (this.livestream.current_track === track) {
        // if clicking the same, stop it
        track = 0
      }

      LNbits.api
        .request(
          'PUT',
          '/livestream/api/v1/livestream/track/' + track,
          this.selectedWallet.inkey
        )
        .then(() => {
          this.livestream.current_track = track
          this.$q.notify({
            message: `Current track updated.`,
            timeout: 700
          })
        })
        .catch(err => {
          LNbits.utils.notifyApiError(err)
        })
    },
    updateFeePct() {
      LNbits.api
        .request(
          'PUT',
          '/livestream/api/v1/livestream/fee/' + this.livestream.fee_pct,
          this.selectedWallet.inkey
        )
        .then(() => {
          this.$q.notify({
            message: `Percentage updated.`,
            timeout: 700
          })
        })
        .catch(err => {
          LNbits.utils.notifyApiError(err)
        })
    },
    producerAdded(added, cb) {
      cb(added)
    }
  },
  created() {
    this.selectedWallet = this.g.user.wallets[0]
    this.loadLivestream()
  }
})