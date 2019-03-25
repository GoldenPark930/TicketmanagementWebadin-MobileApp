import _ from 'lodash'
import React from 'react'
import LazyLoad from 'react-lazy-load'
import onClickOutside from 'react-onclickoutside'
import moment from 'moment-timezone'
import {IS_FOUND} from '../../_library/JSONDatatable'
import Address from '../../_library/Address'
import DateLabel from '../../_library/DateLabel'
import { Link, DirectLink, Element , Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

class EventSwitcher extends React.Component {
  static propType = {
    currentEvent: React.PropTypes.object,
    events: React.PropTypes.arrayOf(React.PropTypes.object),
    onClickEvent: React.PropTypes.func,
    active: React.PropTypes.bool,
  }

  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
      search: '',
    }
  }

  onClickSwitcher() {
    if(!this.props.active) return
    if(!this.state.expanded){
      this.scrollToWithContainer()
    }
    this.setState({
      expanded: !this.state.expanded
    })
  }

  scrollToWithContainer() {
    let goToContainer = new Promise((resolve, reject) => {
      Events.scrollEvent.register('end', () => {
        resolve()
        Events.scrollEvent.remove('end')
      })
      scroller.scrollTo('scroll-container', {
        duration: 100,
        delay: 0,
        smooth: 'easeInOutQuart'
      })
    })
    goToContainer.then(() =>  {
      scroller.scrollTo('scroll-to-element', {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart',
        containerId: 'scroll-container'
      })
    })
  }

  onClickEvent(event) {
    if(this.props.onClickEvent) {
      this.props.onClickEvent(event)
    }
    this.setState({
      expanded: false
    })
  }

  onSearch(e){
    let that = this
    this.setState({search: e.target.value}, () => {
      setTimeout(() => {
        scroller.scrollTo(that.isCurrentInFilters ? 'scroll-to-element' : 'child0', {
          duration: 800,
          delay: 0,
          smooth: 'easeInOutQuart',
          containerId: 'scroll-container'
        })  
      }, 100)      
    })
  }

  handleClickOutside(e) {
    this.setState({
      expanded: false
    })
  } 

  render() {
    const {events, currentEvent, active} = this.props
    const {expanded, search} = this.state

    // get search result
    let events_filtered = events
    if(search.length > 0){
      events_filtered = _.filter(events, (event, index)=>{
        let addr = !!event ? event.venue : null
        let displayName = event.displayName
        let found = 0, keyword = search.toLowerCase()
        found += IS_FOUND(displayName, keyword)
        if(addr){
          found += IS_FOUND(addr.displayName, keyword)
          found += IS_FOUND(addr.city, keyword)
        }
        return found
      })
    }

    // current event
    let addr = !!currentEvent ? currentEvent.venue : null
    let startDate_utc = moment.utc(new Date(currentEvent.startDate))
    let content_currentEvent=(
      <div>
        <div>{currentEvent.displayName}</div>
        {!!addr && 
        <div className="event-address">
          <img src={asset('/assets/resources/images/icon-location.png')}/>
          <Address type="simple" className="address-form" {...addr} />
        </div>
        }
        <div className="event-startDate">
          <img src={asset('/assets/resources/images/icon-clock.png')}/>
          <DateLabel className="starttime" value={startDate_utc} format="LLL" />
        </div>
      </div>
    )

    let that = this
    this.isCurrentInFilters = false
    // events list
    let content_events = _.map(events_filtered, (event, index) => {
      let scrollElement = event.id == currentEvent.id ? 'scroll-to-element': 'child' + index
      if (event.id == currentEvent.id) {
        that.isCurrentInFilters = true
      }
      let addr = !!event ? event.venue : null
      let startDate_utc = moment.utc(new Date(event.startDate))
      let content_event = (
        <div className="events-select2-event">
          <div className="event-image-container">
            {!!event.imageURL && 
              <LazyLoad width={40} height={40} once>
                <img src={event.imageURL} className="event-image LazyLoadImg" />
              </LazyLoad>
            }
            {!event.imageURL && <img src={asset('/assets/resources/images/no_img.png')} className="event-image" />}
          </div>
          <div className="event-content">
            <div className="event-content-name">{event.displayName}</div>
            {(event.id == currentEvent.id) && 
              <img className="event-content-tick" src={asset('/assets/resources/images/green_tick.png')}/>
            }                         
            <div className="event-address">
              <img src={asset('/assets/resources/images/icon-location.png')}/>
              {!!addr && 
                <Address type="simple" className="address-form" {...addr} />
              }
            </div>
            <div className="event-startDate">
              <img src={asset('/assets/resources/images/icon-clock.png')}/>
              <DateLabel className="starttime" value={startDate_utc} format="LLL" />
            </div>
          </div>
        </div>
      )

      return (
        <Element key={index} className="select2-option-container" name={scrollElement}>
          <div className="select2-option" onClick={this.onClickEvent.bind(this, event)}>
            { content_event }
          </div>
        </Element>
      )
    })
    return (
      <div className="events-select2">
        <div className="select2">
          <div className="select2-value" onClick={this.onClickSwitcher.bind(this)}>
            { content_currentEvent }
            <div className='iconStatus'>
              { active && <i className="fa fa-exchange" aria-hidden="true"></i> }
              { !active && <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i> }
            </div>
          </div>
          <div className="select2-options-container" className={'select2-options-container' + (expanded?' expanded':' collapsed')}>
            <div className="select2-options-search">
              <input className="form-control" onChange={::this.onSearch}/>
              <i className="fa fa-search"/>
            </div>
            <Element name="select2-options-list" className="select2-options-list" id="scroll-container">
            { content_events }
            </Element>
          </div>
        </div>
      </div>
    )
  }
}

export default onClickOutside(EventSwitcher)