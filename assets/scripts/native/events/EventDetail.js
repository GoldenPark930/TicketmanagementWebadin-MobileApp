import _ from 'lodash'
import React from 'react'
import {Text} from 'react-native'
import {connect} from 'react-redux'
import PropTypes from 'prop-types';

import session_event from '../../_common/redux/events/actions'
import session_brand from '../../_common/redux/brands/actions'
import session_fetch from '../../_common/redux/auth/actions'
import EventForm from './EventForm'
import {LoadingBar, Dialog, Button} from '../_library'
import BrandForm from '../brands/BrandForm'
import {
    View,
    ScrollView,
} from 'react-native'
import modalStyle from "../../_common/core/modalStyle";
import styles from "../styles/common";
import {CREATE_BRAND} from "../../_common/redux/brands/actions";
import {commonStyle} from "../styles";

class EventDetails extends React.Component {
    static propTypes = {
        event: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props)
        this.state = {
            renderShow:false,
            showNewBrand: false,
            hasEdittedFields: false,
            nextLocation: null,
        }
    }
    componentDidMount() {
        const {event} = this.props
        setTimeout(
            () => this.setState({renderShow: true}),
            500
        )
    }
    componentWillUnmount(){
        this.setState({renderShow:false})
        // native_form_helper_reset()
    }
    onClickOk(){
      native_form_helper_reset()
      const{nextLocation} = this.state
      const{push} = this.props
      push(nextLocation)
    }
    receiveExposedMethod(exposedMethod) {
        this.exposedMethod = exposedMethod
    }
    exposedMethod(){}
    async handleSubmit(form) {
        // get serialized description from medium-editor-insert-plugin
        const description =await this.exposedMethod()
        form.attributes.description = description

        const {event, UPDATE_EVENT} = this.props
        return Promise.resolve(UPDATE_EVENT(event.id, form))
            .catch(err => Promise.reject(_.result(err, 'toFieldErrors', err)))
    }
    onClickNewBrand = () => {
        this.setState({showNewBrand: true})
    }
    onClickCancel = () => {
        this.setState({hasEdittedFields: false})
    }
    handleBrandSubmit = (form) => {
        const {CREATE_BRAND, FETCH_SESSION} = this.props
        return Promise.resolve(CREATE_BRAND({...form}))
          .catch(err => {
            return Promise.reject(_.result(err, 'toFieldErrors', err))
          })
          .then(() => {
            FETCH_SESSION()
            this.createdBrand = form.attributes.displayName
            this.setState({showNewBrand: false})
          })
    }

    routerWillLeave(nextLocation){
      if(naive_form_helper_isEditted()){
        this.setState({
          hasEdittedFields: true,
          nextLocation: nextLocation.pathname
        })
        return false
      }
    }

    onCancelNewBrand = () => {
      this.setState({showNewBrand: false})
    }

    render() {
        const {user, event} = this.props
        const brands = _.get(user, '$relationships.organizations', [])
        const event_Loading = <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />
        const event_Detail =
          <EventForm
            formKey={event.id}
            initialValues={event.$original}
            submitLabel='Save'
            getExposedMethod={this.receiveExposedMethod.bind(this)}
            onSubmit={(form)=>this.handleSubmit(form)}
            user={user}
            onClickNewBrand={this.onClickNewBrand}
            organizations={brands} />
      let selectedBrand = null
      if(this.createdBrand){
        let found = _.find(brands, {displayName: this.createdBrand})
        if(!!found){
          this.createdBrand = null
          selectedBrand = found.id
        }
      }

      const {hasEdittedFields, showNewBrand} = this.state
      let contentEdittedFields = null
      if(hasEdittedFields){
        contentEdittedFields = _.map(form_helper_get(), (field, index)=>{
          let field_title = ''
          switch(field){
            case 'relationships.owner.data':
              field_title = 'Brand'
              break
            case 'attributes.description':
              field_title = 'Event Description'
              break
            case 'attributes.displayName':
              field_title = 'Event Name'
              break
            case 'attributes.shortName':
              field_title = 'Short Event Name'
              break
            case 'attributes.slug':
              field_title = 'Event URL'
              break
            case 'attributes.backgroundURL':
              field_title = 'Event Background Image'
              break
            case 'attributes.startDate':
              field_title = 'Start Date'
              break
            case 'attributes.endDate':
              field_title = 'End Date'
              break
            case 'attributes.checkInStart':
              field_title = 'Doors open time'
              break
            case 'attributes.checkInEnd':
              field_title = 'Last entry time'
              break
            case 'attributes.flagCarer':
              field_title = 'Free carer ticket for disabled guests'
              break
            case 'attributes.flagInvitationsOnly':
              field_title = 'Invitation required to attend'
              break
            case 'attributes.flagRefunds':
              field_title = 'Refunds allowed'
              break
            case 'attributes.facebookEvent':
              field_title = 'Social Media Facebook'
              break
            case 'attributes.twitterHashtag':
              field_title = 'Social Media Twitter'
              break
            case 'attributes.venue':
              field_title = 'Event Venue'
              break
            case 'attributes.eventType':
              field_title = 'Event Type'
              break
            case 'attributes.tags':
              field_title = 'Tags'
              break
            default:
              field_title = field
              break
          }
          return (
            <View key={index}><Icon name="info-circle" size={20} color="#FFF" /><Text>{field_title}</Text></View>
          )
        })
      }
        return (
            <View>
                <Dialog
                  title="Confirm Switch"
                  isOpen={this.state.hasEdittedFields}
                  onRequestClose={this.onClickCancel}
                  footer={
                    <View style={{flexDirection:'row'}}>
                      <Button title='OK' style={commonStyle.buttonDanger} size='small'
                              onPress={()=>this.onClickOk()} />
                      <Button title='Cancel' style={commonStyle.buttonSecondary} size='small'
                              onPress={this.onClickCancel} />
                    </View>
                }>
                  <View>
                      <Text>Are you sure you want to switch to a new section without saving your changes?</Text>
                      <Text>You’ve made changes to the following settings:</Text>
                      {contentEdittedFields}
                  </View>
                </Dialog>
                <Dialog
                  title="Create Brand"
                  isOpen={!!this.state.showNewBrand}
                  onClose={this.onCancelNewBrand}
                  >
                      <ScrollView style={{height:500}}>
                          <BrandForm onSubmit={this.handleBrandSubmit} onCancel={this.onCancelNewBrand} submitLabel="Create Brand" initialValues={null}/>
                      </ScrollView>
                </Dialog>
                {this.state.renderShow ? event_Detail : event_Loading}
            </View>
        )
    }
}export default connect(
    (state) => {
        const loading = state.loading.has('FETCH_SESSION')
        const u = state.auth.get('user')
        return {
            user: u ? u.toJS() : null,
            event: state.events.get('selected').toJS()
        }
    },
    {UPDATE_EVENT:session_event.UPDATE_EVENT, CREATE_BRAND: session_brand.CREATE_BRAND, FETCH_SESSION: session_fetch.FETCH_SESSION}
)(EventDetails)
