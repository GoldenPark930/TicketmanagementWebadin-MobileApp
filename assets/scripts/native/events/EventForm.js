import React, {
    Component
} from 'react'
import {
    Text,
    View,
    Image,
} from 'react-native'
import PropTypes from 'prop-types';
import {commonStyle, newevent, newbrand} from '../../native/styles'
import {reduxForm} from '../router/redux-form'
import moment from 'moment-timezone'
import {
    MKTextField
} from 'react-native-material-kit'
import {routeActions} from 'react-router-redux'

import url from 'url'
import _ from 'lodash'
import {AutoSlugField, DateTimePickera, RichTextArea, FileUploader, Field, Switch, Button, Panel, Select, TagsField, Dialog} from '../_library'
import DeviceInfo from 'react-native-device-info'

const Name = MKTextField.textfieldWithFloatingLabel()
    .withFloatingLabelFont({fontSize: 15, fontFamily:'OpenSans-Bold', color:'#B6C5CF',})
    .withTextInputStyle(newbrand.formControl)
    .build()
const slugRE = /^[\w-]*$/
const shortNameRE = /[<>'\"]+/
const dateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ'

const range30 = _.map(new Array(30), (e, i) => {
    return {value: 30-i, label: 30-i}
})

function arrayToObject(arr){
    let rv = {}
    if(!arr)
        return rv
    if( Object.prototype.toString.call( arr ) === '[object Array]' ) {
        for (let i = 0; i < arr.length; ++i)
            rv[i] = arr[i]
    }else{
        for (let attr in arr) {
            rv[attr] = arr[attr]
        }
    }
    return rv
}
function isDateRangeInvalid(start, end) {
    const sm = moment.utc(start)//moment(start, dateFormat, true)
    const em = moment.utc(end)//moment(end, dateFormat, true)
    if (!sm.isValid()) { return }
    if (!em.isValid()) { return }
    return em.isSame(sm) || em.isBefore(sm)
}
function isDateRangeInvalid2(start, end) {
    if(!start)
        return false
    const sm = moment.utc(start)//moment(start, dateFormat, true)
    const em = moment.utc(end)//moment(end, dateFormat, true)
    if (!sm.isValid()) { return }
    if (!em.isValid()) { return }
    return em.isSame(sm) || em.isBefore(sm)
}

function validateEvent(data) {
    const required = [
        'attributes.displayName',
        'attributes.shortName',
        'attributes.slug',
        'attributes.salesEndDate',
        'relationships.owner.data',
    ]
    const errors = {}

    if (!_.get(data, 'attributes.displayName')){
        _.set(errors, 'attributes.displayName', 'Required')
    }

    if (!_.get(data, 'attributes.shortName')){
        _.set(errors, 'attributes.shortName', 'Required')
    }

    if (!_.get(data, 'attributes.slug')){
        _.set(errors, 'attributes.slug', 'Required')
    }

    if (!_.get(data, 'attributes.salesEndDate')){
        _.set(errors, 'attributes.salesEndDate', 'Required')
    }

    if (!_.get(data, 'relationships.owner.data')){
        _.set(errors, 'relationships.owner.data', 'Required')
    }

    if (_.get(data, 'attributes.displayName', '').length > 65) {
        _.set(errors, 'attributes.displayName', 'Event name cannot exceed 65 characters')
    }

    if (_.get(data, 'attributes.eventType')){
        let eventType = _.get(data, 'attributes.eventType')
        eventType = arrayToObject(eventType)
        let strEventType = JSON.stringify(eventType)
        if(strEventType.indexOf('true') === -1){
            _.set(errors, 'attributes.eventType', 'Please select at least one event type.')
        }
    }else{
        _.set(errors, 'attributes.eventType', 'Please select at least one event type')
    }

    if (_.get(data, 'attributes.shortName')){
        let shortName = _.get(data, 'attributes.shortName', '')
        if(shortName && shortName.length > 17){
            _.set(errors, 'attributes.shortName', 'Short Event Name cannot exceed 17 characters')
        }else{
            if(shortNameRE.test(shortName))
                _.set(errors, 'attributes.shortName', 'Short Event Name are not allowed to use the symbols (>, <, \', ")')
        }
    }

    if (_.get(data, 'attributes.facebookEvent')){
        let fbURL = _.get(data, 'attributes.facebookEvent', '')
        if(!(/^(https?:\/\/)?((w{3}\.)?)facebook.com\/events\/[0-9]+/i.test(fbURL)))
            _.set(errors, 'attributes.facebookEvent', 'Invalid Facebook URL')
    }

    const slug = _.get(data, 'attributes.slug', '')
    if (!slugRE.test(slug)) {
        _.set(errors, 'attributes.slug',
            'Link may only contain alphanumeric characters (a-z, 0-9), underscores (_) and hyphens (-)')
    }

    const startDate = _.get(data, 'attributes.startDate')
    const endDate = _.get(data, 'attributes.endDate')
    if (isDateRangeInvalid(startDate, endDate)) {
        _.set(errors, 'attributes.endDate', 'End date must be after start date')
    }
    const salesStartDate = _.get(data, 'attributes.salesStartDate')
    const salesEndDate = _.get(data, 'attributes.salesEndDate')
    if (isDateRangeInvalid2(salesStartDate, salesEndDate)) {
        _.set(errors, 'attributes.salesEndDate', 'Sales end date must be after sales start date')
    }

    const minAge = _.get(data, 'attributes.minimumAge', 0)
    if (_.get(data, 'attributes.flagValidateAge') && (!minAge || !(minAge > 0))) {
        _.set(errors, 'attributes.minimumAge', 'Required')
    }

    return errors
}
const eventBase = url.parse('https://www.theticketfairy.com/event/')

class EventForm extends Component {
    static propTypes = {
        user: PropTypes.object,
        organizations: PropTypes.arrayOf(PropTypes.object),
    }
    constructor(props) {
        super(props)
        this.state = {fbURL:'', descriptionUpdate: false, importFacebook:false, submitPressed:false, importantSetting: false}
    }
    componentDidMount() {
        const {fields: {attributes: {backgroundURL,flagResaleEnabled,flagIDRequired,flagCollectNames,flagNameChecks}}} = this.props
        const v = backgroundURL.value || backgroundURL.initialValue
        if (flagCollectNames.checked == undefined){
            flagCollectNames.onChange(true)
        }
        if (flagIDRequired.checked == undefined){
            flagIDRequired.onChange(true)
        }
        if (flagResaleEnabled.checked == undefined){
            flagResaleEnabled.onChange(true)
        }
        if (flagNameChecks.checked == undefined){
            flagNameChecks.onChange(true)
        }
        this.setState({autoBackground: !v})
        if (typeof this.props.getExposedMethod === 'function') {
            this.props.getExposedMethod(this.exposedMethod.bind(this))
        }
    }
    componentWillReceiveProps(nextProps){
        const {submitPressed} = this.state
        if(!_.isEmpty(nextProps.errors) && submitPressed){
            this.setState({submitPressed: false}, function(){
                _scrollView.scrollTo(100, 0, true)
            })
        }
    }

    onDisableReferral(e){
        const {fields: {attributes: {flagDisableReferral}}} = this.props

        if (e.target.checked) {
            flagDisableReferral.onChange(true)
            this.setState({showReferral: false})
        } else {
            flagDisableReferral.onChange(false)
            this.setState({showReferral: true})
        }
    }
    onAutoBackgroundChange(e) {
        const {fields: {attributes: {backgroundURL}}} = this.props
        if (e) {
            backgroundURL.onChange(null)
            this.setState({autoBackground: true})
        } else {
            backgroundURL.onChange(backgroundURL.initialValue)
            this.setState({autoBackground: false})
        }
    }
    onEventType(val,id){
        const {fields: {attributes: {eventType}}} = this.props
        // var id = e.target.id
        // id = id.replace('eventType_', '')

        let objEventType = arrayToObject(eventType.value)
        objEventType[id] = val
        eventType.onChange(objEventType)
    }
    processImportantSetting(id, newValue){
        const {fields: {attributes: {flagNameChecks, flagIDRequired, flagResaleEnabled, flagCollectNames}}} = this.props
        const {importantSettingID} = this.state
        let ctlID = !!id ? id : importantSettingID
        switch(ctlID){
            case 'attributes.flagNameChecks':
                flagNameChecks.onChange(newValue)
                break
            case 'attributes.flagIDRequired':
                flagIDRequired.onChange(newValue)
                break
            case 'attributes.flagResaleEnabled':
                flagResaleEnabled.onChange(newValue)
                break
            case 'attributes.flagCollectNames':
                flagCollectNames.onChange(newValue)
            default:
                break
        }
    }
    onClickNewBrand = () => {
        console.warn('fdsafdsa')
        if(this.props.onClickNewBrand)
          this.props.onClickNewBrand()
    }
    handleImportantSetting(){
        this.processImportantSetting(null, false)
        this.setState({importantSetting: false})
    }
    closeImportantSetting(){
        this.setState({importantSetting: false})
    }
    autoShortName(e){
        const {fields: {attributes: {displayName, shortName}}} = this.props
        const str = e
        displayName.onChange(str)
        if(!str || str.length > 17 || shortNameRE.test(str))
            return
        shortName.onChange(str)
    }
    openFBDialog(){
        const {fields: {attributes: {displayName}}} = this.props
        this.setState({importFacebook: true})
    }
    closeFBDialog() {
        this.setState({importFacebook: false})
    }
    onFbEvent(e){
        this.setState({fbURL: e.target.value})
    }
    processSubmit(){
        const {handleSubmit} = this.props
        this.setState({submitPressed: true}, function() {
            handleSubmit()
        })
    }
    handleFBImport(){
        const {fbURL} = this.state
        const parent = this
        let url = fbURL
        if (/^(https?:\/\/)?((w{3}\.)?)facebook.com\/events\/[0-9]+/i.test(url)){
            url = url.replace(/\/$/, '')
            let id = url.substring(url.lastIndexOf('/') + 1)

            const {fields: {attributes: {displayName}}} = this.props
            const {fields: {attributes: {description}}} = this.props
            const {fields: {attributes: {startDate}}} = this.props
            const {fields: {attributes: {endDate}}} = this.props
            const {fields: {attributes: {imageURL}}} = this.props
            const {fields: {attributes: {venue}}} = this.props
            const {fields: {attributes: {facebookEvent}}} = this.props
            facebookEvent.onChange(fbURL)

            let convertToHTML = (pureText) => {
                if(!pureText)
                    return ''
                pureText = pureText.replace(/\n/g, '<br>\n')
                return '<div>' + pureText + '</div>'
                //return pureText
            }
            let removeTimeOffset = (dateStr) => {
                if(!dateStr)
                    return null
                return dateStr.substring(0, dateStr.length - 5) + '.000Z'
            }

            fb.fetchSDK()
                .catch(onerror)
                .then(FB => {
                    return new Promise((resolve) => {
                        // Note: The call will only work if you accept the permission request
                        //FB.api('/me/events', {id: '1747328815524686'}, function(response){console.log(response)});
                        FB.login(function(){
                            FB.api('/' + id +'?fields=description,timezone,cover,start_time,end_time,name,place', function(response){
                                if(response.error){
                                }else{
                                    parent.refs.description.editor.setContent(convertToHTML(response.description))
                                    displayName.onChange(response.name)
                                    startDate.onChange(removeTimeOffset(response.start_time))
                                    endDate.onChange(removeTimeOffset(response.end_time))
                                    imageURL.onChange(response.cover.source)
                                    let venueObj = {
                                        'displayName':response.place.name,
                                        'street':response.place.location.street,
                                        'city':response.place.location.city,
                                        'state':response.place.location.state,
                                        'country':response.place.location.country,
                                        'postalCode':response.place.location.zip,
                                        'longitude':response.place.location.longitude,
                                        'latitude':response.place.location.latitude
                                    }
                                    venue.onChange(venueObj)
                                    parent.setState({importFacebook: false})
                                }
                            })
                        }, {scope: 'public_profile'})
                    })
                        .catch(onerror)
                })
                .catch(onerror)
                .then(session => {
                    if (session.status === 'connected') {
                        this.props.onTokenResponse(session.authResponse)
                    } else if (session.status === 'not_authorized') {
                        throw new Error('You have not authorized The Ticket Fairy to use your Facebook details.')
                    } else {
                        throw new Error('You did not successfully sign in to Facebook.')
                    }
                })
                .catch(onerror)
        } else {
            console.log('URL is invalid:', url)
        }
    }
    tagsChange(tags) {
        this.props.fields.attributes.tags.onChange(tags)
    }
    async exposedMethod(){
        const {handleSubmit, fields:{attributes:{description}}} = this.props
        const filtered = await this.refs.description.getHTML()
        if (filtered == '<p><br></p>' || filtered == '<p><br></p>'){
            return ''
        }
        return filtered
    }
    onSelect(data) {
    }
    render() {
        const {importFacebook, editingDate, autoBackground, showReferral, descriptionUpdate, importantSetting} = this.state
        const {
            fields: {
                attributes: {
                    displayName, shortName, slug, description, bannerURL, imageURL, backgroundURL, twitterHashtag, facebookEvent,
                    startDate, endDate, salesStartDate, salesEndDate, minimumAge,
                    flagNameChecks, flagIDRequired, flagResaleEnabled,
                    flagCarer, flagRefunds, flagNameChanges, flagTicketSwaps,
                    flagCollectNames, flagDisableReferral, flagEnableWaitingList, flagInvitationsOnly,
                    flagRequirePhone, flagTaxesIncluded, flagValidateAge, venue,
                    eventType, tags
                },
                relationships: {
                    owner: {data: owner}
                }
            },
            formKey, submitting, handleSubmit, submitFailed, submitLabel, user, organizations, initialValues, isNew} = this.props
        let objEventType = arrayToObject(eventType.value)
        //const userName = [user.firstName, user.lastName, '(you)'].filter(Boolean).join(' ')
        let date = _.get(this.props.fields, editingDate, {}).value
        if (!_.isDate(date)) {
            date = null
        }
        // const eventURL = url.format({...eventBase, pathname: eventBase.pathname + slug.value})
        const findBrand = (id) => _.find(organizations, {value: id})

        const requireAdditional = !!(flagValidateAge.value)
        let slugSuggestion = !startDate.value ? displayName.value : displayName.value + '-' + moment.utc(startDate.value).format('DMMMYYYY')
        let fetchFromFacebook = descriptionUpdate
        return (
            <View>
                {isNew &&
                    <View>
                        <View style={[commonStyle.heading_style,{marginBottom:0}]}>
                            <Text style={newevent.title}>Add New Events</Text>
                            {DeviceInfo.isTablet() &&
                            <Button title='Import Event from Facebook' icon="facebook" style={{backgroundColor:'#396ba9'}}/>}
                        </View>
                        {!DeviceInfo.isTablet() &&
                            <View style={{marginVertical: 20, flexDirection: 'row'}}>
                                <Button title='Import Event from Facebook' icon="facebook" style={{backgroundColor:'#396ba9'}}/>
                            </View>
                        }
                    </View>
                }
                <View style={newevent.form_group}>
                    <Panel icon="info" title="Event Details" style={{marginBottom:30}}>
                        <View style={{marginTop:-10, flexDirection: 'row', }}>
                            <Select
                                style={{flex:1}}
                                label="Brand"
                                options={organizations.map((o)=>({value:o.id,label:o.displayName}))}
                                onBlur={e => owner.onBlur(findBrand(e.value))}
                                {...owner}
                                onChange={(value)=>owner.onChange(_.find(organizations, {id:value}))}
                                value={_.get(owner, 'value.id')}
                                defaultValue = "Select the brand running this event"
                            />
                            <Button style={{backgroundColor: '#638a94', marginTop: 26}} title='Create Brand' onPress={this.onClickNewBrand} />
                        </View>
                        <View style={{flexDirection:DeviceInfo.isTablet() ?'row':'column',}}>
                            <View style={{flex:1, paddingRight:DeviceInfo.isTablet() ?10:0}}>
                                <Field id="name" label="Event Name" {...displayName} onChange={(e)=>this.autoShortName(e)} />
                            </View>
                            <View style={{flex:1, paddingLeft:DeviceInfo.isTablet() ?10:0,}}>
                                <Field id="shortName" label="Short Event Name" size="large" {...shortName} />
                            </View>
                        </View>

                        <AutoSlugField id="slug" label="Link URL" {...slug} separator="-"
                                       hint="Letters, numbers and hyphens only"
                                       suggestion={slugSuggestion}/>

                        <View style={{flexDirection:DeviceInfo.isTablet() ?'row':'column',marginBottom:25}}>
                            <View style={{flex:1, paddingRight:DeviceInfo.isTablet() ?10:0}}>
                                <DateTimePickera id="startDate" label="Start date" loadingFromFB={importFacebook} placeholder="D MMM YYYY H:M AM" {...startDate}/>
                            </View>
                            <View style={{flex:1, paddingLeft:DeviceInfo.isTablet() ?10:0,}}>
                                <DateTimePickera id="endDate" label="End date" loadingFromFB={importFacebook} placeholder="D MMM YYYY H:M AM" {...endDate} suggestion={startDate.value} />
                            </View>
                        </View>

                    </Panel>

                    <Panel icon="pencil-square" title="Add Event Description" style={{marginBottom:30}}>
                        <RichTextArea ref="description" id="description" label="" {...description} baseurl={process.env.ADMIN_CDN_URL}/>
                    </Panel>

                    <Panel icon="camera" title="Event Images" style={{marginBottom:30}}>
                        <View style={{flexDirection:DeviceInfo.isTablet() ?'row':'column'}}>
                            <View style={{flex:1, }}>
                                <FileUploader label="Add Flyer/Poster" filetype="image" {...imageURL} />
                            </View>
                            <View style={{flex:2, marginLeft:DeviceInfo.isTablet() ? 25:0,marginTop:DeviceInfo.isTablet() ? 0: 15}}>
                                {!autoBackground &&<FileUploader label="Add Background Image (optional)" filetype="image" {...backgroundURL} />}
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Text numberOfLines={2}
                                        style={{color:'#E9E9E9', fontSize:13, fontFamily:'OpenSans-Bold', marginRight:10, flex:1}}>
                                        Use automatically-generated background
                                    </Text>
                                    <Switch
                                        onChange={(e)=>this.onAutoBackgroundChange(e)}
                                        checked={!!autoBackground} />
                                </View>
                            </View>
                        </View>
                    </Panel>

                    <Panel icon="toggle-on" title="Event Type" style={{marginBottom:30}}>
                        <Field id="eventType" type="showOnlyError" {...eventType} />
                        <View style={{flexDirection:DeviceInfo.isTablet() ?'row':'column'}}>
                            <View style={{flex:1,}}>
                                <Switch label="Festival"
                                        checked={objEventType.festival}
                                        onChange={(val)=>this.onEventType(val, 'festival')}/>
                                <Switch label="Concert"
                                        checked={objEventType.concert}
                                        onChange={(e)=>this.onEventType(e, 'concert')}/>
                                <Switch label="eSports Tournament"
                                        checked={objEventType.esportsTournament}
                                        onChange={(e)=>this.onEventType(e, 'esportsTournament')}/>
                                <Switch label="Club Show"
                                        checked={objEventType.clubShow}
                                        onChange={(e)=>this.onEventType(e, 'clubShow')}/>

                                <Switch label="Stadium Show"
                                        checked={objEventType.stadiumShow}
                                        onChange={(e)=>this.onEventType(e, 'stadiumShow')}/>

                                <Switch label="Convention"
                                        checked={objEventType.convention}
                                        onChange={(e)=>this.onEventType(e, 'convention')}/>

                                <Switch label="Conference"
                                        checked={objEventType.conference}
                                        onChange={(e)=>this.onEventType(e, 'conference')}/>
                            </View>

                            <View style={{flex:1,}}>
                                <Switch label="Community Event"
                                        checked={objEventType.communityEvent}
                                        onChange={(e)=>this.onEventType(e, 'communityEvent')}/>

                                <Switch label="Technology Event"
                                        checked={objEventType.technologyEvent}
                                        onChange={(e)=>this.onEventType(e, 'technologyEvent')}/>

                                <Switch label="Gaming Event"
                                        checked={objEventType.gamingEvent}
                                        onChange={(e)=>this.onEventType(e, 'gamingEvent')}/>

                                <Switch label="Corporate Event"
                                        checked={objEventType.corporateEvent}
                                        onChange={(e)=>this.onEventType(e, 'corporateEvent')}/>

                                <Switch label="Business Event"
                                        checked={objEventType.businessEvent}
                                        onChange={(e)=>this.onEventType(e, 'businessEvent')}/>

                                <Switch label="Private Event/Party"
                                        checked={objEventType.privateEvent}
                                        onChange={(e)=>this.onEventType(e, 'privateEvent')}/>
                                <Switch label="Sports Event"
                                        checked={objEventType.sportsEvent}
                                        onChange={(e)=>this.onEventType(e, 'privateEvent')}/>
                            </View>
                        </View>
                    </Panel>

                    <Panel icon="toggle-on" title="Event Settings" style={{marginBottom:30}}>
                        <View style={{flexDirection:DeviceInfo.isTablet() ?'row':'column'}} >
                            <Switch style={{flex:DeviceInfo.isTablet() ? 1:0}} label="Invitation required to attend" {...flagInvitationsOnly}/>
                            <Switch style={{flex:DeviceInfo.isTablet() ? 1:0}} label="Free carer ticket for disabled guests" {...flagDisableReferral}/>
                            <Switch style={{flex:DeviceInfo.isTablet() ? 1:0}} label="Refunds allowed" {...flagRefunds}/>
                        </View>
                    </Panel>

                    <Panel icon="share-square" title="Social Media" style={{marginBottom:30}}>
                        <View style={{flexDirection:'row', alignItems:'center'}}>
                            <Image style={{width:32, height:32, marginTop: 15, borderRadius:2}} source={require('@nativeRes/images/event-facebook-link.png')}/>
                            <Field ref="facebookEvent" id="facebookEvent" label="Facebook Event" size="large" {...facebookEvent}/>
                        </View>
                        <View style={{flexDirection:'row', marginBottom:40, alignItems:'center'}}>
                            <Image style={{width:32, height:32,marginTop: 15, borderRadius:2}} source={require('@nativeRes/images/event-hashtag-link.png')}/>
                            <Field ref="twitterHashtag" id="twitterHashtag" label="# Hashtag" size="large" {...twitterHashtag}/>
                        </View>
                    </Panel>

                    {/*requireAdditional &&
                    <Panel icon="tags" title="Minimum age" style={{marginBottom:30}}>
                        <Select label="Minimum age"
                                {...minimumAge}
                                options={range30}
                                defaultValue="Select minimum age"
                        />
                        <View style={{borderBottomWidth:0.5, borderColor:'#47516d'}}>
                            <Text style={{color:'#E9E9E9', fontSize:12,fontFamily:'OpenSans', marginLeft:9}}>Since this event requires age checks, a minimum age must be specified.
                            </Text>
                        </View>
                    </Panel>*/}

                    <Panel icon="tags" title="Tags" style={{marginBottom:30}}>
                        <TagsField value={tags.value} onChange={(e)=>this.tagsChange(e)} />
                    </Panel>
                    <View style={[commonStyle.rowContainer,{justifyContent:'center'}]}>
                        <Button
                            loading={submitting}
                            onPress={()=>this.processSubmit()}
                            title={submitLabel || 'Create event and select Venue'}
                            >
                        </Button>
                    </View>
                </View>
            </View>
        )
    }

} export default reduxForm({
    form: 'editevent',
    fields: [
        'relationships.owner.data',
        'attributes.description',
        'attributes.displayName',
        'attributes.shortName',
        'attributes.slug',
        'attributes.bannerURL',
        'attributes.imageURL',
        'attributes.backgroundURL',
        'attributes.startDate',
        'attributes.endDate',
        'attributes.salesStartDate',
        'attributes.salesEndDate',
        'attributes.minimumAge',
        'attributes.flagCarer',
        'attributes.flagCollectNames',
        'attributes.flagDisableReferral',
        'attributes.flagEnableWaitingList',
        'attributes.flagIDRequired',
        'attributes.flagInvitationsOnly',
        'attributes.flagNameChanges',
        'attributes.flagNameChecks',
        'attributes.flagRefunds',
        'attributes.flagRequirePhone',
        'attributes.flagResaleEnabled',
        'attributes.flagTaxesIncluded',
        'attributes.flagTicketSwaps',
        'attributes.flagValidateAge',
        'attributes.facebookEvent',
        'attributes.twitterHashtag',
        'attributes.venue',
        'attributes.eventType',
        'attributes.tags',
    ],
    validate: validateEvent
})(EventForm)
