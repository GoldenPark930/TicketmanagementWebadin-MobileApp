import React, {Component} from 'react'
import PropTypes from 'prop-types';
import {View,StatusBar,Dimensions} from 'react-native'
import {connect} from 'react-redux'
import Drawer from 'react-native-drawer'
import {routeActions} from 'react-router-redux'
import {MenuContext} from 'react-native-popup-menu'
import {Sidebar, Header, Footer} from './_theme'

import DeviceInfo from 'react-native-device-info'
import MenuProvider from "react-native-popup-menu/src/MenuProvider";

const window = Dimensions.get('window')
var drawerStyles = {
    drawer: {
        backgroundColor:'#2C313E',
    },
    main: {paddingRight: 0},
}

class MainPage extends Component {
    static contextTypes = {store: PropTypes.object.isRequired}

    state = {
        drawerOpen: false,
        drawerDisabled: false,
    };
    openDrawer() {
        if (this.state.drawerOpen) {
            this._drawer.close()
            this.setState({drawerOpen: false})
        } else {
            this._drawer.open()
            setTimeout(
                () => this.setState({drawerOpen: true}),
                500
            )
        }
    };
    componentWillReceiveProps(props){
        if(props.location.pathname == '/signout')
            this.setState({drawerOpen: false})
    }

    onOpenDrawerOffset(viewport) {
        return
    }

    render() {
        return (
            <MenuProvider>
                {this.props.location.pathname != '/signin' ?
                    <View style={{flex: 1, backgroundColor:'#4c5156'}}>
                        <StatusBar
                          hidden={true}
                        />
                        <Header onOpenDrawer={() => this.openDrawer()} onCloseDrawer={() => this._drawer.close()}/>
                        <Drawer
                            ref={(ref) => this._drawer = ref}
                          type='overlay'
                          content={<Sidebar onClose={() => this._drawer.close()}/>}
                          tapToClose={true}
                          openDrawerOffset={DeviceInfo.isTablet() ? 0.8 : 0.0}
                          panCloseMask={0}
                          closedDrawerOffset={-3}
                          captureGestures={true}
                          negotiatePan={false}
                          acceptTap={true}
                          onOpen={() => {
                            this.setState({drawerOpen: true})
                          }}
                          onClose={() => {
                            this.setState({drawerOpen: false})
                          }}
                          styles={drawerStyles}
                        >
                            <View style={{flex: 1,}}>
                              {this.props.children}
                            </View>
                        </Drawer>
                    </View>
                :this.props.children}
            </MenuProvider>
        )
    }
}
export default connect(state => ({}), {push: routeActions.replace, replace: routeActions.replace})(MainPage)
