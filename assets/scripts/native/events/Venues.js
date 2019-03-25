import React, { PropTypes, Component } from 'react'
import {
    StyleSheet,
    Navigator,
    View,
    Image,
    Platform,
    BackAndroid,
    TouchableOpacity,
    ScrollView,
    Text,
    TouchableWithoutFeedback
} from 'react-native'
import MapView  from 'react-native-maps'
import {Field, LoadingBar, Button, Panel, Map} from '../_library'
import {connect} from 'react-redux'
import {commonStyle,venues} from '../../native/styles'
import session from '../../_common/redux/events/actions'
import Venue from './Venue'
import VenueEditor from './VenueEditor'


class Venues extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }
    componentDidMount() {
        const {event} = this.props
        setTimeout(
            () => this.setState({renderShow: true}),
            500
        )
    }
    handleHighlight(venue) {
        const {highlighted} = this.state
        const {id} = venue
        this.setState({highlighted: highlighted === id ? null : id})
    }
    handleEdit(venue) {
        this.setState({editing: true, selected: venue})
    }
    handleSubmit(form) {
        const {event, UPDATE_EVENT} = this.props
        Promise.resolve(UPDATE_EVENT(event.id, {attributes: {venue: form}}))
            .then((res) => {
                this.setState({editing: false})
                return res
            })
    }
    handleDeleteVenue(venue) {
        const {event, UPDATE_EVENT} = this.props
        const {id} = venue
        const unsetRemoving = () => this.setState({removing: null})
        if (this.state.removing) {
            Promise.resolve(UPDATE_EVENT(event.id, {venue: null}))
                .then(unsetRemoving, unsetRemoving)
        } else {
            this.setState({removing: true})
        }
    }
    render() {
        const {editing, highlighted, selected, removing} = this.state
        const {event} = this.props
        const {venue} = event

        const editorOpen = editing || !venue
        const loading = <LoadingBar title={'Hold tight! We\'re getting your event\'s statistics...'} />
        const render = <View>
          {!!venue && !editorOpen &&
            <View>
              <Venue {...venue}>
                <TouchableWithoutFeedback onPress={()=>this.setState({removing:false})}>
                  <View style={{flexDirection:'row', justifyContent:'center'}}>
                    <Button
                      icon='pencil-square-o'
                      style={{backgroundColor:'#508ef5', padding:10, marginRight:10}}
                      title={'Edit Venue'}
                      onPress={() => this.handleEdit(venue)} />
                    <Button
                      style={{backgroundColor:removing ?'#d45350':'#638a94', padding:10, marginRight:10}} type='button'
                      title={removing ?'Are you sure?':'Remove'}
                      icon={removing ? 'exclamation' : 'trash-o'}
                      onPress={() => this.handleDeleteVenue(venue)} />
                  </View>
                </TouchableWithoutFeedback>
              </Venue>
              <Panel title='Venue Location' style={{marginBottom:30}}>
                <View style={{flex:1, height:600}}>
                  <Map innerref={(map) => {this.map = map}} locations={venue}/>
                </View>
              </Panel>
            </View>
          }
          {editorOpen &&
            <View>
              <VenueEditor event={event} venue={venue} initialValues={selected} onSubmit={(form)=>this.handleSubmit(form)} onCancel={venue ? (e => this.setState({editing: false, selected: null})) : null} />
            </View>
          }
        </View>
        return(
            <View>
                {this.state.renderShow ? render : loading}
            </View>
        )
    }
    renderEventVenues(){
        return(
          <View>
            {!!venue && !editorOpen &&
              <View>
                {event_description}
                <Venue {...venue}>
                  <TouchableWithoutFeedback onPress={()=>this.setState({removing:false})}>
                    <View style={{flexDirection:'row', justifyContent:'center'}}>
                      <Button
                        icon='pencil-square-o'
                        style={{backgroundColor:'#508ef5', padding:10, marginRight:10}}
                        type='button' title={'Edit Venue'}
                        onPress={() => this.handleEdit(venue)}>
                      </Button>
                      <Button
                        style={{backgroundColor:removing ?'#d45350':'#638a94', padding:10, marginRight:10}} type='button'
                        title={removing ?'Are you sure?':'Remove'}
                        icon={removing ? 'exclamation' : 'trash-o'}
                        onPress={() => this.handleDeleteVenue(venue)}>
                      </Button>
                    </View>
                  </TouchableWithoutFeedback>
                </Venue>
                <Panel title='Venue Location' style={{marginBottom:30}}>
                  <View style={{flex:1, height:500,}}>
                    <MapView
                      style={{position:'absolute', left:0, right:0, top:0, right:0, bottom:0}}
                      initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      }}
                    />
                  </View>
                </Panel>
              </View>
            }
            {editorOpen &&
            <View>
              <VenueEditor event={event} venue={venue} initialValues={selected} onSubmit={(form)=>this.handleSubmit(form)} onCancel={venue ? (e => this.setState({editing: false, selected: null})) : null} />
            </View>
            }
          </View>
        )
    }
}export default connect(
    (state) => ({event: state.events.get('selected').toJS()}),
    {UPDATE_EVENT:session.UPDATE_EVENT}
)(Venues)
