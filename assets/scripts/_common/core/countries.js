import _ from 'lodash'
import countries from 'world-countries'

export default _.filter(
  countries,
  c => {
    return _.some(['AUD', 'EUR', 'USD', 'NZD', 'GBP', 'INR', 'KES', 'CAD', 'IDR', 'ISK'], cur => _.includes(c.currency, cur))
  })

