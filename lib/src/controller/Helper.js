import _ from 'lodash'

export default class Helper {
  static priceToString (price) {
    const priceTotal = _.split(price.toString(), '.')
    if (priceTotal[0] > 999999) {
      priceTotal[0] = priceTotal[0].substr(0, 6)
    }
    let str = ''
    const items = [
      ['', ''],
      ['Bir', 'On'],
      ['İki', 'Yirmi'],
      ['Üç', 'Otuz'],
      ['Dört', 'Kırk'],
      ['Beş', 'Elli'],
      ['Altı', 'Altmış'],
      ['Yedi', 'Yetmiş'],
      ['Sekiz', 'Seksen'],
      ['Dokuz', 'Doksan']
    ]
    for (let decimalPointer = 0; decimalPointer < priceTotal.length; decimalPointer++) {
      for (let pointer = 1; pointer <= priceTotal[decimalPointer].toString().length; pointer++) {
        const pointerd = 1 + (priceTotal[decimalPointer].length - pointer)
        try {
          switch (pointerd) {
            case 6:
              if (items[priceTotal[decimalPointer].charAt(pointer - 1)][0] !== 'Bir') {
                str = str + '' + items[priceTotal[decimalPointer].charAt(pointer - 1)][0] + 'Yüz'
              } else {
                str = str + '' + ' Yüz'
              }
              break
            case 5:
              str = str + '' + items[priceTotal[decimalPointer].charAt(pointer - 1)][1]
              break
            case 4:
              if (items[priceTotal[decimalPointer].charAt(pointer - 1)][0] !== 'Bir') {
                str = str + '' + items[priceTotal[decimalPointer].charAt(pointer - 1)][0] + 'Bin'
              } else {
                str = str + 'Bin'
              }
              break
            case 3:
              if (items[priceTotal[decimalPointer].charAt(pointer - 1)][0] === '') {
                str = str + ''
              } else if (items[priceTotal[decimalPointer].charAt(pointer - 1)][0] !== 'Bir') {
                str = str + '' + items[priceTotal[decimalPointer].charAt(pointer - 1)][0] + ' Yüz'
              } else {
                str = str + 'Yüz'
              }
              break
            case 2:
              str = str + '' + items[priceTotal[decimalPointer].charAt(pointer - 1)][1]
              break
            default:
              str = str + '' + items[priceTotal[decimalPointer].charAt(pointer - 1)][0]
              break
          }
        } catch (err) {
          console.error(err.description)
          console.error('decimalPointer' + decimalPointer)
          break
        }
      }
      if (_.lt(decimalPointer, 1)) {
        str = str + 'Lira'
      } else {
        if (priceTotal[1] !== '00') str = str + 'Kuruş'
      }
    }
    return str
  }
}
