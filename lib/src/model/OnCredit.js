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

    create(form) {
        this.db('customerDriver')
            .update({
                taxNumber: form.customerDriverTaxNumber
            })
            .where('id', form.customerDriverId)
        delete form.customerDriverTaxNumber
        return this.db('oncredit').insert(form)
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
}
