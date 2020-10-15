<template>
  <b-container fluid="true" class="p-0">
    <b-row>
      <i class="close-app ri-close-line" @click="closeApp()"/>
      <b-col cols="4" class="text-center align-self-center bg-light">
        <b-img :src="require('../img/logo-blx.png')" class="img-fluid"/>
      </b-col>
      <b-col cols="8" class="bg-white py-5">
        <b-row class="pl-4">
          <b-col cols="12" class="mb-2">
            <h2 class="text-transparent">
              Esmer Petrol
            </h2>
          </b-col>
          <b-col cols="11" class="mb-3">
            <label>Şube</label>
            <b-input-group class="input-group">
              <multiselect
                  v-model="branch.id"
                  placeholder="Seçiniz"
                  selectLabel="Seç"
                  deselectLabel="Sil"
                  selectedLabel="Seçildi"
                  track-by="id"
                  label="name"
                  :options="authenticators"
                  :searchable="false">
                <span slot="noOptions">Yazmaya devam edin.</span>
                <span slot="noResult">Sonuç bulunamadı.</span>
              </multiselect>
            </b-input-group>
            <span v-if="errors.branch" class="text-danger">{{ errors.branch }}</span>
          </b-col>
          <b-col cols="11" class="mb-4">
            <label>Şifre</label>
            <b-input-group :class="invalidField(errors.password)">
              <b-form-input ref="passwordInput" v-model="branch.password" type="password" @keyup.enter="authenticate"/>
              <b-input-group-append is-text>
                <i :class="invalidIcon(errors.password, 'ri-lock-line')"/>
              </b-input-group-append>
            </b-input-group>
            <span v-if="errors.password" class="text-danger">{{ errors.password }}</span>
          </b-col>
          <b-col cols="11" class="text-right">
            <b-button variant="outline-dark"
                      :class="{'disabled': !branch.id || !branch.password || loading || success}"
                      :disabled="!branch.id || !branch.password || loading || success"
                      @click="authenticate">
              <span v-if="!loading && !Object.keys(errors).length && !success">Giriş</span>
              <span v-if="!loading && Object.keys(errors).length">Yeniden Dene</span>
              <div v-if="loading">
                <b-spinner variant="primary"/>
                Doğrulanıyor
              </div>
              <span v-if="success">Başarılı</span>
            </b-button>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-alert v-if="errors.general" show variant="danger" class="shadow rounded mt-3">
      <i class="ri-error-warning-line"/> <strong>Hata!</strong> {{ errors.general }}
    </b-alert>
  </b-container>
</template>
<script>
import { ipcRenderer, remote } from 'electron'
import { mapActions, mapGetters } from 'vuex'
import genericMethods from '../mixins/genericMethods'
import Multiselect from 'vue-multiselect'
import _ from 'lodash'

export default {
  mixins: [genericMethods],
  components: { Multiselect },
  data () {
    return {
      authenticators: [],
      branch: {}
    }
  },
  computed: {
    ...mapGetters(['getSession'])
  },
  mounted () {
    this.$refs.passwordInput.focus()
    if (this.getSession.branchDetails) {
      this.login()
    } else {
      this.getAuthenticators()
    }
  },
  methods: {
    ...mapActions(['appendSession']),
    getAuthenticators () {
      const request = ipcRenderer.sendSync('/auth/list', this.branch)
      for (const authenticator of request.result) {
        this.authenticators.push({
          id: authenticator.id,
          name: authenticator.name
        })
      }
      this.branch.id = _.head(this.authenticators)
    },
    authenticate () {
      this.loading = true
      ipcRenderer.send('/auth', this.branch)
      new Promise(function (resolve) {
        ipcRenderer.on('authResult', (event, result) => {
          resolve(result)
        })
      }).then(result => {
        if (!result.status) {
          this.errors = result.errors
          this.loading = false
          this.loading = false
          return false
        } else {
          this.appendSession({ branchDetails: _.head(result.branchDetails) })
          this.login()
          return false
        }
      })
    },
    login () {
      this.errors = {}
      this.loading = false
      this.success = true
      this.$router.push('/Dashboard')
      remote.getCurrentWindow().maximize()
      remote.getCurrentWindow().setMinimumSize(1200, 600)
    },
    closeApp () {
      remote.getCurrentWindow().close()
    }
  }
}
</script>
<style>
.close-app {
  position: absolute;
  right: .6rem;
  top: .5rem;
  z-index: 1;
  font-size: 24px;
  color: #495057;
  cursor: pointer
}
</style>
