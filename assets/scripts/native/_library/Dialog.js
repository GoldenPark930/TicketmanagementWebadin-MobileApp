import React from 'react'
import {Modal, TouchableWithoutFeedback, View, Text, ScrollView} from 'react-native'
import {commonStyle, styleConstant} from '../../native/styles'
import {MenuProvider} from 'react-native-popup-menu'
import PropTypes from 'prop-types';
export default class Dialog extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        isOpen: PropTypes.bool,
        onClose: PropTypes.func,
        footer: PropTypes.element,
    }

    render() {
        const {isOpen, onClose, title, children, footer} = this.props
        return (
            <Modal
                animationType='fade'
                transparent={true}
                visible={isOpen}
                swipeToClose={false}
                swipeArea={0}
                onRequestClose={onClose} >
                <MenuProvider>
                    <TouchableWithoutFeedback onPress={onClose}>
                        <View style={commonStyle.modalContainer}>
                            <View style={{flexDirection: 'row', }}>
                                <View style={{flex: 1}}/>
                                <TouchableWithoutFeedback>
                                    <View style={[commonStyle.modalContent, commonStyle.shadow]}>
                                        {title && <View style={commonStyle.modalHeaderContainer}><Text
                                            style={commonStyle.modalTitleLabel}>{title}</Text></View>}
                                        <View style={commonStyle.modalBodyContainer}>{children}</View>
                                        {footer && <View style={commonStyle.modalFooterContainer}>{footer}</View>}
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{flex: 1}}/>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </MenuProvider>
            </Modal>
        )
    }
}
