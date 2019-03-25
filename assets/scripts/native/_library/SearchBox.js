import React from 'react'
import {View, TextInput} from 'react-native'
import {commonStyle} from '../../native/styles'
import Button from './Button'
import TagInput from 'react-native-tag-input'
import PropTypes from 'prop-types'

export default class SearchBox extends React.Component {

  static propTypes = {
    onSearch: PropTypes.func,
    align: PropTypes.string
  }
  constructor(props) {
    super(props)
    this.state = {
      value: props.taginput ? [] : '',
      clear: false,
      text: ''
    }
  }

  componentDidMount() {

  }
  onChangeText = (text) => {
    this.setState({ text });

    const lastTyped = text.charAt(text.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    if (parseWhen.indexOf(lastTyped) > -1) {
      this.setState({
        value: [...this.state.value, this.state.text],
        text: "",
        clear: false,
      });
    }
  }
  onChange(tags) {
    this.setState({
      clear: false,
      value: tags
    })
  }

  onChangeInput = (text) => {
    this.setState({
      clear: false,
      value:text
    })
  }

  onFocusInput = () => {
    this.setState({
      clear: false
    })
  }
  onPressSearch = () => {
    this.setState({
      clear: true
    })

    if(this.props.onSearch) this.props.onSearch(this.state.value)
  }
  labelExtractor = (tag) => tag;
  onPressClear = () => {
    this.setState({
      value: ''
    })

    if(this.props.onSearch) this.props.onSearch('')

    this._input.focus()
  }
  render() {
    const {value, clear} = this.state
    const {align, taginput} = this.props
    return (
      <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: align ? align : 'flex-end'}}>
        <TextInput ref={(ref) => this._input = ref} style={commonStyle.textInputNormal} value={value} onSubmitEditing={clear ? this.onPressClear:this.onPressSearch} onChangeText={this.onChangeInput} onFocus={this.onFocusInput}/>
        {clear ? <Button title='Clear' size='small' style={commonStyle.buttonSecondary} onPress={this.onPressClear}/> : <Button title='Search' size='small' style={[commonStyle.buttonSecondary, {height:37}]} onPress={this.onPressSearch}/>}
      </View>
    )
  }
}
