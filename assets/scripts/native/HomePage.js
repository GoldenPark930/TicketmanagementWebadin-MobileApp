import React, {
    Component, PropTypes
} from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    ListView,
    TouchableWithoutFeedback
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {home} from 'AppStyles'
import {routeActions} from 'react-router-redux'
import {connect} from 'react-redux'

import DeviceInfo from 'react-native-device-info'

class HomePage extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isBrand: false,
            option: 0,
        }
    }

    gotoAction(url, e) {
        e.preventDefault()
        e.stopPropagation()
        const {replace} = this.props
        replace(url)
    }
    onSelectType() {
        var id = e.target.id
        this.setState({isBrand: id == 'brands'})
    }
    goToBrands() {
        const {replace} = this.props
        replace('/brands')
    }
    goToBrandNew() {
        const {replace} = this.props
        replace('/brands/new')
    }
    goToEvents() {
        const {replace} = this.props
        replace('/events')
    }
    goToEventNew() {
        const {replace} = this.props
        replace('/events/new')
    }
    onOption() {
        if (this.state.option == 1){
            return(
                <LinearGradient colors={['#1DCFE3', '#2B6BFF']} style={home.manage_brands}>
                    <View style={home.tab_icon}>
                        <Image style={home.tav_icon_img} source={require('@nativeRes/images/icon-main-brand.png')} />
                    </View>
                    <View>
                        <View style={{ height:5, flex:1, backgroundColor:'#2C313E',marginTop:-2.5}}></View>
                    </View>
                </LinearGradient>
            )
        }else if (this.state.option == 2){
            return(
                <LinearGradient colors={['#B492FC', '#8164ED']} style={home.manage_brands}>
                    <View style={home.tab_icon}>
                        <Image style={home.tav_icon_img} source={require('@nativeRes/images/icon-main-team.png')} />
                    </View>
                    <View>
                        <View style={{ height:5, flex:1, backgroundColor:'#2C313E',marginTop:-2.5}}></View>
                    </View>
                </LinearGradient>
            )
        }else if (this.state.option == 3){
            return(
                <LinearGradient colors={['#57E393', '#00C29A']} style={home.manage_brands}>
                    <View style={home.tab_icon}>
                        <Image style={home.tav_icon_img} source={require('@nativeRes/images/icon-main-ads.png')} />
                    </View>
                    <View>
                        <View style={{ height:5, flex:1, backgroundColor:'#2C313E',marginTop:-2.5}}></View>
                    </View>
                </LinearGradient>
            )
        }else if (this.state.option == 4){
            return(
                <LinearGradient colors={['#e687d7','#c250d0']} style={home.manage_brands}>
                    <View style={home.tab_icon}>
                        <Image style={home.tav_icon_img} source={require('@nativeRes/images/icon-main-tour.png')} />
                    </View>
                    <View>
                        <View style={{ height:5, flex:1, backgroundColor:'#2C313E',marginTop:-2.5}}></View>
                    </View>
                </LinearGradient>
            )
        }else {
            return
        }
    }

    render() {
        const {user} = this.props
        const displayName = !!user ? user.firstName : ''
        let {isBrand} = this.state
        if(DeviceInfo.isTablet()) {
            return (
                <View style={home.body_main}>
                  <Text style={home.welcom}>Welcome to THE<Text style={home.ticket}>TICKET</Text>FAIRY</Text>
                  <Text style={home.text_center}>What would you like to do today, {displayName}?</Text>
                  <View style={{flexDirection: 'row', marginHorizontal: 20}}>
                    <View style={[home.accordion,{height:440}]}>
                      <LinearGradient colors={['#ffaf4d', '#ff4c67']} style={[home.manage_events]}>
                        <View style={[home.tab_icon, {flex: 0}]}>
                          <Image style={home.tav_icon_img} source={require('@nativeRes/images/icon-main-event.png')}/>
                        </View>
                        {this.state.option == 0 ?
                          <TouchableWithoutFeedback onPress={() => this.goToEvents()}>
                            <View style={{justifyContent: 'center', flex: 1}}>
                              <View style={home.tab_content}>
                                <TouchableOpacity style={home.tab_button} onPress={() => this.goToEventNew()}>
                                  <Image style={home.tab_buttonImg} source={require('@nativeRes/images/btn-add.png')}/>
                                </TouchableOpacity>
                                <Text style={home.type}> Manage Events</Text>
                              </View>
                              <Text style={home.description}> Create and manage your events</Text>
                            </View>
                          </TouchableWithoutFeedback> :
                          <TouchableWithoutFeedback onPress={() => this.setState({option: 0})}>
                            <View style={{justifyContent: 'center', flex: 1}}>
                              <View style={home.tab_content}>
                                <TouchableOpacity style={home.tab_button} onPress={() => this.goToEventNew()}>
                                  <Image style={home.tab_buttonImg} source={require('@nativeRes/images/btn-add.png')}/>
                                </TouchableOpacity>
                                <Text style={home.type}> Manage Events</Text>
                              </View>
                              <Text style={home.description}> Create and manage your events</Text>
                            </View>
                          </TouchableWithoutFeedback>
                        }
                      </LinearGradient>
                      {this.onOption()}

                      <View style={home.accordionTop}>
                        {this.state.option != 4 ?
                          <TouchableWithoutFeedback onPress={() => this.setState({option: 4})}>
                            <View style={home.touchableStyle}>
                              <LinearGradient colors={['#e687d7', '#c250d0']}
                                              style={[home.tab_content, {borderRadius: 5}]}>
                                <View style={{width: 5, height: 64.5, backgroundColor: '#2C313E',}}></View>
                                <View style={{justifyContent: 'center', flex: 1}}>
                                  <View style={home.tab_content}>
                                    <TouchableOpacity style={home.tab_button}>
                                      <Image style={home.tab_buttonImg} source={require('@nativeRes/images/btn-add.png')}/>
                                    </TouchableOpacity>
                                    <Text style={home.type}> Manage Tours</Text>
                                  </View>
                                  <Text style={home.description}> Create and manage your tours</Text>
                                </View>
                              </LinearGradient>
                              <View>
                                <View style={{height: 5, flex: 1, backgroundColor: '#2C313E', marginTop: -2.5}}></View>
                              </View>
                            </View>
                          </TouchableWithoutFeedback> :
                          <View style={{flex: 1, flexDirection: 'row'}} onPress={() => this.setState({option: 4})}>
                            <View style={{width: 5, height: 66, backgroundColor: '#2C313E'}}></View>
                            <View style={{justifyContent: 'center', marginTop: -2.5}}>
                              <View style={home.tab_content}>
                                <TouchableOpacity style={home.tab_button}>
                                  <Image style={home.tab_buttonImg} source={require('@nativeRes/images/btn-add.png')}/>
                                </TouchableOpacity>
                                <Text style={home.type}> Manage Tours</Text>
                              </View>
                              <Text style={home.description}> Create and manage your tours</Text>
                            </View>
                          </View>
                        }
                      </View>
                    </View>
                  </View>
                </View>
            )
        }
        else{
            return(
                  <View style={home.body_main}>
                    <Text style={home.welcom}>Welcome to THE<Text style={home.ticket}>TICKET</Text>FAIRY</Text>
                    <Text style={home.text_center}>What would you like to do today, {displayName}?</Text>
                    <View style={[home.accordion]}>
                      <View style={{borderRadius:5, overflow: 'hidden',}}>
                        <LinearGradient colors={['#1DCFE3', '#2B6BFF']}
                                        style={[home.tab_content_resphones,{borderTopLeftRadius:5, borderTopRightRadius:5}]}>
                          <TouchableWithoutFeedback onPress={() =>{
                            this.state.option != 1 ?
                              this.setState({option: 1}):this.goToBrands()
                          }}>
                            <View style={{justifyContent: 'center', marginTop: -2.5}}>
                              <View style={[home.tab_content,{marginTop:10}]}>
                                <TouchableOpacity style={home.tab_button}>
                                  <Image style={home.tab_buttonImg} source={require('@nativeRes/images/btn-add.png')}/>
                                </TouchableOpacity>
                                <Text style={home.type}>Manage brands</Text>
                              </View>
                              <Text style={[home.description,{marginBottom:10}]}> Create and manage your brands</Text>
                            </View>
                          </TouchableWithoutFeedback>
                          {this.state.option == 1 &&
                            <View style={[home.tab_icon,{flex:0}]}>
                              <Image style={[home.tav_icon_img,{height:190, marginBottom:50}]} source={require('@nativeRes/images/icon-main-brand.png')} />
                            </View>
                          }
                        </LinearGradient>


                        <LinearGradient colors={['#ffaf4d', '#ff4c67']} style={[home.tab_content_resphones]}>
                          {this.state.option == 0 &&
                            <View style={[home.tab_icon, {flex: 0}]}>
                              <Image style={[home.tav_icon_img,{height:190, marginBottom:50}]} source={require('@nativeRes/images/icon-main-event.png')}/>
                            </View>
                          }
                          <TouchableWithoutFeedback onPress={() =>{
                            this.state.option == 0 ?
                              this.goToEvents():
                              this.setState({option: 0})
                          }}>
                            <View style={{justifyContent: 'center', flex: 0, marginBottom:10}}>
                              <View style={home.tab_content}>
                                <TouchableOpacity style={home.tab_button} onPress={() => this.goToEventNew()}>
                                  <Image style={home.tab_buttonImg} source={require('@nativeRes/images/btn-add.png')}/>
                                </TouchableOpacity>
                                <Text style={home.type}> Manage Events</Text>
                              </View>
                              <Text style={home.description}> Create and manage your events</Text>
                            </View>
                          </TouchableWithoutFeedback>

                        </LinearGradient>
                      </View>
                    </View>

                  </View>
            )
        }
    }
}

// export default HomePage;
export default connect(
    (state) => {
        const u = state.auth.get('user')
        return {
            user: u ? u.toJS() : null
        }
    },{replace: routeActions.replace})(HomePage)
