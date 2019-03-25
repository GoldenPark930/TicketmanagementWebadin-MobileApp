import React from 'react'
import _ from 'lodash'

export default class InfluencerPerformance extends React.Component {
  render() {
    const {event, influencers} = this.props
    const currency = getCurrencySymbol(event)

    const countBuyers = influencers.referrers ? influencers.referrers.length : 0
    let revenue_generated = 0
    let refunds_due = 0
    let total_ticket_revenue = 0
    let cost = 0
    let percentage_revenue_referred = 0
    let referral_roi = 0
    let rebate_percentage = 0

    if (influencers.statistics) {
      revenue_generated = influencers.statistics.revenue_generated
      refunds_due = influencers.statistics.refunds_due
      total_ticket_revenue = influencers.statistics.total_ticket_revenue

      cost = revenue_generated != 0 ? (refunds_due / revenue_generated) * 100 : 0
      percentage_revenue_referred = total_ticket_revenue != 0 ? (revenue_generated / total_ticket_revenue) * 100 : 0
      referral_roi = refunds_due != 0 ? (revenue_generated / refunds_due) : 0
      rebate_percentage = total_ticket_revenue != 0 ? (refunds_due / total_ticket_revenue) * 100 : 0      
    }

    return (
      <div className="influencers_container">
        <h3 className="heading_style">Referral Performance</h3>
        <div className="referral_cards clearfix">
          <div className="clearfix col-12 boxes_holder">
            <div className="ref_card24 col-12">
              <div className="ref_card_content">
                <div className="icon ref-icon_small referral-icon-1"><img src={asset('/assets/resources/images/event/influencers/ref_icon_1.svg')} /></div>
                <span className="big_text">{percentage_revenue_referred.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                <span className="grey_text">of total revenue referred by ticket buyers</span>
              </div>
            </div>
            <div className="spacer"/>
            <div className="ref_card49 col-12">
              <div className="ref_card_content">
                <div className="icon referral-icon-1">
                  <img src={asset('/assets/resources/images/event/influencers/ref_icon_2.svg')} />
                </div>
                <span className="big_text">
                  {currency}{revenue_generated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="grey_text">
                  revenue referred by ticket buyers
                </span>
                <div className="clearfix">
                  <div className="ref_card_half">
                    <span className="semi_big_text">
                      {currency}{refunds_due.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="grey_text">
                      in rebates
                    </span>
                  </div>
                  <div className="spacer"/>
                  <div className="ref_card_half">
                    <span className="semi_big_text">
                      {cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </span>
                    <span className="grey_text">
                      effective marketing cost
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="spacer"/>
            <div className="ref_card24 col-12">
              <div className="ref_card_content">
                <div className="icon ref-icon_small referral-icon-1"><img src={asset('/assets/resources/images/event/influencers/ref_icon_3.svg')} /></div>
                <span className="big_text">{currency}{referral_roi.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="grey_text">referred revenue per <strong>{currency}1</strong> in rebates</span>
              </div>
            </div>
          </div>
          <div className="clearfix col-12 boxes_holder">
            <div className="ref_card_half col-12">
              <div className="ref_card_content">
                <div className="icon ref-icon_big referral-icon-1"><img src={asset('/assets/resources/images/event/influencers/ref_icon_4.svg')} /></div>
              </div>
              <div className="ref_card_half">
                <div className="ref_card_content">
                  <span className="big_text">{currency}{refunds_due.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="grey_text">in rebates makes up</span>
                </div>
              </div>
              <div className="spacer"/>
              <div className="ref_card_half">
                <div className="ref_card_content">
                  <span className="big_text">{rebate_percentage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                  <span className="grey_text">of your total revenue</span>
                </div>
              </div>
            </div>
            <div className="spacer"/>
            <div className="ref_card_half col-12">
              <div className="ref_card_content">
                <div className="icon ref-icon_big referral-icon-1"><img src={asset('/assets/resources/images/event/influencers/ref_icon_5.svg')} /></div>
              </div>
              <div className="ref_card_half">
                <div className="ref_card_content">
                  <span className="big_text">{countBuyers}</span>
                  <span className="grey_text">ticket buyers generated</span>
                </div>
              </div>
              <div className="spacer"/>
              <div className="ref_card_half">
                <div className="ref_card_content">
                  <span className="big_text">{percentage_revenue_referred.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                  <span className="grey_text">of your ticket revenue.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}