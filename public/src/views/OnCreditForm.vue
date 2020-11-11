<template>
  <b-container fluid="true">
    <b-row class="mt-2">
      <b-col cols="9">
        <h5 class="mb-3">Veresiye Fişi</h5>
        <b-card>
          <b-form-row>
            <b-col cols="6" class="mb-3">
              <label>Müşteri</label>
              <multiselect
                  v-model="customer"
                  placeholder="Yazınız"
                  selectLabel="Seç"
                  deselectLabel="Sil"
                  selectedLabel="Seçildi"
                  track-by="id"
                  label="name"
                  :options="options.customers"
                  @search-change="findCustomer">
                <span slot="noOptions">Yazmaya devam edin.</span>
                <span slot="noResult">Sonuç bulunamadı.</span>
              </multiselect>
            </b-col>
            <b-col cols="6">
              <label>Plaka</label>
              <multiselect
                  v-model="plate"
                  placeholder="Yazınız"
                  selectLabel="Seç"
                  deselectLabel="Sil"
                  selectedLabel="Seçildi"
                  track-by="id"
                  label="name"
                  tagPlaceholder="Plakayı tanıtmak için enter."
                  :taggable="true"
                  :options="options.plates"
                  @input="checkCustomer"
                  @search-change="findPlate"
                  @tag="createPlate">
                <span slot="noOptions">Yazmaya devam edin.</span>
                <span slot="noResult">Sonuç bulunamadı.</span>
              </multiselect>
            </b-col>
            <b-col cols="6">
              <label>Teslim Alan Şoför</label>
              <multiselect
                  v-model="driver"
                  placeholder="Yazınız"
                  selectLabel="Seç"
                  deselectLabel="Sil"
                  selectedLabel="Seçildi"
                  track-by="id"
                  label="name"
                  tagPlaceholder="Şoförü tanıtmak için enter."
                  :disabled="!customer.id"
                  :taggable="true"
                  :options="options.drivers"
                  @search-change="findDriver"
                  @tag="createDriver">
                <span slot="noOptions">Yazmaya devam edin.</span>
                <span slot="noResult">Sonuç bulunamadı.</span>
              </multiselect>
            </b-col>
          </b-form-row>
          <b-form-row v-if="!_.isEmpty(options.products) && driver.id && plate.id && customer.id">
            <b-col cols="12 mt-3">
              <b-table-simple responsive>
                <b-thead>
                  <b-tr>
                    <b-th>Yakıt</b-th>
                    <b-th>Birim Fiyat</b-th>
                    <b-th>Miktar</b-th>
                    <b-th>Toplam Fiyat</b-th>
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <b-tr v-for="(product, i) of pricedProducts" :key="i">
                    <b-td class="align-middle">{{ product.name }}</b-td>
                    <b-td class="align-middle">₺{{ product.forwardSalePrice }}</b-td>
                    <b-td>
                      <b-input-group>
                        <b-input type="number"
                                 step=".01"
                                 min="0.10"
                                 placeholder="Litre giriniz."
                                 @keyup="fillPrice(i)"
                                 v-model="product.liter">
                        </b-input>
                        <b-input-group-text>
                          Lt.
                        </b-input-group-text>
                      </b-input-group>
                    </b-td>
                    <b-td class="pr-0">
                      <b-input-group prepend="₺">
                        <b-input type="number"
                                 step=".01"
                                 min="0.10"
                                 max="999999"
                                 placeholder="0.00"
                                 @keyup="fillLiter(i)"
                                 v-model="product.price">
                        </b-input>
                      </b-input-group>
                    </b-td>
                  </b-tr>
                  <b-tr>
                    <b-td class="align-middle" colspan="3">Diğer</b-td>
                    <b-td class="pr-0">
                      <b-input-group prepend="₺">
                        <b-input type="number"
                                 step=".01"
                                 min="0.10"
                                 placeholder="0.00"
                                 max="999999"
                                 v-model="options.products[Object.keys(options.products).length - 1].price">
                        </b-input>
                      </b-input-group>
                    </b-td>
                  </b-tr>
                </b-tbody>
                <b-tfoot v-if="totalPrice > 0">
                  <b-tr>
                    <b-td colspan="3">
                      Yalnız {{ this.priceToString(totalPrice.toFixed(2)) }}
                    </b-td>
                    <b-td colspan="2" class="text-right">
                      Toplam: ₺{{ totalPrice }}
                    </b-td>
                  </b-tr>
                </b-tfoot>
              </b-table-simple>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col cols="12">
              <label>Açıklama <small class="text-muted">Opsiyonel</small></label>
              <b-input-group>
                <b-input v-model="description" rows="4"></b-input>
                <b-input-group-text>
                  <b-icon-pencil></b-icon-pencil>
                </b-input-group-text>
              </b-input-group>
            </b-col>
          </b-form-row>
          <b-form-row class="mt-2">
            <b-col class="align-self-center">
              <b-form-checkbox
                  v-model="sms"
                  id="sms"
                  name="sms"
                  value="1"
                  unchecked-value="0">
                Bilgilendirme SMS'i gönderilsin.
                <b-icon-chat-left-text></b-icon-chat-left-text>
              </b-form-checkbox>
            </b-col>
            <b-col class="mt-2 text-right">
              <b-button variant="light" class="text-danger">
                <b-icon-x></b-icon-x>
                İptal
              </b-button>
              <b-button :variant="!success ? 'outline-primary' : 'success'" @click="save"
                        :disabled="!customer.id || !plate.id || _.isEmpty(soldProducts) || !driver.id || loading || success">
                <span v-if="loading"><b-icon-arrow-clockwise
                    animation="spin"></b-icon-arrow-clockwise> Bekleyiniz..</span>
                <span v-if="!loading && _.isEmpty(errors) && !success"><b-icon-printer></b-icon-printer> Yazdır</span>
                <span v-if="!_.isEmpty(errors)">Hata</span>
                <span v-if="success"><b-icon-check2-circle></b-icon-check2-circle> Yazdırıldı</span>
              </b-button>
            </b-col>
          </b-form-row>
        </b-card>
      </b-col>
      <b-col cols="3">
        <last-transactions></last-transactions>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { ipcRenderer } from 'electron'
import { mapGetters } from 'vuex'
import _ from 'lodash'
import Multiselect from 'vue-multiselect'
import genericMethods from '../mixins/genericMethods'
import LastTransactions from '../components/LastTransactions.vue'

export default {
  mixins: [genericMethods],
  components: {
    Multiselect,
    LastTransactions
  },
  data () {
    return {
      customer: [],
      plate: [],
      driver: [],
      description: null,
      sms: 0,
      options: {
        customers: [],
        plates: [],
        products: [],
        drivers: []
      }
    }
  },
  computed: {
    ...mapGetters(['getSession']),
    _ () {
      return _
    },
    pricedProducts: function () {
      return this.options.products.filter(function (i) {
        return i.forwardSalePrice
      })
    },
    soldProducts: function () {
      return this.options.products.filter(function (i) {
        return parseFloat(i.price) > 0.1
      })
    },
    totalPrice: function () {
      return _.sumBy(this.soldProducts, function (p) {
        return _.round(p.price, 2)
      })
    },
    branchId: function () {
      return this.getSession.branchDetails.id
    },
    companyId: function () {
      return this.getSession.branchDetails.companyId
    },
    salesofficerId: function () {
      return this.getSession.salesofficer.id
    }
  },
  watch: {
    customer: function () {
      this.getProducts()
    }
  },
  mounted () {
    this.getProducts()
  },
  methods: {
    findCustomer (name) {
      if (name.length < 3) {
        return false
      }
      this.options.customers = []
      ipcRenderer.removeAllListeners('customerList')
      ipcRenderer.send('/customer/list', {
        name,
        companyId: this.getSession.branchDetails.companyId
      })
      new Promise(function (resolve) {
        ipcRenderer.on('customerList', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        for (const customer of response) {
          this.options.customers.push({
            id: customer.id,
            name: customer.name,
            discount: customer.forwardPriceDiscount
          })
        }
      })
    },
    findPlate (plate) {
      if (plate.length < 3) {
        return false
      }
      this.options.plates = []
      ipcRenderer.removeAllListeners('plateList')
      ipcRenderer.send('/plate/list', {
        plate,
        customerId: this.customer.id ? this.customer.id : null
      })
      new Promise(function (resolve) {
        ipcRenderer.on('plateList', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        for (const plate of response) {
          this.options.plates.push({
            id: plate.id,
            name: plate.plate,
            customerId: plate.customerId,
            customerName: plate.customerName,
            customerDiscount: plate.customerDiscount
          })
        }
      })
    },
    createPlate (plate) {
      if (this.plateValidation(plate) === false) {
        return false
      }
      const tag = {
        id: 'new',
        name: _.toUpper(plate)
      }
      this.plate = tag
      this.options.plates.push(tag)
    },
    plateValidation (plate) {
      if (plate.length < 7 || plate.length > 32) {
        this.$bvToast.toast('Geçersiz bir plaka girdiniz.', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: true,
          appendToast: true
        })
        return false
      }
    },
    findDriver (name) {
      if (name.length < 3) {
        return false
      }
      this.options.drivers = []
      ipcRenderer.removeAllListeners('driverList')
      ipcRenderer.send('/driver/list', {
        name,
        customerId: this.customer.id
      })
      new Promise(function (resolve) {
        ipcRenderer.on('driverList', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        for (const driver of response) {
          this.options.drivers.push({
            id: driver.id,
            name: driver.name
          })
        }
      })
    },
    createDriver (name) {
      if (this.driverValidation(name) === false) {
        return false
      }
      const tag = {
        id: 'new',
        name: _.toUpper(name)
      }
      this.driver = tag
      this.options.drivers.push(tag)
    },
    driverValidation (name) {
      const namePieces = name.split(' ')
      if (namePieces[0].length < 3 || name.length < 7 || name.length > 50) {
        this.$bvToast.toast('Geçersiz bir şoför ismi girdiniz.', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: true,
          appendToast: true
        })
        return false
      }
    },
    checkCustomer () {
      if (_.isEmpty(this.customer)) {
        this.customer = {
          id: this.plate.customerId,
          name: this.plate.customerName,
          discount: this.plate.customerDiscount
        }
      }
    },
    getProducts () {
      this.options.products = []
      const form = {
        branchId: this.getSession.branchDetails.id,
        discount: !_.isEmpty(this.customer) ? this.customer.discount : 0
      }
      ipcRenderer.send('/product/list', form)
      new Promise(function (resolve) {
        ipcRenderer.on('productList', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        for (const product of response) {
          this.options.products.push({
            id: product.id,
            name: product.name,
            forwardSalePrice: product.forwardSalePrice.toFixed(2),
            price: null,
            liter: null
          })
        }
        this.options.products.push({
          id: 'other',
          name: 'Diğer'
        })
      })
    },
    fillPrice (i) {
      this.options.products[i].price =
          _.multiply(parseFloat(this.options.products[i].liter), parseFloat(this.options.products[i].forwardSalePrice))
            .toFixed(2)
    },
    fillLiter (i) {
      this.options.products[i].liter =
          _.divide(parseFloat(this.options.products[i].price), parseFloat(this.options.products[i].forwardSalePrice))
            .toFixed(2)
    },
    insertDriver () {
      if (this.driver && this.driver.id === 'new') {
        const form = {
          customerId: this.customer.id,
          driver: this.driver.name
        }
        return ipcRenderer.sendSync('/driver/create', form)
      }
    },
    insertPlate () {
      if (this.plate && this.plate.id === 'new') {
        const form = {
          customerId: this.customer.id,
          plate: this.plate.name
        }
        return ipcRenderer.sendSync('/plate/create', form)
      }
    },
    save () {
      this.loading = true
      this.errors = []
      const driverId = this.driver.id === 'new' ? this.insertDriver() : this.driver.id
      const plateId = this.plate.id === 'new' ? this.insertPlate() : this.plate.id
      ipcRenderer.send('/oncredit/create', {
        products: this.soldProducts,
        companyId: this.companyId,
        branchId: this.branchId,
        salesofficerId: this.salesofficerId,
        customer: this.customer,
        description: this.description,
        sms: this.sms,
        plateId,
        driverId,
        totalPrice: this.totalPrice
      })
      new Promise(function (resolve) {
        ipcRenderer.on('oncreditCreate', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        this.loading = false
        if (!_.isEmpty(response.errors)) {
          this.errors = response.errors
          return false
        } else {
          if (isNaN(response.oncreditId)) {
            console.log('response:')
            console.log(response)
            alert('oncreditId alınamadı!')
            return false
          }
          this.printOnCredit(response.oncreditId)
        }
      })
    },
    // print (oncreditId) {
    //   this.loading = true
    //   ipcRenderer.send('/oncredit/print', { oncreditId })
    //   new Promise(function (resolve) {
    //     ipcRenderer.on('printResult', (event, response) => {
    //       resolve(response)
    //     })
    //   }).then(response => {
    //     this.loading = false
    //     if (!response.status) {
    //       this.$bvToast.toast('Yazdırma başarısız oldu. ', {
    //         title: 'Hata',
    //         toaster: 'b-toaster-bottom-center',
    //         variant: 'danger',
    //         solid: true,
    //         toastClass: 'mt-6',
    //         noCloseButton: true,
    //         appendToast: true
    //       })
    //     } else {
    //       this.success = true
    //       this.$bvToast.toast('İşlem başarılı. ', {
    //         title: 'Bilgi',
    //         toaster: 'b-toaster-bottom-center',
    //         variant: 'success',
    //         solid: true,
    //         toastClass: 'mt-6',
    //         noCloseButton: true,
    //         appendToast: true
    //       })
    //       setTimeout(() => {
    //         this.$router.push('/Dashboard')
    //       }, 2000)
    //     }
    //   })
    // },
    printOnCredit: function (oncreditId) {
      this.loading = true
      ipcRenderer.send('/oncredit/print', { oncreditId: oncreditId })
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
