import _ from 'lodash'
import {connect} from 'react-redux'
import React from 'react'
import {Link} from 'react-router'

import Button from '../_library/Button'
import Card from '../_library/Card'
import Notifications from '../_library/notifications/Notifications'
import {UPDATE_BRAND_PAYMENT,FETCH_BRAND} from '../../_common/redux/brands/actions'
import PaymentMethodForm from './PaymentMethodForm'

function PaymentMethodsTable(props) {
  if (!_.size(props.methods)) {
    return (
      <Card title={' '}>
        <div className="text-center h3">
          There are no payment methods associated with this brand
        </div>
      </Card>
    )
  }
  return (
    <Card title={' '}>
      <div className="table-responsive">
        <table className="table table-borderless table-themed">
          <thead>
            <tr>
              <th>Name</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {_.map(props.methods, m => <tr key={m.id}><td>{m.displayName}</td><td>{m.type}</td></tr>)}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

@connect(
  (state) => ({
    brands: state.brands.get('collection').toJS(),
    loading: state.loading.has('FETCH_BRAND')
  }),
  {UPDATE_BRAND_PAYMENT,FETCH_BRAND}
)
export default class BrandPayments extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentWillMount() {
    const {brands, FETCH_BRAND, params: {id}} = this.props
    const brand = brands[id]
    document.title = `Payments - ${brand.displayName} - The Ticket Fairy Dashboard`
    if (!brand) { FETCH_BRAND(id) }
  }

  handleSubmitPaymentMethod(form) {
    const {brands, FETCH_BRAND, params: {id}} = this.props
    const {UPDATE_BRAND_PAYMENT, push} = this.props
    return Promise.resolve(UPDATE_BRAND_PAYMENT(id, {...form}))
      .catch(err => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
  }
  handleAddPaymentMethod() {
    this.setState({addingPaymentMethod: true})
  }
  handleCancelAddPaymentMethod() {
    this.setState({addingPaymentMethod: false})
  }
  render() {
    const {addingPaymentMethod} = this.state
    const {loading, brands, params: {id}} = this.props
    const brand = _.get(brands, id)

    return (
      <div className="hold-transition skin-ttf sidebar-collapse">
        <div className="wrapper">
          <div className="content-wrapper">
            {loading && <div className="container-fluid">
              <div className="row">
                <div className="col-xs-12">
                  <div className="text-center h1"><i className="fa fa-spin fa-circle-o-notch" /></div>
                </div>
              </div>
            </div>}
            {brand && <div className="container-fluid">
              <div className="row">
                <div className="col-xs-12">
                  <h2>Payment Methods</h2>
                  <PaymentMethodsTable methods={brand.paymentMethods || []} />
                  {addingPaymentMethod && <PaymentMethodForm
                    onSubmit={::this.handleSubmitPaymentMethod}
                    onCancel={::this.handleCancelAddPaymentMethod} />}
                  {!addingPaymentMethod && <Button
                    type="button"
                    className="btn btn-primary"
                    onClick={::this.handleAddPaymentMethod}>Add Payment Method
                  </Button>}
                </div>
              </div>
            </div>}
          </div>
        </div>
      </div>
    )
  }
}