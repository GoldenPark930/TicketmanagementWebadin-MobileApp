import React, {
    Component
} from 'react'
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ListView,
    Picker,
    TextInput,
    Switch
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import session_event from '../../_common/redux/events/actions'
import {newevent, newbrand} from '../../native/styles'
import {Select, Option} from '../_library'
import PropTypes from 'prop-types';
import _ from 'lodash'
import {routeActions} from 'react-router-redux'
import {connect} from 'react-redux'
import {Notifications} from '../_library'
import EventForm from './EventForm'

class NewEventPage extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    receiveExposedMethod(exposedMethod) {
        this.exposedMethod = exposedMethod
    }
    exposedMethod(){}
    async handleSubmit(form) {
        const description =await this.exposedMethod()
        const {push, CREATE_EVENT} = this.props
        form.attributes.description = description
        // fix default anti-scalping settings error
        form.attributes.flagNameChecks = (form.attributes.flagNameChecks == null) ? true : form.attributes.flagNameChecks
        form.attributes.flagIDRequired = (form.attributes.flagIDRequired == null) ? true : form.attributes.flagIDRequired
        form.attributes.flagResaleEnabled = (form.attributes.flagResaleEnabled == null) ? true : form.attributes.flagResaleEnabled
        form.attributes.flagCollectNames = (form.attributes.flagCollectNames == null) ? true : form.attributes.flagCollectNames

        return Promise.resolve(CREATE_EVENT(form))
        .catch(err => {
            return Promise.reject(_.result(err, 'toFieldErrors', err))
        })
        .then(res => {
            const id = _.get(res, 'data.id')
            const next = id ? `/event/${id}/venues` : '/events'
            push(next)
            return res
        })
    };

    render() {
        const {user} = this.props
        const brands = _.get(user, '$relationships.organizations', [])
        const initialValues = {}
        return (
            <KeyboardAwareScrollView
                innerRef = {(scrollView) => {_scrollView = scrollView }}
                style = {{padding:25, backgroundColor:'#373E4C'}}>
                <Notifications />
                <EventForm
                    onSubmit={(form)=>this.handleSubmit(form)}
                    initialValues={initialValues}
                    user={user}
                    organizations={brands}
                    getExposedMethod={this.receiveExposedMethod.bind(this)}
                    isNew={true}/>
            </KeyboardAwareScrollView>
        )
    }

}

export default connect(
    (state) => {
        const u = state.auth.get('user')
        return {
            user: u ? u.toJS() : null
        }
    },
    {CREATE_EVENT:session_event.CREATE_EVENT, push: routeActions.push}
)(NewEventPage)
