import React from 'react'
import {View, Text, TouchableWithoutFeedback} from 'react-native'
import {commonStyle} from '../../native/styles'
import Icon from 'react-native-vector-icons/FontAwesome'
import Collapsible from 'react-native-collapsible';
import PropTypes from 'prop-types';

export default class Panel extends React.Component{
    static propTypes = {
        title: PropTypes.string,
        style: PropTypes.any,
        icon: PropTypes.string,
        onLayout: PropTypes.any
    }

    constructor(props) {
        super(props)
        this.state = {
          isCollapsible : false
        }
    }

    render() {
        const {title, children, icon, onLayout} = this.props
        return(
            <View onLayout={onLayout} style={[commonStyle.panelContainer,this.props.style]}>
                <TouchableWithoutFeedback onPress={()=>this.setState({isCollapsible: !this.state.isCollapsible})}>
                    <View style={commonStyle.panelTitleContainer}>
                        <Icon name={this.state.isCollapsible ? 'angle-down' : 'angle-up'} size={20} color='#ffffff' style={{marginRight: 10}} />
                        <Icon name={icon} size={15} color='#ffffff' />
                        <Text style={commonStyle.panelTitleLabel}>{title}</Text>
                    </View>
                </TouchableWithoutFeedback>
                <Collapsible collapsed={this.state.isCollapsible} duration={600}>
                    <View style={commonStyle.panelContentContainer}>{children}</View>
                </Collapsible>
            </View>
        )
    }
}
