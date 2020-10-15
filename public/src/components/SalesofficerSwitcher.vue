<template>
  <b-container fluid>
    <b-row v-if="!_.isEmpty(salesofficers) && !loading"
           class="pt-5 d-flex justify-content-center text-center">
      <b-col lg="12" class="mb-3 mt-5">
        <h1><i class="ri-gas-station-line"></i></h1>
        <h5>Kimliğinizi seçiniz.</h5>
      </b-col>
      <b-col lg="3" v-for="(officer, i) of salesofficers" :key="i" @click="select(i)">
        <b-card class="identity-card">
          <b-card-img :src="officer.img" class="rounded-lg"></b-card-img>
          <b-card-text>
            <h5 class="mt-3">{{ officer.name }}</h5>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="mt-5" v-if="!_.isEmpty(errors) && !loading">
      <b-col class="mt-5 text-center">
        <b-alert show variant="danger"><i class="ri-alert-line"></i> {{ errors.salesofficers }}</b-alert>
      </b-col>
    </b-row>
    <b-row class="pt-5 d-flex justify-content-center text-center" v-if="loading">
      <b-col lg="12" class="mb-3 mt-5">
        <h1><i class="ri-gas-station-line"></i></h1>
        <h5>Kimliğinizi seçiniz.</h5>
      </b-col>
      <b-col lg="3">
        <b-card no-body img-top>
          <b-skeleton-img card-img="top" aspect="4:3"></b-skeleton-img>
          <b-card-body>
            <b-skeleton animation="wave" width="55%"></b-skeleton>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col lg="3">
        <b-card no-body img-top>
          <b-skeleton-img card-img="top" aspect="4:3"></b-skeleton-img>
          <b-card-body>
            <b-skeleton animation="wave" width="55%"></b-skeleton>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col lg="3">
        <b-card no-body img-top>
          <b-skeleton-img card-img="top" aspect="4:3"></b-skeleton-img>
          <b-card-body>
            <b-skeleton animation="wave" width="55%"></b-skeleton>
          </b-card-body>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { ipcRenderer } from 'electron'
import { mapActions, mapGetters } from 'vuex'
import _ from 'lodash'
import genericMethods from '../mixins/genericMethods'

export default {
  mixins: [genericMethods],
  data () {
    return {
      salesofficers: []
    }
  },
  mounted () {
    this.getSalesofficers()
  },
  computed: {
    ...mapGetters(['getSession']),
    _ () {
      return _
    }
  },
  methods: {
    ...mapActions(['appendSession']),
    getSalesofficers () {
      this.loading = true
      ipcRenderer.send('/salesofficer/list', { branchId: this.getSession.branchDetails.id })
      new Promise(function (resolve) {
        ipcRenderer.on('salesofficerList', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        if (response.length < 1) {
          this.errors.salesofficers = 'Kayıtlı personel bulunamadı.'
        }
        this.salesofficers = response
        setTimeout(() => {
          this.loading = false
        }, 750)
      })
    },
    select (i) {
      this.appendSession({ salesofficer: this.salesofficers[i] })
      this.$router.push('/OnCreditForm')
    }
  }
}
</script>
<style>
.identity-card {
  transition: .2s all ease-out;
  cursor: pointer
}

.identity-card:hover {
  transform: scale(1.05);
}
</style>
