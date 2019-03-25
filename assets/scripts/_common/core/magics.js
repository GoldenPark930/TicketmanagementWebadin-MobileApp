const base = (process.env.ADMIN_ASSET_URL || '').replace(/\/$/, '')

global.asset = function asset(pathname) {
  return base + pathname
}

global.isDemoAccount = function isDemoAccount(){
  return localStorage.getItem('demoAccount') == 'true'
}

const SIDEBAR_THRESHOLD = 768
global.isMobileDevice = function () {
  return $(window).width() <= SIDEBAR_THRESHOLD
}

let country_code = 'US'
$.getJSON('http://freegeoip.net/json/', function (data) {
  country_code = data.country_code
})

global.getLocalCurrency = function getCurrency() {
  let currency = {
    currency: 'USD',
    symbol: 'US$',
  }
  switch(country_code) {
    case 'AU':
      currency = {
        currency: 'AUD',
        symbol: 'AU$',
      }
      break
    case 'EU':
      currency = {
        currency: 'EUR',
        symbol: '€',
      }
      break
    case 'NZ':
      currency = {
        currency: 'NZD',
        symbol: 'NZ$',
      }
      break
    case 'GB':
      currency = {
        currency: 'GBP',
        symbol: '£',
      }
      break
    case 'IN':
      currency = {
        currency: 'INR',
        symbol: '₹',
      }
      break
    case 'KE':
      currency = {
        currency: 'KES',
        symbol: 'KSh',
      }
      break
    case 'CA':
      currency = {
        currency: 'CAD',
        symbol: 'CA$',
      }
      break
    case 'ID':
      currency = {
        currency: 'IDR',
        symbol: 'Rp',
      }
      break
    case 'IS':
      currency = {
        currency: 'ISK',
        symbol: 'kr',
      }
      break
    default:
      break
  }
  return currency
}

global.getCurrencySymbol = function getCurrencySymbol(event) {
  if(isDemoAccount()) {
    return getLocalCurrency().symbol
  }
  return (event && event.currency && event.currency.symbol) ? event.currency.symbol : 'US$'
}