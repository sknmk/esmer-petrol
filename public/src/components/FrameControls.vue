<template>
  <b-container fluid="true" class="px-0 m-0 frame-menu pr-0 bg-white w-100">
    <b-row class="mx-0">
      <b-col md="2" class="align-self-center py-1">
        <img src="../img/logo-blx.png" alt="logo" height="32"/>
      </b-col>
      <b-col offset-md="5" md="5" class="text-right align-self-center">
        <span class="pointer no-drag" v-b-popover.hover.left="'Güvenli Çıkış'" @click="logout">
          <b-icon-box-arrow-left></b-icon-box-arrow-left>
          Güvenli Çıkış
        </span>
        <span class="mr-5">
           <b-icon-dot class="text-muted mx-3"></b-icon-dot>
           {{ getSession.branchDetails.name }}
        </span>
        <b-button variant="light" class="rounded-circle no-drag" @click="minimize()">
          <b-icon-dash></b-icon-dash>
        </b-button>
        <b-button variant="light" class="rounded-circle no-drag" @click="maximize()">
          <b-icon-fullscreen v-if="!fullScreen"></b-icon-fullscreen>
          <b-icon-files v-else></b-icon-files>
        </b-button>
        <b-button variant="light" class="rounded-circle no-drag" @click="close()">
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
