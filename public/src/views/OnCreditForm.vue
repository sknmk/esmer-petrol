<template>
  <b-container fluid="true">
    <b-row class="mt-5">
      <b-col offset="2" cols="8">
        <h5 class="mb-3">Veresiye Fişi</h5>
        <b-card>
          <b-form-row>
            <b-col cols="6">
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
          </b-form-row>
          <b-form-row v-if="!_.isEmpty(options.products)">
            <b-col cols="12 mt-4">
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
                    <b-td class="align-middle">₺{{ product.salePrice }}</b-td>
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
                <b-tfoot v-if="totalAmount > 0">
                  <b-tr>
                    <b-td colspan="3">
                      Yalnız {{ this.priceToString(totalAmount.toFixed(2))}}
                    </b-td>
                    <b-td colspan="2" class="text-right">
                      Toplam: ₺{{ totalAmount }}
                    </b-td>
                  </b-tr>
                </b-tfoot>
              </b-table-simple>
            </b-col>
          </b-form-row>
          <b-form-row>
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
                  :taggable="true"
                  :options="options.drivers"
                  @search-change="findDriver"
                  @tag="createDriver">
                <span slot="noOptions">Yazmaya devam edin.</span>
                <span slot="noResult">Sonuç bulunamadı.</span>
              </multiselect>
            </b-col>
          </b-form-row>
          <b-form-row class="mt-4">
            <b-col cols="12">
              <label>Açıklama <small class="text-muted">Opsiyonel</small></label>
              <b-input-group>
                <b-textarea v-model="description" rows="4"></b-textarea>
                <b-input-group-text>
                  <b-icon-pencil></b-icon-pencil>
                </b-input-group-text>
              </b-input-group>
            </b-col>
          </b-form-row>
          <b-form-row class="mt-4">
            <b-col>
              <label>&nbsp;</label>
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
            <b-col class="mt-4 text-right">
              <b-button variant="light" class="text-danger">
                <b-icon-x></b-icon-x>
                İptal
              </b-button>
              <b-button variant="outline-primary" @click="save">
                <b-icon-printer></b-icon-printer>
                Yazdır
              </b-button>
            </b-col>
          </b-form-row>
        </b-card>
      </b-col>
      <b-col cols="2">
        <h5 class="text-transparent mb-3">Son İşlemler</h5>
        <b-row>
          <b-col cols="12" class="mb-4">
            <b-card>
              <h6>
                <b-icon-building></b-icon-building>
                Ayvaz Lojistik
              </h6>
              <b-icon-truck></b-icon-truck>
              61VZ1990
              <hr/>
              200Lt. / ₺1440.50
            </b-card>
          </b-col>
          <b-col cols="12">
            <b-card>
              <h6>
                <b-icon-building></b-icon-building>
                Ayvaz Lojistik
              </h6>
              <b-icon-truck></b-icon-truck>
              52FA9912
              <hr/>
              155Lt. / ₺1140
            </b-card>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import { mapGetters } from 'vuex'
import Multiselect from 'vue-multiselect'
import genericMethods from '../mixins/genericMethods'
import { ipcRenderer } from 'electron'
import _ from 'lodash'

export default {
  mixins: [genericMethods],
  components: { Multiselect },
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
        return i.salePrice
      })
    },
    soldProducts: function () {
      return this.options.products.filter(function (i) {
        return parseFloat(i.price) > 0.1
      })
    },
    totalAmount: function () {
      return _.sumBy(this.soldProducts, function (p) {
        return parseFloat(p.price)
      })
    },
    branchId: function () {
      return this.getSession.branchDetails.branchId
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
    findPlate (name) {
      if (name.length < 3) {
        return false
      }
      this.options.plates = []
      ipcRenderer.removeAllListeners('plateList')
      ipcRenderer.send('/plate/list', {
        name,
        companyId: this.getSession.branchDetails.companyId
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
      const tag = {
        id: 'new',
        name: _.toUpper(plate)
      }
      this.plate = tag
      this.options.plates.push(tag)
    },
    findDriver (name) {
      if (name.length < 3) {
        return false
      }
      this.options.plates = []
      ipcRenderer.removeAllListeners('plateList')
      ipcRenderer.send('/plate/list', {
        name,
        companyId: this.getSession.branchDetails.companyId
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
    createDriver (plate) {
      const tag = {
        id: 'new',
        name: _.toUpper(plate)
      }
      this.plate = tag
      this.options.plates.push(tag)
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
            salePrice: product.salePrice.toFixed(2),
            forwardSalePrice: product.forwardSalePrice,
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
          _.multiply(parseFloat(this.options.products[i].liter), parseFloat(this.options.products[i].salePrice))
            .toFixed(2)
    },
    fillLiter (i) {
      this.options.products[i].liter =
          _.divide(parseFloat(this.options.products[i].price), parseFloat(this.options.products[i].salePrice))
            .toFixed(2)
    },
    save () {
      ipcRenderer.send('/oncredit/create', {
        products: this.soldProducts,
        companyId: this.companyId,
        branchId: this.branchId,
        salesofficerId: this.salesofficerId
      })
      new Promise(function (resolve) {
        ipcRenderer.on('oncreditCreate', (event, response) => {
          resolve(response)
        })
      }).then(response => {
        this.success = true
      })
    }
  }
}
</script>
