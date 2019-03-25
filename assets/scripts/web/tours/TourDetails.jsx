import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'

import {UPDATE_TOUR} from '../../_common/redux/tours/actions'
import TourForm from './TourForm'

@connect(
  (state) => {
    const u = state.auth.get('user')
    return {
      user: u ? u.toJS() : null,
      tour: state.tours.get('selected').toJS()
    }
  },
  {UPDATE_TOUR}
)
export default class TourDetails extends React.Component {
  static propTypes = {
    event: React.PropTypes.object.isRequired
  }

  componentDidMount() {
    Messenger.options = {
      extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
      theme: 'future'
    }
    const {tour} = this.props
    document.title = `Details - ${tour.displayName} - The Ticket Fairy Dashboard`
  }

  receiveExposedMethod(exposedMethod) {
    this.exposedMethod = exposedMethod
  }

  exposedMethod(){

  }

  handleSubmit(form) {
    // get serialized description from medium-editor-insert-plugin
    const description = this.exposedMethod()
    form.attributes.description = description
    const {tour, UPDATE_TOUR} = this.props

    return Promise.resolve(UPDATE_TOUR(tour.id, form))
      .catch((err) => {
        console.log(err)
        Messenger().post({
          type: 'error',
          message: err,
          hideAfter: 3,
          showCloseButton: true
        })
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v)=>{
        Messenger().post({
          type: 'success',
          message: 'Saved',
          hideAfter: 3,
          showCloseButton: true
        })
        return v
      })
  }

  render() {
    const {user, tour} = this.props
    return (
      <div>
        <TourForm
          formKey={tour.id}
          initialValues={tour.$original}
          submitLabel="Save"
          getExposedMethod={this.receiveExposedMethod.bind(this)}
          onSubmit={::this.handleSubmit}
          user={user}
        />
      </div>
    )
  }
}
