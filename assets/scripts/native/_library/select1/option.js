import React, {Component} from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableWithoutFeedback
} from 'react-native'
import PropTypes from 'prop-types';
export default class Option extends Component {
	static propTypes = {
		style: View.propTypes.style,
		styleText: Text.propTypes.style,
		children: PropTypes.string.isRequired
	};

	render() {
    const { style, styleText} = this.props
    return (
		<View style={[styles.item, style]}>
			<Text style = {[styles.optionText, styleText]}> {this.props.children} </Text>
		</View>
    )
  }
}

var styles = StyleSheet.create({
	item : {
		padding : 0,
		flexDirection:'row'
	},
	optionText  : {
		fontSize : 14
	}
})
