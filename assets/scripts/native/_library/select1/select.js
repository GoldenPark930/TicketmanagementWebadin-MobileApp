import React, {Component} 	from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableWithoutFeedback,
	Modal,
	Dimensions
} from 'react-native'

import OptionList from './optionlist'
import Indicator from './indicator'
import PropTypes from 'prop-types';
const window = Dimensions.get('window')


export default class Select extends Component {
	static defaultProps = {
	  defaultText : 'Click To Select',
	  onSelect  : () => {},
		transparent : false,
		animationType : 'none',
		indicator : 'none',
		indicatorColor: 'black',
		indicatorSize: 10
	}
	static propTypes = {
		style : View.propTypes.style,
		defaultText : PropTypes.string,
		onSelect : PropTypes.func,
		textStyle : Text.propTypes.style,
		backdropStyle : View.propTypes.style,
		optionListStyle : View.propTypes.style,
		indicator : PropTypes.string,
		indicatorColor : PropTypes.string,
		indicatorSize : PropTypes.number,
		indicatorStyle : View.propTypes.style
	}

	constructor(props) {
	  super(props)
	  this.selected = this.props.selected
	  this.state = {
	  	modalVisible : false, 
		  defaultText : this.props.defaultText, 
		  selected : this.props.selected,
		}
	}

	onSelect(label, value) {
		this.props.onSelect(value)
		this.setState({
			modalVisible : false,
			defaultText : label
		})
	}

	onClose() {
		this.setState({
			modalVisible: false
		})
	}

	render() {
		let {style, defaultText, textStyle, backdropStyle,
			optionListStyle, transparent, animationType,
			indicator, indicatorColor, indicatorSize, indicatorStyle, 
			selectedStyle, selected} = this.props

		return (
			<View>
				<TouchableWithoutFeedback onPress = {this.onPress.bind(this)}>
					<View style = {[styles.selectBox, style]}>
						<View style={styles.selectBoxContent}>
							<Text style = {textStyle}>{this.state.defaultText}</Text>
							<Indicator direction={indicator} color={indicatorColor} size={indicatorSize} style={indicatorStyle} />
						</View>
					</View>
				</TouchableWithoutFeedback>
				{this.state.modalVisible ?
				 <TouchableWithoutFeedback onPress ={this.onModalPress.bind(this)}>
					<View style={[backdropStyle]}>
						<OptionList
							onSelect = {this.onSelect.bind(this)}
							selectedStyle = {selectedStyle}
							selected = {selected}
							style = {[optionListStyle]}>
							{this.props.children}
						</OptionList>
					</View>
				 </TouchableWithoutFeedback>:null}
			</View>
		)
	}
	/*
		Fired when user clicks the button
	 */
	onPress() {
		this.setState({
			modalVisible : !this.state.modalVisible
		})
	}

	/*
	 Fires when user clicks on modal. primarily used to close
	 the select box
	 */

	onModalPress() {
		this.setState({
			modalVisible : false
		})
	}

	setSelectedText(text){
		this.setState({
			defaultText: text
		})
	}
}

var styles = StyleSheet.create({
	selectBox : {
		paddingTop : 15,
		paddingBottom:10,
		borderColor : 'black'
	},
	selectBoxContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	modalOverlay : {
		flex : 1,
		position:'absolute',
		left:0,
		top:0,
	}
})
