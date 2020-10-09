<template>
  <b-container fluid="true" class="px-0 m-0 frame-menu pr-0 bg-white" >
    <b-row class="mx-0">
      <b-col md="2" class="align-self-center bg-primary text-white py-4" >
        <i class="ri-menu-2-fill" />
        <span class="app-name">BLX.PETROL</span>
      </b-col>
      <b-col xl="4" md="5" class="align-self-center bg-white py-2" />
      <b-col xl="6" md="5" class="text-right px-0 pt-2 pb-1 bg-white text-primary align-self-center" >
        <span>
          <i class="frame-control ri-notification-3-line mr-5" />
          <i class="frame-control ri-mail-line mr-5" />
          <i class="frame-control ri-star-line mr-5" />
          <i class="frame-control ri-settings-5-line mr-5"/>
          <i class="frame-control ri-lock-line mr-5" />
          <span class="dropdown">
            <i class="frame-control ri-user-3-line dropdown-toggle mr-5" data-toggle="dropdown"/>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton" >
              <span class="dropdown-item-text"> {{ getSession.userDetails.username }}</span>
              <div class="dropdown-divider" />
              <a class="dropdown-item" href="#" @click="logout" >
                <i class="ri-logout-box-line" /> Güvenli Çıkış
              </a>
            </div>
          </span>
        </span>
        <span class="frame-control mr-3 ml-5 text-dark" @click="minimize()">
          <i class="ri-subtract-line " />
        </span>
        <span class="frame-control mx-3  text-dark" @click="maximize()">
          <i :class="[fullScreen ? 'ri-fullscreen-exit-line' : 'ri-checkbox-blank-line']" />
        </span>
        <span class="frame-control exit mx-3 text-dark" @click="close()">
          <i class="ri-close-line" />
        </span>
      </b-col>
    </b-row>
  </b-container>
</template>
<script type="application/javascript">
import {mapActions, mapGetters} from "vuex"
import genericMethods from "../mixins/genericMethods"
import {remote} from "electron"

export default {
  mixins: [genericMethods],
  data() {
    return {
      currentWindow: "",
      fullScreen: false,
      quickSearch: [],
      searchResults: [],
    }
  },
  computed: {
    ...mapGetters(["getSession"])
  },
  mounted: function () {
    this.currentWindow = remote.getCurrentWindow();
  },
  methods: {
    ...mapActions(["destroySession"]),
    minimize() {
      this.currentWindow.minimize();
    },
    maximize() {
      if (this.currentWindow.isMaximized()) {
        this.currentWindow.unmaximize();
        this.fullScreen = false;
      } else {
        this.currentWindow.maximize();
        this.fullScreen = true;
      }
    },
    isMaximized() {
      return this.currentWindow.isMaximized();
    },
    close() {
      this.currentWindow.close();
    },
    logout() {
      this.destroySession();
      this.close();
    },
  }
}
</script>
<style>
.frame-menu {
  position: fixed;
  -webkit-app-region: drag;
  top: 0;
  right: 0;
  z-index: 999999999999999;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.frame-control {
  -webkit-app-region: no-drag;
  padding-top: .3rem;
  font-size: 1.25rem;
  cursor: pointer;
}

.frame-control:hover {
  color: rgba(0, 0, 0, .75)
}

.frame-control.exit:hover {
  color: red;
}

.app-name {
  letter-spacing: 4px;
  font-weight: 400;
}

.no-drag {
  -webkit-app-region: no-drag;
}

.nav-buttons {
  font-size: 1rem;
  cursor: pointer;
}
</style>
