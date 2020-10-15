<template>
  <b-container fluid="true" class="px-0 m-0 frame-menu pr-0 bg-white w-100">
    <b-row class="mx-0">
      <b-col md="2" class="align-self-center bg-primary text-white py-4">
        <span class="app-name">ESMERPET</span>
      </b-col>
      <b-col md="5" xl="5" class="align-self-center">
        <b-nav pills v-if="this.getSession.salesOfficer">
          <b-nav-item active>Satış</b-nav-item>
          <b-nav-item>Müşterisiz İşlem</b-nav-item>
          <b-nav-item>Müşteri Listesi</b-nav-item>
          <b-nav-item>Raporlar</b-nav-item>
        </b-nav>
      </b-col>
      <b-col md="5" xl="5" class="text-right align-self-center no-drag">
        <b-button size="lg" variant="light" class="rounded-circle text-primary">
          <b-icon-bell class="text-primary"></b-icon-bell>
        </b-button>
        <b-button size="lg" variant="light" class="rounded-circle text-primary">
          <b-icon-gear class="text-primary"></b-icon-gear>
        </b-button>
        <b-dropdown size="lg" variant="light" right toggle-class="text-decoration-none text-primary rounded-circle mr-5"
                    no-caret>
          <template v-slot:button-content>
            <b-icon-person class="text-primary"></b-icon-person>
          </template>
          <b-dropdown-item href="#">{{ getSession.branchDetails.name }}</b-dropdown-item>
          <b-dropdown-item href="#" @click="logout">
            <b-icon-box-arrow-left></b-icon-box-arrow-left>
            Güvenli Çıkış
          </b-dropdown-item>
        </b-dropdown>
        <b-button variant="light" class="rounded-circle" @click="minimize()">
          <b-icon-dash></b-icon-dash>
        </b-button>
        <b-button variant="light" class="rounded-circle" @click="maximize()">
          <b-icon-fullscreen v-if="!fullScreen"></b-icon-fullscreen>
          <b-icon-fullscreen-exit v-else></b-icon-fullscreen-exit>
        </b-button>
        <b-button variant="light" class="rounded-circle" @click="close()">
          <b-icon-x></b-icon-x>
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>
<script type="application/javascript">
import { mapActions, mapGetters } from 'vuex'
import genericMethods from '../mixins/genericMethods'
import { remote } from 'electron'

export default {
  mixins: [genericMethods],
  data () {
    return {
      currentWindow: '',
      fullScreen: true,
      quickSearch: [],
      searchResults: []
    }
  },
  computed: {
    ...mapGetters(['getSession']),
    fullscreen: () => {
      this.currentWindow.isMaximized()
    }
  },
  mounted: function () {
    this.currentWindow = remote.getCurrentWindow()
  },
  methods: {
    ...mapActions(['destroySession']),
    minimize () {
      this.currentWindow.minimize()
    },
    maximize () {
      if (this.currentWindow.isMaximized()) {
        this.currentWindow.unmaximize()
        this.fullScreen = false
      } else {
        this.currentWindow.maximize()
        this.fullScreen = true
      }
    },
    isMaximized () {
      return this.currentWindow.isMaximized()
    },
    close () {
      this.currentWindow.close()
    },
    logout () {
      this.destroySession()
      this.close()
    }
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

.dropdown-menu {
  min-width: 18rem;
}

.dropdown-item-text, .dropdown-item {
  padding: 1rem 1.5rem
}

.btn {
  padding: 0.375rem 0.5rem;
}

.btn-lg, .btn-group-lg > .btn {
  padding: .5rem .7rem
}

button i {
  font-weight: 500;
}
</style>
