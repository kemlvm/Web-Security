const moment = require('moment')
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const smp = new SpeedMeasurePlugin();

module.exports = {
    generateDate: (date, format) => {
        return moment(date).format(format)
    },
    limit: (arr, limit) => {
        if (!Array.isArray(arr)) { return [] }
        return arr.slice(0, limit)
    },
    truncate: (str, len) => {
        if (str.length > len) str = str.substring(0, len) + '...'
        return str
    }

}