import _ from 'lodash'
import React, {
  Component, PropTypes
} from 'react'
import {connect} from 'react-redux'
import session_audience from '../../_common/redux/audience/actions'
import session_brand from '../../_common/redux/brands/actions'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  ListView,
  Picker,
  TouchableWithoutFeedback
} from 'react-native'

import {Panel, PieChart, LoadingBar, ProgressCircle} from '../_library'
import {commonStyle} from '../../native/styles'
import style, {COLORS, GRADIENT_COLORS1, GRADIENT_COLORS2} from '../../native/styles/demographics'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3

class BrandAudienceDemoGraphics extends React.Component {
  constructor(props) {
    super(props)
    this.state = {status: STATE_STATUS_INIT}
  }
  componentDidMount() {
    if (this.state.status == STATE_STATUS_LOADING) {
      return
    }
    const {brands, params: {id}, FETCH_AUDIENCE} = this.props
    const brand = brands[id]
    const loadingSetter = (val) => () =>{
      this.setState({status: val})
    }
    Promise.resolve(FETCH_AUDIENCE(id, 'brand', 'gender'))
      .catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
      .then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
    loadingSetter(STATE_STATUS_LOADING)()
  }
  render() {
    const {status} = this.state
    const {audience} = this.props
    let content_gender = <LoadingBar/>

    // Gender Breakdown
    let gender = {male: 0, female: 0, male_percent: 0, female_percent: 0}
    if(status > STATE_STATUS_LOADING && audience && audience.audience && audience.audience.gender) {
      gender.male = audience.audience.gender.male
      gender.female = audience.audience.gender.female
      let sum = gender.male + gender.female
      sum = sum < 1 ? 1 : sum
      gender.female_percent = parseInt(gender.female / sum * 100)
      gender.male_percent = 100 - gender.female_percent

      content_gender =
          <Panel title='Gender Breakdown' icon='male'>
            <View style={{alignItems: 'center'}}><Text style={commonStyle.chartTitleLabel}>Ticket Buyers by
              Gender</Text></View>
            <View style={style.genderBreakdownContentWrapper}>
              <View style={style.genderBreakdownItemWrapper}>
                <PieChart
                  json={{'FEMALE': gender.female, 'MALE': gender.male}}
                  options={{size: 200, legands: false, pieLabel: true, colors: ['#FB52AE', '#5876FF']}}
                />
                <View style={{flexDirection: 'row', width: 190}}>
                  <View style={{borderBottomWidth: 2, borderBottomColor: '#5876FF', flex: 3, alignItems: 'center'}}>
                    <Text style={[style.textDescription, {marginTop: 10}]}>MALE</Text>
                  </View>
                  <View style={{borderBottomWidth: 2, borderBottomColor: '#FFFFFF', flex: 4, alignItems: 'center'}}>
                    <Text style={[style.textTitle, {marginTop: 5}]}>OVERALL</Text>
                  </View>
                  <View style={{borderBottomWidth: 2, borderBottomColor: '#FB52AE', flex: 3, alignItems: 'center'}}>
                    <Text style={[style.textDescription, {marginTop: 10}]}>FEMALE</Text>
                  </View>
                </View>
              </View>
              <View style={style.genderBreakdownItemWrapper}>
                <ProgressCircle tintColor='#FB52AE' value={gender.female_percent}
                                img={require('@nativeRes/images/icon-female.png')}/>
                <View style={{alignItems: 'center'}}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={style.textInfo}>{gender.female}</Text>
                    <Text style={style.textTitle}>FEMALE</Text>
                  </View>
                  <Text style={style.textDescription}>Ticket Buyers</Text>
                </View>
              </View>
              <View style={style.genderBreakdownItemWrapper}>
                <ProgressCircle tintColor='#5876FF' value={gender.male_percent}
                                img={require('@nativeRes/images/icon-male.png')}/>
                <View style={{alignItems: 'center'}}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={style.textInfo}>{gender.male}</Text>
                    <Text style={style.textTitle}>MALE</Text>
                  </View>
                  <Text style={style.textDescription}>Ticket Buyers</Text>
                </View>
              </View>
            </View>
          </Panel>
    }
    return(
      <View>
        {content_gender}
      </View>
    )
  }

}export default connect(
  (state) => {
    const brands = state.brands.get('collection').toJS()
    const audience = state.audience.get('audience').toJS()
    return {
      brands,
      audience
    }
  },
  {
    FETCH_BRAND: session_brand.FETCH_BRAND,
    FETCH_AUDIENCE:session_audience.FETCH_AUDIENCE
  }
)(BrandAudienceDemoGraphics)
