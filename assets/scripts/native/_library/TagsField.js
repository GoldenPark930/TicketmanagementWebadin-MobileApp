import React from 'react'
import TagInput from 'react-native-tag-input'
import {View} from 'react-native'

export default class TagsField extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            value: props.value,
            text: ''
        }
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            value: newProps.value
        }
    }

    onChange(tags) {
        this.setState({
            value: tags
        })
        if(this.props.onChange) {
            this.props.onChange(tags)

        }
    }
    onChangeText = (text) => {
        this.setState({ text });

        const lastTyped = text.charAt(text.length - 1);
        const parseWhen = [',', ' ', ';', '\n'];

        if (parseWhen.indexOf(lastTyped) > -1) {
            this.setState({
                value: [...this.state.value, this.state.text],
                text: "",
            });
        }
    }
    // autoSizing({addTag, ...props}) {
    //     let {onChange, value, ...other} = props
    //     return (
    //         <AutosizeInput type='text' className='react-tagsinput-input' onChange={onChange} value={value} {...other} />
    //     )
    // }

    render() {
        const {value} = this.state
        return (
            <View style={{padding:5, borderWidth:1, borderColor:'#47516d', paddingLeft:10, paddingRight:10}}>
                <TagInput
                    placeholder='Add a tag'
                    labelExtractor={(value) => value}
                    value={value || []} onChange={(e)=>this.onChange(e)} tagColor='#373E4C'
                    onChangeText={this.onChangeText}
                    text={this.state.text}
                    tagContainerStyle={{borderWidth:1, backgroundColor: '#24282f', height: 35}}
                    tagTextStyle = {{color: '#E9E9E9', fontsize: 13}} tagTextColor='#E9E9E9'/>
            </View>
        )
    }
}

