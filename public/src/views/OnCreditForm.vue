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
                  @input="resetPlateDriver"
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
                  ref="plateInput"
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
            <b-col cols="6" v-if="driver.id">
              <label>Şoför T.C. No</label>
              <b-input-group>
                <b-input type="number" v-model="driver.taxNumber"></b-input>
                <b-input-group-text>
                  <b-icon-sort-numeric-down></b-icon-sort-numeric-down>
                </b-input-group-text>
              </b-input-group>
            </b-col>
          </b-form-row>
          <b-form-row style="overflow-y: auto; max-height: 50vh" v-if="!_.isEmpty(options.products) && driver.id && plate.id && customer.id">
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
                    <b-td class="align-middle text-capitalize">{{ product.name }}</b-td>
                    <b-td class="align-middle">₺{{ product.salePrice }}</b-td>
                    <b-td>
                      <b-input-group>
                        <b-input type="number"
                                 step=".01"
                                 min="0.10"
                                 placeholder="Litre giriniz."
                                 @input="fillPrice(i)"
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
                                 @input="fillLiter(i)"
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
                      Toplam: ₺{{ totalPrice.toFixed(2) }}
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
                  disabled
                  v-model="sms"
                  id="sms"
                  name="sms"
                  value="1"
                  unchecked-value="0">
                Bilgilendirme SMS'i gönderilsin.
              </b-form-checkbox>
            </b-col>
            <b-col class="mt-2 text-right">
              <b-button variant="light" class="text-danger" @click="backtoUserSelector()">
                <b-icon-x></b-icon-x>
                İptal
              </b-button>
              <b-button :variant="!_.isEmpty(errors) ? 'outline-danger' : (!success ? 'outline-primary' : 'success')"
                        @click="save"
                        :disabled="!customer.id || !plate.id || _.isEmpty(soldProducts) || !driver.id || loading || success">
                <span v-if="loading"><b-spinner></b-spinner> Bekleyiniz..</span>
                <span v-if="!loading && _.isEmpty(errors) && !success"><b-icon-printer></b-icon-printer> Yazdır</span>
                <span v-if="!_.isEmpty(errors)"><b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise> Tekrar Dene</span>
                <span v-if="success"><b-icon-check2-circle></b-icon-check2-circle> Yazdırıldı</span>
              </b-button>
            </b-col>
          </b-form-row>
        </b-card>
      </b-col>
      <b-col cols="3">
        <div class="accordion col-12 mb-3 mt-4" role="tablist" v-if="customer.id">
          <b-card no-body class="mb-1 mt-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.payment-accordion-1 variant="outline-dark" style="margin-top: 11px !important;">
                <b-icon-plus></b-icon-plus>
                Yeni Tahsilat Girişi
              </b-button>
            </b-card-header>
            <b-collapse id="payment-accordion-1" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-form-row>
                  <b-col>
                    <label>Tahsilat Tutarı*</label>
                    <b-input-group>
                      <b-input type="number" v-model="payment.amount" ref="paymentAmount"></b-input>
                      <b-input-group-text>
                        <b-icon-sort-numeric-down></b-icon-sort-numeric-down>
                      </b-input-group-text>
                    </b-input-group>
                  </b-col>
                </b-form-row>
                <b-form-row>
                  <b-col>
                    <label>Açıklama</label>
                    <b-input-group>
                      <b-input type="text" ref="paymentDescription" v-model="payment.description"></b-input>
                      <b-input-group-text>
                        <b-icon-text-center></b-icon-text-center>
                      </b-input-group-text>
                    </b-input-group>
                  </b-col>
                </b-form-row>
                <div class="mt-2">
                  <b-form-radio-group>
                    <div v-for="item in paymentTypes" :key="item.id">
                      <b-form-radio name="paymentType" size="lg" :value="item.id" v-model="payment.paymentType"
                                    :checked="item.id == 1" checked-value="1">{{ item.name }}
                      </b-form-radio>
                    </div>
                  </b-form-radio-group>
                </div>
                <b-form-row class="mt-2">
                  <div class="align-self-center float-left">
                    <b-form-checkbox
                        disabled
                        v-model="sms"
                        id="sms"
                        name="sms"
                        value="1"
                        unchecked-value="0">
                      SMS
                    </b-form-checkbox>
                  </div>
                  <b-col class="mt-2 text-right">
                    <b-button variant="light" class="text-danger" v-b-toggle.payment-accordion-1>
                      <b-icon-x></b-icon-x>
                      İptal
                    </b-button>
                    <b-button
                        :variant="!_.isEmpty(paymentErrors) ? 'outline-danger' : (!paymentSuccess ? 'outline-primary' : 'success')"
                        @click="savePayment"
                        :disabled="!payment.amount || paymentLoading || paymentSuccess">
                      <span v-if="paymentLoading"><b-spinner></b-spinner> Bekleyiniz..</span>
                      <span v-if="!paymentLoading && _.isEmpty(paymentErrors) && !paymentSuccess"><b-icon-check></b-icon-check> Kaydet</span>
                      <span v-if="!_.isEmpty(paymentErrors)"><b-icon-arrow-counterclockwise></b-icon-arrow-counterclockwise> Tekrar Dene</span>
                      <span v-if="paymentSuccess"><b-icon-check2-circle></b-icon-check2-circle> Kaydedildi</span>
                    </b-button>
                  </b-col>
                </b-form-row>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
        <div>
          <last-transactions></last-transactions>
        </div>
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
  data() {
    return {
      customer: [],
      payment: [],
      plate: [],
      driver: [],
      description: null,
      paymentTypes: [],
      paymentErrors: [],
      paymentSuccess: false,
      paymentLoading: false,
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
    _() {
      return _
    },
    pricedProducts: function () {
      return this.options.products.filter(function (i) {
        return i.salePrice
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
      if (this.customer.oncreditDisabled) {
        this.$bvToast.toast('Bu müşteri veresiye satışına kapalıdır.', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        this.options.customers = []
        return false
      } else {
        this.getProducts()
      }
    }
  },
  mounted() {
    this.$refs.plateInput.$el.focus()
    this.$root.$on('bv::collapse::state', (collapseId, isJustShown) => {
      if (collapseId == 'payment-accordion-1' && isJustShown == true) {
        setTimeout(() => {
          this.$refs.paymentAmount.$el.focus()
        }, 500)
      }
    })

    ipcRenderer.send('/oncredit/paymentTypeList')
    new Promise(function (resolve) {
      ipcRenderer.on('paymentTypeList', (event, response) => {
        resolve(response)
      })
    }).then(response => {
      this.paymentTypes = response
    })
  },
  methods: {
    findCustomer(name) {
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
            name: customer.name.toUpperCase(),
            discount: customer.forwardSalesDiscountRate,
            oncreditDisabled: customer.oncreditDisabled
          })
        }
      })
    },
    findPlate(plate) {
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
            customerDriverId: plate.customerDriverId,
            customerDriverName: plate.customerDriverName,
            customerDriverTaxNumber: plate.customerDriverTaxNumber,
            customerOncreditDisabled: plate.customerOncreditDisabled,
            customerDiscount: plate.customerDiscount
          })
        }
      })
    },
    resetPlateDriver() {
      this.plate = {}
      this.driver = {}
    },
    createPlate(plate) {
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
    plateValidation(plate) {
      if (plate.length < 7 || plate.length > 32) {
        this.$bvToast.toast('Geçersiz bir plaka girdiniz.', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        return false
      }
    },
    findDriver(name) {
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
            name: driver.name,
            taxNumber: driver.taxNumber
          })
        }
      })
    },
    createDriver(name) {
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
    driverValidation(name) {
      const namePieces = name.split(' ')
      if (namePieces[0].length < 3 || name.length < 7 || name.length > 50) {
        this.$bvToast.toast('Geçersiz bir şoför ismi girdiniz.', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        return false
      }
    },
    checkCustomer() {
      if (this.plate.customerOncreditDisabled) {
        this.$bvToast.toast(this.plate.customerName + ' veresiye satışına kapalıdır. İşlem yapamazsınız!', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-center',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        return false
      }
      this.customer = {
        id: this.plate.customerId,
        name: this.plate.customerName.toUpperCase(),
        discount: this.plate.customerDiscount
      }
      if (this.plate && this.plate.customerDriverName.length > 0) {
        this.driver = {
          id: this.plate.customerDriverId,
          name: this.plate.customerDriverName,
          taxNumber: this.plate.customerDriverTaxNumber
        }
      }
    },
    getProducts() {
      this.options.products = []
      const form = {
        branchId: this.getSession.branchDetails.id,
        discount: this.customer ? this.customer.discount : 0,
        customerId: this.customer.id
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
            salePrice: product.specialSalePrice > 0 ? product.specialSalePrice.toFixed(2) : product.salePrice.toFixed(2),
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
    fillPrice(i) {
      this.options.products[i].price = (parseFloat(this.options.products[i].liter) * parseFloat(this.options.products[i].salePrice)).toFixed(2)
    },
    fillLiter(i) {
      this.options.products[i].liter = (parseFloat(this.options.products[i].price) / parseFloat(this.options.products[i].salePrice)).toFixed(2)
    },
    insertDriver() {
      if (this.driver && this.driver.id === 'new') {
        const form = {
          customerId: this.customer.id,
          driver: this.driver.name,
          taxNumber: this.driver.taxNumber
        }
        return ipcRenderer.sendSync('/driver/create', form)
      }
    },
    insertPlate() {
      if (this.plate && this.plate.id === 'new') {
        const form = {
          customerId: this.customer.id,
          plate: this.plate.name
        }
        return ipcRenderer.sendSync('/plate/create', form)
      }
    },
    savePayment() {
      // check before send
      if (isNaN(this.customer.id)) {
        this.$bvToast.toast('Öncelikle Müşteri Seçmelisiniz!', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-right',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        return false
      }
      if (isNaN(this.payment.amount) || this.payment.amount <= 0 || this.payment.amount > 9999999) {
        this.$bvToast.toast('Tahsilat tutarını kontrol ediniz!', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-right',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        return false
      }
      if (isNaN(this.payment.paymentType)) {
        this.$bvToast.toast('Tahsilat Türünü Seçmelisiniz!', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-right',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        return false
      }
      if (this.payment.paymentType == 4 && this.payment.description == null) {
        this.$bvToast.toast('Çek için açıklama bölümüne vade bilgisi giriniz!', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-right',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        this.$refs.paymentDescription.$el.focus()
        return false
      }
      if (this.payment.paymentType == 5 && this.payment.description == null) {
        this.$bvToast.toast('Senet için açıklama bölümüne vade bilgisi giriniz!', {
          title: 'Uyarı',
          toaster: 'b-toaster-top-right',
          variant: 'danger',
          solid: true,
          toastClass: 'mt-6',
          noCloseButton: false,
          appendToast: true
        })
        this.$refs.paymentDescription.$el.focus()
        return false
      }
      // send value
      const driverId = this.driver.id === 'new' ? this.insertDriver() : this.driver.id
      const plateId = this.plate.id === 'new' ? this.insertPlate() : this.plate.id

      this.paymentloading = true
      this.paymentErrors = []
      ipcRenderer.send('/oncredit/createPayment', {
        companyId: this.companyId,
        branchId: this.branchId,
        salesofficerId: this.salesofficerId,
        customer: this.customer,
        amount: this.payment.amount,
        paymentType: this.payment.paymentType,
        description: this.payment.description,
        sms: this.sms,
        plateId: plateId || 0,
        driverId: driverId || 0,
        driverTaxNumber: this.driver.taxNumber
      })
      new Promise(function (resolve) {
        ipcRenderer.on('paymentCreate', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        this.paymentLoading = false
        if (!_.isEmpty(response.errors)) {
          this.paymentErrors = response.errors
          for (let error in this.paymentErrors) {
            this.$bvToast.toast(this.paymentErrors[error], {
              title: 'Hata',
              toaster: 'b-toaster-top-center',
              variant: 'danger',
              solid: true,
              toastClass: 'mt-6',
              noCloseButton: false,
              appendToast: true
            })
          }
          return false
        } else {
          this.paymentLoading = false
          this.payment = []
          setTimeout(() => {
            this.backtoUserSelector()
          }, 2000)
          this.printPayment(response.moneyFlowId, 1)
        }
      })

    },
    save() {
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
        driverTaxNumber: this.driver.taxNumber,
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
          for (let error in this.errors) {
            this.$bvToast.toast(this.errors[error], {
              title: 'Hata',
              toaster: 'b-toaster-top-center',
              variant: 'danger',
              solid: true,
              toastClass: 'mt-6',
              noCloseButton: false,
              appendToast: true
            })
          }
          return false
        } else {
          if (isNaN(response.oncreditId)) {
            alert('Kritik hata. oncreditId alınamadı')
            return false
          }
          this.printOnCredit(response.oncreditId, 3)
          setTimeout(() => {
            this.backtoUserSelector()
          }, 2000)
        }
      })
    },
    printOnCredit: function (oncreditId) {
      this.loading = true
      ipcRenderer.send('/oncredit/print', {
        oncreditId: oncreditId,
        copy: false
      })
      new Promise(function (resolve) {
        ipcRenderer.on('printResult', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        this.loading = false
        if (response.status !== true) {
          this.$bvToast.toast('Yazdırma başarısız oldu, yazıcı bulunamadı.', {
            title: 'Hata',
            toaster: 'b-toaster-top-center',
            variant: 'danger',
            solid: true,
            toastClass: 'mt-6',
            noCloseButton: false,
            appendToast: true
          })
        } else {
          this.success = true
          this.$bvToast.toast('Yazdırıldı. ', {
            title: 'Bilgi',
            toaster: 'b-toaster-top-center',
            variant: 'success',
            solid: true,
            toastClass: 'mt-6',
            noCloseButton: false,
            appendToast: true
          })
        }
      })
    },
    printPayment: function (moneyFlowId) {
      ipcRenderer.send('/oncredit/printPayment', {
        moneyFlowId,
        copy: false
      })
      new Promise(function (resolve) {
        ipcRenderer.on('printPaymentResult', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        if (response.status !== true) {
          this.$bvToast.toast('Yazdırma başarısız oldu, yazıcı bulunamadı.', {
            title: 'Hata',
            toaster: 'b-toaster-top-center',
            variant: 'danger',
            solid: true,
            toastClass: 'mt-6',
            noCloseButton: false,
            appendToast: true
          })
        } else {
          this.success = true
          this.$bvToast.toast('Yazdırıldı. ', {
            title: 'Bilgi',
            toaster: 'b-toaster-top-center',
            variant: 'success',
            solid: true,
            toastClass: 'mt-6',
            noCloseButton: false,
            appendToast: true
          })
        }
      })
    },
    backtoUserSelector: function () {
      this.$router.push('/Dashboard')
    }
  }
}
</script>
