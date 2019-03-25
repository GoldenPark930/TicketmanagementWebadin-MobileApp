import _ from 'lodash'
import React from 'react'
import {connect} from 'react-redux'
import {View, Text, ScrollView, Image} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import DeviceInfo from 'react-native-device-info'

import audienceActions from '../../_common/redux/audience/actions'
import performanceActions from '../../_common/redux/performance/actions'

import {Panel, PieChart, BarChart, ProgressCircle, Grid} from '../_library'
import {commonStyle} from '../../native/styles'
import style, {COLORS, GRADIENT_COLORS1, GRADIENT_COLORS2} from '../../native/styles/demographics'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_SUCCESSED = 2
const STATE_STATUS_FAILED = 3

class EventAudienceDemographics extends React.Component {
  constructor(props) {
    super(props)
    this.unMounted = true
    this.state = {
      status_audience_gender: STATE_STATUS_INIT,
      status_audience_psychographics: STATE_STATUS_INIT,
      status_performance_demographics: STATE_STATUS_INIT
    }
  }

  componentDidMount() {
    const {event, FETCH_AUDIENCE, FETCH_EVENT_DEMOGRAPHICS} = this.props
    const loadingSetter = (type, val) => () =>{
      switch(type){
        case 1:
          this.setState({status_audience_gender: val})
          break
        case 2:
          this.setState({status_audience_psychographics: val})
          break
        case 3:
          this.setState({status_performance_demographics: val})
          break
        default:
          break
      }
    }
    // audience_gender
    Promise.resolve(FETCH_AUDIENCE(event.id, 'event', 'gender'))
      .catch(loadingSetter(1, STATE_STATUS_FAILED))
      .then(loadingSetter(1, STATE_STATUS_SUCCESSED))
    loadingSetter(1, STATE_STATUS_LOADING)()
    // audience_psychographics
    Promise.resolve(FETCH_AUDIENCE(event.id, 'event', 'psychographics'))
      .catch(loadingSetter(2, STATE_STATUS_FAILED))
      .then(loadingSetter(2, STATE_STATUS_SUCCESSED))
    loadingSetter(2, STATE_STATUS_LOADING)()
    // performance_demographics
    Promise.resolve(FETCH_EVENT_DEMOGRAPHICS(event.id))
      .catch(loadingSetter(3, STATE_STATUS_FAILED))
      .then(loadingSetter(3, STATE_STATUS_SUCCESSED))
    loadingSetter(3, STATE_STATUS_LOADING)()
  }
  componentWillUnmount(){
    this.unMounted=true
  }
  renderContentGenderBreakdown() {
    // Gender Breakdown
    const {status_audience_gender} = this.state
    const {audience_gender, audience_psychographics, performance, event} = this.props
    let gender = {male: 0, female: 0, male_percent: 0, female_percent: 0}
    if (status_audience_gender > STATE_STATUS_LOADING && audience_gender && audience_gender.audience && audience_gender.audience.gender){
      gender.male = audience_gender.audience.gender.male
      gender.female = audience_gender.audience.gender.female
      let sum = gender.male+gender.female
      sum = sum < 1 ? 1 : sum
      gender.female_percent = parseInt(gender.female / sum * 100)
      gender.male_percent = 100 - gender.female_percent
    }
    return (
      <View>
        <Panel title='Gender Breakdown' icon='male'>
          <View style={{alignItems: 'center'}}><Text style={commonStyle.chartTitleLabel}>Ticket Buyers by Gender</Text></View>
          <View style={style.genderBreakdownContentWrapper}>
            <View style={style.genderBreakdownItemWrapper}>
              <PieChart
                json={{'FEMALE': gender.female, 'MALE': gender.male}}
                options={{size: 200, legands: false, pieLabel: true, colors: ['#FB52AE', '#5876FF']}}
              />
              <View style={{flexDirection: 'row', width:190}}>
                <View style={{borderBottomWidth:2, borderBottomColor:'#5876FF', flex:3, alignItems:'center'}}>
                  <Text style={[style.textDescription,{marginTop:10}]}>MALE</Text>
                </View>
                <View style={{borderBottomWidth:2, borderBottomColor:'#FFFFFF', flex:4, alignItems:'center'}}>
                  <Text style={[style.textTitle,{marginTop:5}]}>OVERALL</Text>
                </View>
                <View style={{borderBottomWidth:2, borderBottomColor:'#FB52AE', flex:3, alignItems:'center'}}>
                  <Text style={[style.textDescription,{marginTop:10}]}>FEMALE</Text>
                </View>
              </View>
            </View>
            <View style={style.genderBreakdownItemWrapper}>
              <ProgressCircle tintColor='#FB52AE' value={gender.female_percent} img={require('@nativeRes/images/icon-female.png')}/>
              <View style={{alignItems:'center'}}>
                <View style={{flexDirection:'row'}}>
                  <Text style={style.textInfo}>{gender.female}</Text>
                  <Text style={style.textTitle}>FEMALE</Text>
                </View>
                <Text style={style.textDescription}>Ticket Buyers</Text>
              </View>
            </View>
            <View style={style.genderBreakdownItemWrapper}>
              <ProgressCircle tintColor='#5876FF' value={gender.male_percent} img={require('@nativeRes/images/icon-male.png')}/>
              <View style={{alignItems:'center'}}>
                <View style={{flexDirection:'row'}}>
                  <Text style={style.textInfo}>{gender.male}</Text>
                  <Text style={style.textTitle}>MALE</Text>
                </View>
                <Text style={style.textDescription}>Ticket Buyers</Text>
              </View>
            </View>
          </View>
        </Panel>
      </View>
    )
  }

  renderContentAgeBreakdown() {
    const {performance} = this.props
    // Age Breakdown
    let json = {}
    if (performance && performance.age_breakdown) {
      _.map(performance.age_breakdown, (age, index) => {
        return json[age.age] = parseInt(age.number)
      })
    }

    return (
      <View style={{marginTop: 10}}>
        <Panel title='Age Breakdown' icon='sliders'>
          <BarChart json={json} options={{title: 'Tickets buyers by AGE'}}/>
        </Panel>
      </View>
    )
  }

  renderContentAgeRange() {
    const {performance} = this.props

    // Age Range
    let datum = [['< 17', 0, 0], ['18-20', 0, 0], ['21-25', 0, 0], ['26-30', 0, 0], ['31-40', 0, 0], ['41+', 0, 0]]
    let total = 0
    let highest = 0
    let max = 0, min = 0
    let lowest = 5
    if (performance && performance.age_breakdown) {
      _.map(performance.age_breakdown, (t) => {
        const age = parseInt(t.age)
        const number = parseInt(t.number)
        total += number
        if (age <= 17) {
          datum[0][1] += number
        } else if (age <= 20) {
          datum[1][1] += number
        } else if (age <= 25) {
          datum[2][1] += number
        } else if (age <= 30) {
          datum[3][1] += number
        } else if (age <= 40) {
          datum[4][1] += number
        } else {
          datum[5][1] += number
        }
      })
      _.map(datum, (t, index) => {
        if (max < t[1]) {
          max = t[1]
          highest = index
        }
        if (min > t[1]) {
          min = t[1]
          lowest = index
        }
        t[2] = parseInt(Math.round(t[1] / (total == 0 ? 1 : total) * 100))
      })
    }

    return (
      <View style={{marginTop: 10}}>
        <Panel title='Ticket Buyers by Age Range' icon='dot-circle-o'>
          <View style={{alignItems: 'center'}}><Text style={commonStyle.chartTitleLabel}>Tickets Buyers by AGE RANGE</Text></View>
          <ScrollView horizontal={DeviceInfo.isTablet()}>
            <View style={style.ageRangeContentWrapper}>
              {
                _.map(datum, (t, index) => {
                  return (
                    <View key={index} style={style.ageRangeItemWrapper}>
                      <LinearGradient start={{x: 0.0, y: 1.0}} end={{x: 0.0, y: 0.5}} colors={GRADIENT_COLORS2[index]} style={{height:240,alignItems:'center',justifyContent:'center'}}>
                        <ProgressCircle size={180} value={t[2]} tintColor={COLORS[index]}/>
                      </LinearGradient>
                      <LinearGradient start={{x: 0.0, y: 1.0}} end={{x: 1.0, y: 0.0}} colors={GRADIENT_COLORS1[index]} style={{height:50,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.3)'}}>
                        <View style={{flex:1,backgroundColor:'transparent',justifyContent:'center'}}>{index == 0 && <Text style={{padding:5,color:'#FFF',fontSize:10,position:'absolute'}}>TICKET{'\n'}BUYERS</Text>}<Text style={{fontSize:26,color:'#FFF',textAlign:'center'}}>{t[1].toLocaleString('en-US')}</Text></View>
                      </LinearGradient>
                      <LinearGradient start={{x: 0.0, y: 1.0}} end={{x: 1.0, y: 0.0}} colors={GRADIENT_COLORS1[index]} style={{height:50}}>
                        <View style={{flex:1,backgroundColor:'transparent',height:50,justifyContent:'center'}}>{index == 0 && <Text style={{padding:5,color:'#FFF',fontSize:10,position:'absolute'}}>AGE{'\n'}GROUPS</Text>}<Text style={{fontSize:18,color:'#FFF',textAlign:'center'}}>{t[0]}</Text></View>
                      </LinearGradient>
                    </View>
                  )
                })
              }
            </View>
          </ScrollView>
          <View style={style.ageRangeSummaryWrapper}>
            <View style={style.ageRangeSummaryItemWrapper}>
              <View style={style.ageRangeSummaryInfoWrapper}><Image style={style.ageRangeSummaryInfoIcon} resizeMode='contain' source={require('@nativeRes/images/demographics-star.png')}/><Text style={style.ageRangeSummaryInfoLabel}>&nbsp;{total.toLocaleString('en-US')}</Text></View>
              <Text style={style.textDescription}>TOTAL TICKET BUYERS</Text>
            </View>
            <View style={style.ageRangeSummaryItemWrapper}>
              <View style={style.ageRangeSummaryInfoWrapper}><Image style={style.ageRangeSummaryInfoIcon} resizeMode='contain' source={require('@nativeRes/images/demographics-highest.png')}/><Text style={style.ageRangeSummaryInfoLabel}>&nbsp;{datum[highest][0]}</Text></View>
              <Text style={style.textDescription}>HIGHEST AGE GROUP</Text>
            </View>
            <View style={style.ageRangeSummaryItemWrapper}>
              <View style={style.ageRangeSummaryInfoWrapper}><Image style={style.ageRangeSummaryInfoIcon} resizeMode='contain' source={require('@nativeRes/images/demographics-lowest.png')}/><Text style={style.ageRangeSummaryInfoLabel}>&nbsp;{datum[lowest][0]}</Text></View>
              <Text style={style.textDescription}>LOWEST AGE GROUP</Text>
            </View>
          </View>
        </Panel>
      </View>
    )
  }
  renderProfessions() {
    const {audience_psychographics} = this.props
    const {status_audience_psychographics} = this.state
    let total_titles = 0, profile_count = 0
    let rows_job_titles = [], filtered_titles = {}
    let content_job_title = null
    if(status_audience_psychographics > STATE_STATUS_LOADING && audience_psychographics && audience_psychographics.audience && audience_psychographics.audience.jobs && audience_psychographics.audience.jobs.titles){
      profile_count = audience_psychographics.audience.jobs.profile_count
      let job_titles = audience_psychographics.audience.jobs.titles
      // test case
      // job_titles['ALead Developer'] = 1
      // job_titles['ALead developer'] = 2

      // filter titles

      _.map(job_titles, (value, key)=>{
        let isFound = false, found_value = null, found_key = null
        _.map(filtered_titles, (f_value, f_key)=>{
          if(key.toLowerCase() == f_key.toLowerCase()){
            isFound = true
            found_value = f_value
            found_key = f_key
          }
        })
        if(isFound){
          if(found_value < value){
            delete filtered_titles[found_key]
            filtered_titles[key] = Math.max(found_value, value)
          }
        }else{
          filtered_titles[key] = value
        }
      })
      _.map(filtered_titles, (value, key)=>{
        rows_job_titles.push({
          title: key,
          value: value
        })
        total_titles += value
      })
      content_job_title = (
        <Grid
          columns={[{
            name: 'Title',
            dataIndex: 'title',
            width: 200
          }, {
            name: 'Number',
            dataIndex: 'value',
            width: 100
          }]}
          stripe
          data={rows_job_titles}
          headerCellStyle = {{fontWeight:'bold'}}
        />
      )
    }
    return (
      <View style={{marginTop: 10}}>
        <Panel icon={'briefcase'} title={'Professions'}>
          <View style={{alignItems: 'center'}}>
            <View style={style.profession_stat}>
              <Image style={style.profession_stat_image} source={require('@nativeRes/images/system_icons/profession.png')}/>
              <View>
                <Text style={style.profession_stat_title}>{total_titles}</Text>
                <Text style={style.profession_stat_subTitle}>Job Titles</Text>
              </View>
            </View>
            <View style={style.across}>
              <Text style={style.across_text}>ACROSS</Text>
            </View>
            <View style={style.profession_stat}>
              <Image style={[style.profession_stat_image, {height: 28.92}]} source={require('@nativeRes/images/system_icons/tickets.png')}/>
              <View>
                <Text style={style.profession_stat_title}>{profile_count}</Text>
                <Text style={style.profession_stat_subTitle}>Ticket Buyers</Text>
              </View>
            </View>
            <View>
              {content_job_title}
            </View>
          </View>
        </Panel>
      </View>
    )
  }
  render() {

    return (
      <View>
        {this.renderContentGenderBreakdown()}
        {this.renderContentAgeBreakdown()}
        {this.renderContentAgeRange()}
        {this.renderProfessions()}
      </View>
    )
  }
}

export default connect(
  (state) => {
    const event = state.events.get('selected').toJS()
    const audience = state.audience.get('event').toJS()
    const audience_gender = audience.gender
    const audience_psychographics = audience.psychographics
    const performance = state.performance.get('performance').toJS()
    return {
      event,
      audience_gender,
      audience_psychographics,
      performance
    }
  },
  {
    FETCH_AUDIENCE: audienceActions.FETCH_AUDIENCE,
    FETCH_EVENT_DEMOGRAPHICS: performanceActions.FETCH_EVENT_DEMOGRAPHICS
  }
)(EventAudienceDemographics)
