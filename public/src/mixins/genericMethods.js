const genericMethods = {
    methods: {
        invalidIcon(property, defaultIcon) {
            return !property ? defaultIcon : "ri-error-warning-line text-danger"
        },
        invalidField(property) {
            return !property ? null : "is-invalid"
        },
        multiselectSearcher({name}) {
            return `${name}`;
        },
        makeTitle(text) {
            let wordsArray = text.toLowerCase().split(' ')
            let capsArray = wordsArray.map(word => {
                return word.length > 0 && word.replace(word[0], word[0].toUpperCase()) || ""
            })
            return capsArray.join(' ')
        }
    }
}

export default genericMethods
