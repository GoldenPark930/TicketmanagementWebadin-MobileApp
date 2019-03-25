import React from 'react'
import TagsInput from 'react-tagsinput'
import AutosizeInput from 'react-input-autosize'

export default class TagsField extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			value: props.value
		}
		this.pending = ''
	}

	componentWillReceiveProps(newProps) {
		this.state = {
			value: newProps.value
		}
		this.pending = ''
	}

	completeWriting(){
		if(this.pending == '')
			return this.state.value
		let pending = this.pending
		this.refs.tag.accept()
		if(!!this.state.value)
			this.state.value.push(pending)
		else
			this.state.value = [pending]
		return this.state.value
	}

	onChange(tags) {
		this.pending = ''
		if(!this.props.controlOutside){
			this.setState({
				value: tags
			}) 
		}
		if(this.props.onChange) {
			this.props.onChange(tags)
		}
	}

	onPaste(data){
		this.pending = ''
		let filtered = data.replace(/\r?\n|\r/g, ' ')
		return filtered.split(' ').map(d => d.trim())
	}

	autoSizing({addTag, ...props}) {
		this.pending = props.value		
		let {onChange, value, ...other} = props
		return (
			<AutosizeInput type="text" className="react-tagsinput-input" onChange={onChange} value={value} {...other} />
		)
	}

	render() {
		const {value} = this.state
		const {isPromotion} = this.props
		return (
			<div className="tags-field">
				{isPromotion ? 
				<TagsInput ref='tag' inputProps={{placeholder: 'Add a code'}} addOnBlur={true} addOnPaste={true} pasteSplit={::this.onPaste} addKeys={[9, 13, 32]} onlyUnique value={value || []} onChange={::this.onChange} renderInput={::this.autoSizing} />
				: <TagsInput ref='tag' value={value || []} onChange={::this.onChange} renderInput={::this.autoSizing} />
				}
			</div>
			)
	}
}
