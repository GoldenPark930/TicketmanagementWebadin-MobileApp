import React from 'react'
import {
    Text,
    View,
    ActivityIndicator
} from 'react-native'
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';
import animationData from './LoadingBarAni.js'

class LoadingBar extends React.Component {
    static propTypes = {
        title: PropTypes.string
    }
    constructor(props) {
        super(props)
    }
    componentDidMount() {
      this.animation.play();
    }
    render() {
      return (
        <View style={{
          margin:10, backgroundColor:'#393e46', borderRadius:3, padding:25, paddingLeft: 30}}>
          <LottieView
            ref={animation => {
              this.animation = animation;
            }}
            autoPlay
            loop={true}
            style={{width: 200, height:200}}
            source={animationData}
          />
          <Text style={{fontFamily:'OpenSans-Bold',fontSize:12,color:'#E9E9E9', textAlign: 'center'}}>{title || 'Loading...'}</Text>
        </View>
      )
      const {title} = this.props
    }
}export default LoadingBar
