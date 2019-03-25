import React from 'react'
import _ from 'lodash'
import NumberAnimation from '../../_library/NumberAnimation'

export default class InfluencerTiers extends React.Component {
  render() {
    const {statistics, isLoading, event} = this.props
    let tiers = []
    let classname = 'tier-slice'
    let number = 0

    if (statistics && statistics.referral_tiers) {
      tiers = _.map(statistics.referral_tiers, (el) => {return el} )
    } else{
      tiers = [
        {sales: event.referralTier1Sales, percentage: event.referralTier1Percentage},
        {sales: event.referralTier2Sales, percentage: event.referralTier2Percentage},
        {sales: event.referralTier3Sales, percentage: event.referralTier3Percentage},
      ]
    }
    let classNumberAnimation = isLoading ? 'animation-container' : ''
    
    let rows_tiers = _.map(tiers, (value, index) => {
      return (
        <div key={index} className={classname}>
          <div className={`influencers-tier influencers-tier-${number++}`}>
            <div className="tier-left">
              <div className={classNumberAnimation}>
                {value.sales}
              </div>
            </div>
            <div className="tier-right">
              <div className="tier-tickets">
                Tickets <img src={asset('/assets/resources/images/influencers-star.png')}/>
              </div>
              <div className="tier-percentage">
                <div className={classNumberAnimation}>
                  {value.percentage}%
                </div>
              </div>
              <div className="tier-rebate color_rebate">
                Rebate
              </div>
            </div>
          </div>
        </div>
      )
    })

    return (<div>
        <h3 className="heading_style">
          Referral Tiers
        </h3>
        <div className = "row">
          {rows_tiers}
        </div>
      </div>
    )
  }
}