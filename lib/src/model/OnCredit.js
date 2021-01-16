import Database from './Database'
import _ from 'lodash'
import moment from 'moment'

export default class OnCredit {
    constructor() {
        const dbObj = new Database()
        this.db = dbObj.connect()
    }

    get(form, limit) {
        form.branchId = form.branchId || 0
        form.oncreditId = form.oncreditId || 0
        limit = limit || false
        const q = this.db('oncreditProduct')
            .leftJoin('oncredit', 'oncredit.id', 'oncreditProduct.oncreditId')
            .leftJoin('customer', 'customer.id', 'oncredit.customerId')
            .leftJoin('customerDriver', 'customerDriver.id', 'oncredit.customerDriverId')
            .leftJoin('customerPlate', 'customerPlate.id', 'oncredit.customerPlateId')
            .leftJoin('salesofficer', 'salesofficer.id', 'oncredit.salesofficerId')
            .leftJoin('product', 'product.id', 'oncreditProduct.productId')
            .select(
                'oncreditProduct.id as id',
                'oncredit.branchId',
                'oncredit.id as oncreditId',
                'oncredit.description',
                'oncredit.sms',
                'oncredit.createDate',
                'oncredit.totalPrice',
                'customer.name as customerName',
                'customer.taxNumber as customerTaxNumber',
                'customer.gsm as customerGsm',
                'customer.address as customerAddress',
                'customerDriver.name as driverName',
                'customerDriver.taxNumber as driverTaxNumber',
                'product.name as productName',
                'customerPlate.plate',
                'salesofficer.name as salesofficerName',
                'oncreditProduct.price',
                'oncreditProduct.subTotal',
                'oncreditProduct.amount'
            )
        if (form.branchId) {
            q.where('oncredit.branchId', form.branchId)
            q.groupBy('oncredit.id')
            q.orderBy('oncredit.id', 'desc')
        }
        if (form.oncreditId) {
            q.where('oncreditProduct.oncreditId', form.oncreditId)
            q.where('oncredit.id', form.oncreditId)
        } else {
            q.where('oncredit.isDeleted', 0)
        }
        if (form.customerId) {
            q.where('oncredit.customerId', form.customerId)
        }
        if (limit !== false) {
            q.limit(limit)
        }
        return q
    }

    getPayment(form, limit) {
        form.branchId = form.branchId || 0
        form.oncreditId = form.oncreditId || 0
        limit = limit || false
        const q = this.db('customerMoneyFlow as mf')
            .leftJoin('customer', 'customer.id', 'mf.customerId')
            .leftJoin('customerDriver', 'customerDriver.id', 'mf.customerDriverId')
            .leftJoin('customerPlate', 'customerPlate.id', 'mf.customerPlateId')
            .leftJoin('salesofficer', 'salesofficer.id', 'mf.salesofficerId')
            .select(
                'mf.id',
                'mf.branchId',
                'mf.description',
                'mf.createDate',
                'mf.amount',
                'customer.name as customerName',
                'customer.taxNumber as customerTaxNumber',
                'customer.gsm as customerGsm',
                'customer.address as customerAddress',
                'customerDriver.name as driverName',
                'customerDriver.taxNumber as driverTaxNumber',
                'customerPlate.plate',
                'salesofficer.name as salesofficerName',
            )
        if (form.branchId) {
            q.where('mf.branchId', form.branchId)
            q.groupBy('mf.id')
            q.orderBy('mf.id', 'desc')
        }
        if (form.customerId) {
            q.where('mf.customerId', form.customerId)
        }
        if (limit !== false) {
            q.limit(limit)
        }
        return q
    }


    getPaymentTypes() {
        return this.db('paymentType')
            .select(
                'id',
                'name'
            )
            .where('isDeleted', 0)
    }

    create(form) {
        return this.db('oncredit').insert(form)
    }

    createPayment(form) {
        return this.db('customerMoneyFlow').insert(form)
    }

    static validate(form, products) {
        const errors = {}

        if (isNaN(form.customerId)) {
            errors.customerId = 'Kritik hata, müşteri bulunamadı.' + form.customerId
        }

        if (isNaN(form.branchId)) {
            errors.branchId = 'Kritik hata, şube bilgisi bulunamadı.'
        }

        if (isNaN(form.salesOfficerId)) {
            errors.salesofficerId = 'Kritik hata, satış görevlisi kimliği bulunamadı.'
        }

        if (isNaN(form.customerPlateId)) {
            errors.customerPlateId = 'Plaka bilgisi zorunludur...'
        }

        if (isNaN(form.customerDriverId)) {
            errors.customerDriverId = 'Şoför bilgisi zorunludur.'
        }

        if (isNaN(form.customerDriverTaxNumber) || form.customerDriverTaxNumber.length != 11) {
            errors.customerDriverTaxNumber = 'Şoför T.C.si 11 karakter olmalıdır.'
        }

        if (_.isEmpty(products)) {
            errors.products = 'Ürün seçimi yapılmadı.'
        }

        return {
            status: Object.keys(errors).length === 0,
            errors
        }
    }

    static setParams(form) {
        return {
            branchId: form.branchId || null,
            customerId: form.customer.id || null,
            salesOfficerId: form.salesofficerId || null,
            customerPlateId: form.plateId || null,
            customerDriverId: form.driverId || null,
            customerDriverTaxNumber: form.driverTaxNumber || 0,
            description: form.description || null,
            sms: form.sms || '0',
            totalPrice: form.totalPrice || '0',
            createDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
    }

    static paymentValidate(form) {
        const errors = {}

        if (isNaN(form.customerId)) {
            errors.customerId = 'Kritik hata, müşteri bulunamadı.' + form.customerId
        }

        if (isNaN(form.branchId)) {
            errors.branchId = 'Kritik hata, şube bilgisi bulunamadı.'
        }

        if(isNaN(form.amount) || form.amount<=0){
            errors.amount = 'Tahsilat tutarı sıfırdan büyük bir sayı olmalıdır.'
        }

        if(isNaN(form.paymentType) || form.paymentType == 0){
            errors.paymentType = 'Tahsilat türünü seçiniz. Örn. Nakit, Çek..'
        }

        return {
            status: Object.keys(errors).length === 0,
            errors
        }
    }

    static setPaymentParams(form) {
        return {
            branchId: form.branchId || null,
            customerId: form.customer.id || null,
            salesOfficerId: form.salesofficerId || null,
            customerPlateId: form.plateId || null,
            customerDriverId: form.driverId || null,
            customerDriverTaxNumber: form.driverTaxNumber || 0,
            description: form.description || null,
            sms: form.sms || '0',
            amount: form.amount || '0',
            paymentType: form.paymentType || 0,
            createDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
    }
}
