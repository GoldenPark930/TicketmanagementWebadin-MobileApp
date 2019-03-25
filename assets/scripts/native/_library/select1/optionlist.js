import React, {Component} from 'react'
import {
	StyleSheet,
	ScrollView,
	View,
	TouchableWithoutFeedback,
    Text
} from 'react-native'
import PropTypes from 'prop-types';
export default class OptionList extends Component {
	static defaultProps = {
	  onSelect: () => {}
	};
	static propTypes = {
		style: View.propTypes.style,
	 	onSelect : PropTypes.func,
	};
	render() {
		const {style, children, onSelect, selectedStyle, selected} = this.props
		const renderedItems = React.Children.map(children, (item, key) =>
      <TouchableWithoutFeedback key={key} style={{borderWidth : 0}} onPress={() => onSelect(item.props.children, item.props.value) }>
        <View style = {[{borderWidth : 0,}, (item.props.value === selected)? selectedStyle : null]}>
			{item}
        </View>
      </TouchableWithoutFeedback>
    )
		return (
			<View style = {[styles.scrollView, style]}>
				<ScrollView
					automaticallyAdjustContentInsets={false}
					bounces={false} >
				 {renderedItems}
				</ScrollView>
			</View>
		)
	}
}

var styles = StyleSheet.create({
	scrollView : {
		flex : 1,
		width : 720,
		height:20,
		borderRadius : 3,
	},
})

