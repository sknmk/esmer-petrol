<template>
  <b-container fluid>
    <b-row v-if="!_.isEmpty(transactions)" class="max-h-750">
      <b-col cols="12">
        <h5 class="text-transparent mb-3">Son İşlemler</h5>
      </b-col>
      <b-col cols="12" class="mb-4" v-for="(transaction, index) of transactions" :key="transaction.id">
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
          <b-row>
            <b-col>
              <b-button variant="outline-secondary" size="sm" :disabled="ltLoading['lt' +index]"
                        @click="printOnCredit(transaction.oncreditId, index)">
                <span v-if="ltLoading['lt' + index]"><b-spinner></b-spinner> Bekleyiniz..</span>
                <span v-if="!ltLoading['lt' +index]"><b-icon-printer></b-icon-printer> Yazdır</span>
                <span v-if="ltSuccess['lt' +index] && !ltLoading['lt' +index]"><b-icon-check2-circle></b-icon-check2-circle> Yazdırıldı</span>
              </b-button>
            </b-col>
            <b-col class="text-right" align-self="center">
              ₺{{ transaction.totalPrice }}
            </b-col>
          </b-row>
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
      transactions: [],
      ltLoading: {},
      ltSuccess: {}
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
    printOnCredit: function (oncreditId, index) {
      this.ltLoading['lt' + index] = true
      this.$forceUpdate()
      ipcRenderer.send('/oncredit/print', {
        oncreditId: oncreditId,
        copy: 1
      })
      new Promise(function (resolve) {
        ipcRenderer.on('printResult', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        this.ltLoading['lt' + index] = false
        if (response.status !== true) {
          this.$bvToast.toast('Yazdırma başarısız oldu, yazıcı bulunamadı. ', {
            title: 'Hata',
            toaster: 'b-toaster-top-center',
            variant: 'danger',
            solid: true,
            toastClass: 'mt-6',
            noCloseButton: true,
            appendToast: true
          })
        } else {
          this.ltSuccess['lt' + index] = true
          this.$bvToast.toast('Yazdırıldı. ', {
            title: 'Bilgi',
            toaster: 'b-toaster-top-center',
            variant: 'success',
            solid: true,
            toastClass: 'mt-6',
            noCloseButton: true,
            appendToast: true
          })
        }
        this.$forceUpdate()
      })
    }
  }
}
</script>
<style>
.max-h-750 {
  max-height: 750px;
  overflow: auto;
}
</style>
