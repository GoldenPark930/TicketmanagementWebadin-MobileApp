import React from 'react'
import TagsInput from 'react-tagsinput'
import AutosizeInput from 'react-input-autosize'
import Button from './Button'
import _ from 'lodash'

export default class SearchBox extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			value: props.value
		}
	}

	componentDidMount() {
		if(this.props.autoFocus)
			this.refs.tag.focus()
	}

	componentWillReceiveProps(newProps) {
		this.state = {
			value: newProps.value
		}
	}

	onChange(tags) {
		if(this.props.onChange) {
			this.props.onChange(tags, this.props.focusAfter, this.props.triggerScroll)
		}
	}
	
	saveTag() {
		this.refs.tag.accept()
		if(this.props.autoFocus)
			this.refs.tag.focus()
	}

	autoSizing({addTag, ...props}) {
		let {onChange, value, ...other} = props
		if(!!this.state.value && this.state.value.length > 0){
			return null
		}
		if(value.length > 30){
			value = value.substring(0, 30)
		}
		return (
			<AutosizeInput type="text" className="react-tagsinput-input" onChange={onChange} value={value} {...other} />
		)
	}

	render() {
		const {value} = this.state
		return (
			<div className='tags-field searchbar find_order'>
				<TagsInput ref='tag' inputProps={{placeholder: ''}} addKeys={[9, 13]} maxTags={1} onlyUnique value={value || []} onChange={::this.onChange} renderInput={::this.autoSizing} />
				<Button className='btn btn-default' onClick={::this.saveTag}>Search</Button>
			</div>
		)
	}
}
