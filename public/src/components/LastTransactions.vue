<template>
  <b-container fluid>
    <b-row v-if="!_.isEmpty(transactions)" class="max-h-650">
      <b-col cols="12">
        <h5 class="text-transparent mb-3">Son İşlemler</h5>
      </b-col>
      <b-col cols="12" class="mb-4" v-for="transaction of transactions" :key="transaction.id">
        <b-card>
          <h6>
            <b-icon-building></b-icon-building>
            {{ transaction.customerName }}
          </h6>
          <b-icon-truck></b-icon-truck>
          {{ transaction.plate }}
          <br/>
          <b-icon-person></b-icon-person>
          {{ transaction.driverName }}
          <hr/>
          <p class="text-right">₺{{ transaction.totalPrice }}</p>
          <b-button variant="info" size="sm" @click="printOnCredit(transaction.oncreditId)"><b-icon-printer></b-icon-printer> Yazdır</b-button>
        </b-card>
      </b-col>
    </b-row>
    <b-row v-else>
      <b-col cols="12 mt-4">
        <b-card class="mt-3">
          <h6 class="text-transparent mb-0">
            <b-icon-exclamation-octagon class="mr-1"></b-icon-exclamation-octagon>
            Kayıtlı işlem bulunamadı.
          </h6>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { ipcRenderer } from 'electron'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  data () {
    return {
      transactions: []
    }
  },
  computed: {
    ...mapGetters(['getSession']),
    _ () {
      return _
    },
    branchId: function () {
      return this.getSession.branchDetails.id
    }
  },
  mounted () {
    this.get()
  },
  methods: {
    get () {
      ipcRenderer.send('/oncredit/list', { branchId: this.branchId })
      new Promise(function (resolve) {
        ipcRenderer.on('oncreditList', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        this.transactions = response
      })
    },
    printOnCredit: function (oncreditId) {
      this.loading = true
      ipcRenderer.send('/oncredit/print', { oncreditId: oncreditId, copy: 1 })
      new Promise(function (resolve) {
        ipcRenderer.on('printResult', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        this.loading = false
        if (!response.status) {
          this.$bvToast.toast('Yazdırma başarısız oldu. ', {
            title: 'Hata',
            toaster: 'b-toaster-bottom-center',
            variant: 'danger',
            solid: true,
            toastClass: 'mt-6',
            noCloseButton: true,
            appendToast: true
          })
        } else {
          this.success = true
          this.$bvToast.toast('Yazdırıldı. ', {
            title: 'Bilgi',
            toaster: 'b-toaster-bottom-center',
            variant: 'success',
            solid: true,
            toastClass: 'mt-6',
            noCloseButton: true,
            appendToast: true
          })
        }
      })
    }
  }
}
</script>
<style>
.max-h-650 {
  max-height: 650px;
}
</style>
