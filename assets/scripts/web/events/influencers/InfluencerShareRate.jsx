import React from 'react'
import _ from 'lodash'
import NumberAnimation from '../../_library/NumberAnimation'
import ReactTransitions from 'react-transitions'

export default class InfluencerShareRate extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {statistics, isLoading} = this.props

    let number = 0
    let rate = 0
    let classname = 'col-xs-12'
    let imgUser = 'user_cooler'
    if (statistics) {
      number = _.size(statistics.referral_tiers)
      if(number > 0){
        let width = 12 / number
        classname = `col-xs-${width}`
      }
      rate = !!statistics.share_rate ? parseInt(statistics.share_rate) : 0
      if(rate < 20)
        imgUser = 'user_cooler'
      else if(rate < 40)
        imgUser = 'user_orange'
      else if(rate < 50)
        imgUser = 'user_red'
      else
        imgUser = 'user_hot'      
    }
    
    return (
      <div className="influencers-shareRate">
        <div className="shareRate_background">
          <div className="worldmap">
            <div className="result_img">
              <div className="shareRate_user">
                <ReactTransitions
                  transition="scale-down-center-scale-up-center"
                  width={ 300 }
                  height={ 120 }
                >
                  <img ref='shareRate_user' key={`shareRate_user${imgUser}`} src={asset('/assets/resources/images/event/influencers/sharerate/' + imgUser + '.png')}/>
                </ReactTransitions>
              </div>
              <div className="shareRate_engagement">
                <div>
                  INFLUENCER ENGAGEMENT
                </div>
              </div>
            </div>
            <div className="result_value">
              <div className="shareRate">
                <div className="shareRate_percentage">
                  <div className="percentage">
                    <NumberAnimation 
                      isLoading={isLoading}
                      target={rate}
                      subfix={'%'}
                      linear={false}
                    />
                  </div>
                </div>
              </div>
              <div className="shareRate_current">
                <div className={'inner_text ' + imgUser}>
                  <i className="fa fa-circle-o"/>&nbsp;CURRENT SHARE RATE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}