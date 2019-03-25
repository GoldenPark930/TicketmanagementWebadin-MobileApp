import _ from 'lodash'
import React, {
    Component
} from 'react'
import {connect} from 'react-redux'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ListView,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Modal
} from 'react-native'
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome'
import eventsession from '../../_common/redux/events/actions'
import eventpublish from '../../_common/redux/publishing/actions'
import EventsTable from './EventsTable'
import {LoadingBar, EmptyBar} from '../_library'
import {events} from '../../native/styles'
const eventStyle = events
import {Link} from 'react-router-native'
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

var info = {color:'#a94442', fontFamily: 'OpenSans', fontSize:14}
var warning = {color:'#8a6d3b', fontFamily: 'OpenSans', fontSize:14}

const levelMap = {
    undefined: info,
    info: info,
    warning: warning,
    error: info
}

class PublishStatusDialog extends Component {
    render() {
        const {event, status, onCancel, onPublish} = this.props
        const id = _.get(status, 'id')
        const notices = _.get(status, 'notices', [])
        const messages = _.map(notices, (n, i) => <Text key={i} style={levelMap[n.level]}>{n.message}</Text>)
        const noErrors = !_.some(notices, {level: 'error'})
        return (
            <View>
                <View style={{padding:15, paddingTop:20}}>
                    <Text style={{color:'#89949B', fontFamily: 'OpenSans-Bold', fontSize:14}}>Oops...</Text>
                </View>
                <View style={{padding: 15, alignItems: 'center'}}>
                    <Text style={{fontFamily: 'OpenSans-Bold',fontSize:14, color:'#ffffff',marginBottom:12}}>There were issues while attempting to publish the event:</Text>
                    <View style={{alignSelf:'flex-start'}}>
                        {messages}
                    </View>
                </View>
                <View style={{borderTopWidth:1, borderColor:'#535969'}}>
                    {noErrors && notices.length && <Text style={{fontSize: 14, fontFamily:'OpenSans-Bold'}}> While not recommended, you may ignore the warnings and publish the event.</Text>}
                    <View style={{padding:25, flexDirection:'row'}}>
                        <View style={{flex:1}}/>
                        {noErrors && onPublish &&
                        <TouchableOpacity style={{paddingTop: 3, paddingRight: 15, paddingBottom: 3, paddingLeft: 15,
                            borderRadius:3, backgroundColor: '#508ef5'}} onPress={() => onPublish(event)}>
                            <Text style={{color:'#ffffff', fontSize:14,fontFamily: 'OpenSans-Bold',}}>Publish</Text>
                        </TouchableOpacity>}
                        {id && <Link style={{padding:10,
                            elevation:10,
                            shadowOpacity: 0.25,
                            shadowRadius: 5,
                            shadowOffset: {
                                height: 7,
                                width: 7
                            },
                            borderRadius:3,
                            backgroundColor:'#508ef5'
                        }} to={`/event/${id}/details`}>
                            <Text style={{color:'#fff', fontSize:14}}>Edit Event</Text>
                        </Link>}
                        {onCancel &&
                        <TouchableOpacity
                            style={{
                                padding:10,
                                borderRadius:3,
                                backgroundColor:'#D45350',
                                shadowOpacity: 0.25,
                                shadowRadius: 5,
                                shadowOffset: {
                                    height: 7,
                                    width: 7
                                },
                                marginLeft:5,
                            }} onPress={onCancel}>
                            <Text style={{color: '#ffffff', fontSize: 14, fontFamily: 'OpenSans-Bold',}}>Cancel</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </View>
        )
    }
}

class EventsPage extends Component {

    static propTypes = {
        onOpenDrawer: PropTypes.func
    };

    state = {
        option: 0,
        dataSource:[1],
        modalVisible:false
    };
    componentDidMount() {
        this.props.FETCH_EVENTS()
    }
    componentDidUpdate(prevProps) {
        const pid = prevProps.uid
        const nid = this.props.uid
        if (pid !== nid && nid) { this.props.FETCH_EVENTS() }
    }
    handlePublishEvent(event, force) {
        const {UPDATE_EVENT, FETCH_PUBLISH_STATUS} = this.props
        const unset = () => this.setState({publishEvent: null, publishStatus: null})
        const {id} = event
        let p = _.get(this.props.publishing, id)

        if (!p) { p = FETCH_PUBLISH_STATUS(id) }
        Promise.resolve(p)
        .then(() => {
            const status = _.get(this.props.publishing, id)
            if (status && status.notices.length && !force) {
                this.setState({publishEvent: event, publishStatus: status,modalVisible:true})
                return
            }
            return UPDATE_EVENT(id, {attributes: {status: 'published'}})
        })
    }
    handleCancelPublishEvent() {
        this.setState({modalVisible:false,publishEvent: null, publishStatus: null})
    }
    handleUnpublishEvent(event) {
        const {UPDATE_EVENT} = this.props
        return UPDATE_EVENT(event.id, {attributes: {status: 'unpublished'}})
    }
    render() {
        const {publishEvent, publishStatus} = this.state
        const {loading} = this.props
        const events = this.props.events || []
        let content
        if (loading) {
            content = <LoadingBar title={'Loading'}/>
        }else if (events.length) {
            content = <EventsTable events={events} onPublish={(event)=>this.handlePublishEvent(event)} onUnpublish={(event)=>this.handleUnpublishEvent(event)}/>
        }else {
            content = <EmptyBar content={'There are no events to show.'}/>
        }
        return (
            <ScrollView style={eventStyle.container}>
                <View style={[eventStyle.event_topView]}>
                    <View style={eventStyle.title}>
                        <Text style={eventStyle.titleStyle}>Events</Text>
                    </View>
                    <Link to='/events/new'>
                      <View style={eventStyle.rightButton}>
                        <Icon name="plus" style={eventStyle.rightButtonText} />
                        <Text style={eventStyle.rightButtonText}> Create Event</Text>
                      </View>
                    </Link>
                </View>
                <Modal
                    animationType={'slide'}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {alert('Modal has been closed.')}}
                >
                    <TouchableWithoutFeedback onPress={()=>this.setState({modalVisible:false})}>
                        <View style={{alignItems:'center', flex:1,}}>
                            <TouchableWithoutFeedback onPress={()=>this.setState({modalVisible:true})}>
                                <View
                                    style = {{margin:30,width:800, height: 250, backgroundColor:'#2C313E', borderRadius:5,
                                        shadowOpacity: 0.25,
                                        shadowRadius: 5,
                                        shadowOffset: {
                                            height: 7,
                                            width: 7
                                        },
                                    }}>
                                    <PublishStatusDialog
                                        event={publishEvent}
                                        status={publishStatus}
                                        onCancel={()=>this.setState({modalVisible:false})}
                                        onPublish={event => this.handlePublishEvent(event, true)} />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                {content}
            </ScrollView>
        )
    }
}

export default connect((store) => ({
        loading: store.loading.has('FETCH_EVENTS'),
        error: store.events.get('errors').has('FETCH_EVENTS'),
        events: store.events.get('events').toList().toJS(),
        publishing: store.publishing.get('events').toJS(),
        uid: store.auth.getIn(['user', 'id'])
    }),
    {FETCH_EVENTS:eventsession.FETCH_EVENTS, UPDATE_EVENT:eventsession.UPDATE_EVENT, FETCH_PUBLISH_STATUS:eventpublish.FETCH_PUBLISH_STATUS}
    )(EventsPage)
