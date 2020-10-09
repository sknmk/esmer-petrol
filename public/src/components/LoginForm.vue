<template>
  <b-container fluid="true" class="p-0">
    <b-row>
      <i class="close-app ri-close-line" @click="closeApp()"/>
      <b-col cols="4" class="text-center align-self-center bg-light" >
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
            <label>Kullanıcı Adı</label>
            <b-input-group class="input-group" :class="invalidField(exception.username)">
              <b-form-input ref="usernameInput" v-model="user.username" type="text" />
              <b-input-group-append is-text>
                <i :class="invalidIcon(exception.username, 'ri-user-3-line')"/>
              </b-input-group-append>
            </b-input-group>
            <span v-if="exception.username" class="text-danger">{{ exception.username }}</span>
          </b-col>
          <b-col cols="11" class="mb-4" >
            <label>Şifre</label>
            <b-input-group :class="invalidField(exception.password)">
              <b-form-input v-model="user.password" type="password" @keyup.enter="authenticate"/>
              <b-input-group-append is-text>
                <i :class="invalidIcon(exception.password, 'ri-lock-line')"/>
              </b-input-group-append>
            </b-input-group>
            <span v-if="exception.password" class="text-danger">{{ exception.password }}</span>
          </b-col>
          <b-col cols="11" class="text-right">
            <b-button variant="outline-dark" :class="{'disabled': !user.username || !user.password || waitingResponse || success}"
                :disabled="!user.username || !user.password || waitingResponse || success"
                @click="authenticate">
              <span v-if="!waitingResponse && !Object.keys(exception).length && !success">Giriş</span>
              <span v-if="!waitingResponse && Object.keys(exception).length">Yeniden Dene</span>
              <div v-if="waitingResponse">
                <b-spinner variant="primary"/>
                Doğrulanıyor
              </div>
              <span v-if="success">Başarılı</span>
            </b-button>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-alert v-if="exception.general" show variant="danger" class=" shadow rounded mt-3" >
      <i class="ri-error-warning-line"/> <strong>Hata!</strong> {{ exception.general }}
    </b-alert>
  </b-container>
</template>
<script>
import {ipcRenderer, remote} from "electron"
import {mapGetters, mapActions} from "vuex"
import genericMethods from "../mixins/genericMethods"

export default {
  mixins: [genericMethods],
  data() {
    return {
      user: {},
      exception: {},
      success: false,
      waitingResponse: false
    }
  },
  computed: {
    ...mapGetters(["getSession"])
  },
  mounted() {
    this.$refs.usernameInput.focus()
    // if (this.getSession.userDetails) {
    //   this.login()
    // }
  },
  methods: {
    ...mapActions(["appendSession"]),
    authenticate() {
      let result = ipcRenderer.sendSync("/auth", this.user)
      this.waitingResponse = true
      if (!result.status) {
        setTimeout(() => {
          this.exception = result.exception
          this.waitingResponse = false
        }, 1000)
        return false
      } else {
        setTimeout(() => {
          this.appendSession({userDetails: result.userDetails[0]})
          this.login()
        }, 1000)
        return false
      }
    },
    login() {
      this.exception = {}
      this.waitingResponse = false
      this.success = true
      this.$router.push("/NewCustomer")
      remote.getCurrentWindow().maximize()
      remote.getCurrentWindow().setMinimumSize(1200, 600);
    },
    closeApp() {
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
