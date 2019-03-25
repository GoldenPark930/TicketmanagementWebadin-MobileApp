import _ from 'lodash'
import {View, Text, ScrollView} from 'react-native'
import React from 'react'
import {connect} from 'react-redux'
import {commonStyle} from '../styles'
import session from '../../_common/redux/auth/actions'
// import AccountSettingsForm from './AccountSettingsForm'

class AccountSettingsPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {

  }

  handleSubmit(form) {
    if(!form.attributes.password || form.attributes.password=='') {
      delete form.attributes.password
      delete form.attributes.confirmPassword
    }
    delete form.attributes.confirmEmail

    const {UPDATE} = this.props
    return UPDATE(form)
      .catch((err) => {
        return Promise.reject(_.result(err, 'toFieldErrors', err))
      })
      .then((v) => {
        return v
      })
  }

  render() {
    const {user} = this.props

    return (
      <ScrollView>
        <View style={{paddingHorizontal:20}}>
          <View style={commonStyle.heading_style}><Text style={commonStyle.heading_text}>Account Settings</Text></View>
          {/*<AccountSettingsForm user={user} onSubmit={(form)=>this.handleSubmit(form)} />*/}
        </View>
      </ScrollView>
    )
  }
}export default connect(
  (state) => {
    const u = state.auth.get('user')
      console.warn(u)
    return {
      user: u ? u.toJS() : null
    }
  },
  {UPDATE:session.UPDATE}
)(AccountSettingsPage)
