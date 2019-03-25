import _ from 'lodash'
import moment from 'moment-timezone'
import React from 'react'
import {makeURL} from '../../_common/core/http'
import {HTTP_INIT, HTTP_LOADING, HTTP_LOADING_SUCCESSED, HTTP_LOADING_FAILED, CACHE_SIZE} from '../../_common/core/http' 
import LoadingBar from './LoadingBar'
import EmptyBar from './EmptyBar'
import LazyLoad from 'react-lazy-load'
import PerfectScrollbar from 'react-perfect-scrollbar'

export const TYPE_EVENT = 'event'
export const TYPE_BRAND = 'brand'
export const SECTION_LIKES = 1
export const SECTION_MUSIC = 2
export const SECTION_MUSICSTREAMING = 3

const COUNT_IN_LOADING = 100
const COUNT_MAX = 5000
const COUNT_MOBILE_DIVIDE = 10

export class OboeAudience extends React.Component{
	static propType = {
		// required
		type: React.PropTypes.number.isRequired, // TYPE_FROM_URL('url') or TYPE_FROM_ARRAY('array')		
		data: React.PropTypes.object.isRequired, // {url, node} or []
	}

	constructor(props) {
		super(props)
		
		this.tmp = []
		this.unMounted = true

		this.state = {
			http_status: HTTP_INIT, 
			http_error: null,

      rows: [], 
      totalCount: 0,

      category: '_all',
      category_show_dropdown: false,

      width: $(window).width()
		}
	}

	componentDidMount() {
    window.addEventListener('resize', this.updateDimensions.bind(this))

		this.unMounted = false
		const {type, data} = this.props
    
    const self = this		
		let {url, param, node} = data
				
    oboe({
      url: makeURL(url, param),
      method: 'GET',
      headers: isDemoAccount() ? null : {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      withCredentials: true
    }).node(node, (record, pathArray) => {
      if(!self.unMounted){
        self.tmp.push(record)
        let cacheSize = CACHE_SIZE
        if(self.tmp.length === cacheSize){
          self.addToRow(self.tmp, HTTP_LOADING, null)
        }
      }
    }).done(() => {
      if(!self.unMounted)
        self.addToRow(null, HTTP_LOADING_SUCCESSED, null)
    }).fail((errorReport) => {
      if(!self.unMounted)
        self.addToRow(null, HTTP_LOADING_FAILED, errorReport)
    })
	}

	componentWillUnmount() {
    this.unMounted = true
    this.tmp = []
    window.removeEventListener('resize', this.updateDimensions.bind(this))
  }

  updateDimensions(){
    if(this.unMounted)
      return
		this.setState({width: $(window).width()})
  }
  
  addToRow(cached, http_status, http_error){
    if(this.unMounted)
      return
    let {rows, totalCount} = this.state

    let tmp = !!cached ? cached : this.tmp
    totalCount += tmp.length
    tmp = this.handleDownloadFilter(tmp)
    rows = rows.concat(tmp)

    this.tmp = []
    if(http_status == HTTP_LOADING_SUCCESSED || http_status == HTTP_LOADING_FAILED){
			this.forceLazyload()
		}
		this.setState({
			http_status: http_status,
			http_error: http_error,

      rows: rows,
      totalCount: totalCount
		})
	}
  
  handleDownloadFilter = (rows) => {
    const {section} = this.props
    switch(section){
      case SECTION_LIKES:
        const SHOW_LIKES_COUNT_THRESHOLD = 100 
        const LIKES_FILTER = ['Musician/Band', 'Musician', 'Record Label', 'Music Genre']
        return _.filter(rows, (row)=>{
          return parseInt(row.count) >= SHOW_LIKES_COUNT_THRESHOLD 
            && LIKES_FILTER.indexOf(row.category) == -1
            && row.category
        })
        break
      case SECTION_MUSIC:
        const SHOW_MUSIC_COUNT_THRESHOLD = 40 
        const LIKES_ALLOWED_CATEGORY = ['Musician/Band', 'Musician', 'Record Label', 'Music Genre']
        return _.filter(rows, (row)=>{
          return parseInt(row.count) >= SHOW_MUSIC_COUNT_THRESHOLD 
            && LIKES_ALLOWED_CATEGORY.indexOf(row.category) != -1
            && row.category
        })
        break
      case SECTION_MUSICSTREAMING:
        const SHOW_MUSICSTREAMING_COUNT_THRESHOLD = 50
        return _.filter(rows, (row)=>{
          return parseInt(row.count) >= SHOW_MUSICSTREAMING_COUNT_THRESHOLD
        })
        break
      default:
        return rows
        break
    }    
  }

  forceLazyload = () => {
		setTimeout(()=>{
      $('html, body').animate({
        scrollTop: $(window).scrollTop() + 1
    })
    }, 100)
  }

  handleClickCategoryTitle = () => {
    const {http_status} = this.state
    if(isMobileDevice() && http_status == HTTP_LOADING)
      return
    this.setState({category_show_dropdown: !this.state.category_show_dropdown})
  }

  handleClickCategory = (value) => {
    const {http_status} = this.state
    if(isMobileDevice() && http_status == HTTP_LOADING)
      return
    this.setState({category: value, category_show_dropdown: false})
    this.forceLazyload()
  }

  getContent_category = () => {
    const {rows, category, category_show_dropdown} = this.state
    const {http_status} = this.state

    // get category list
    let current_categoryTitle = 'All'
    let category_lists = []
    if(!(isMobileDevice() && http_status == HTTP_LOADING)){
      category_lists = _.map(_.groupBy(rows, x=>x.category), (value, key)=>{
        if(category == key)
          current_categoryTitle = key
        return {
          key: key,
          title: key,
          count: value.length
        }
      })
    }    
    category_lists.push({
      key: '_all',
      title: 'All',
      count: rows.length
    })
    if(!(isMobileDevice() && http_status == HTTP_LOADING))
      category_lists = _.orderBy(category_lists, cat=>cat.count, 'desc')

    let categories = _.map(category_lists, (cat, index)=>{
      let title = cat.title
      title = title.replace(/\//g, ' / ')              
      return (
        <div key={index} className={'category' + (cat.key == category ? ' selected' : '')} onClick={() => this.handleClickCategory(cat.key)}>
          <span>
            {title}
          </span>
        </div>
      )
    })
    let content_categories = null
    if(isMobileDevice()){
      let classOpen = category_show_dropdown ? 'open' : ''
      content_categories = (
        <div className="category-dropdown">
          <div className={`title ${classOpen}`} onClick={() => this.handleClickCategoryTitle()}>
            {current_categoryTitle.replace(/\//g, ' / ')}
          </div>
          <div className={`categories ${classOpen}`}>
            {categories}
          </div>
        </div>
      )
    }else{
      content_categories = (<div className="category-sidebar">
        <div className="title">
          Categories
        </div>
        <PerfectScrollbar>
          <div className="categories">
            {categories}
          </div>
        </PerfectScrollbar>
      </div>)
    }
    return (
      <div>
        {content_categories}
        {!isMobileDevice() && 
          <div className="category-title">
            <div className="decoration-row">
              <div className="decoration"/>
              <div className="title">
                {current_categoryTitle}
              </div>
              <div className="decoration"/>
            </div>
          </div>
        }
      </div>
    )
  }

  getContent = () => {
    let {rows, http_status, category} = this.state
    const {limitShowing, section} = this.props
    let content_category = (<div className='div-spacing-20'/>)
    if(section == SECTION_LIKES && rows.length > 0)
      content_category = this.getContent_category()

    let rows_filtered = rows    
    if(limitShowing){      
      let limit = http_status == HTTP_LOADING ? COUNT_IN_LOADING : COUNT_MAX
      if(isMobileDevice())
        limit = limit / COUNT_MOBILE_DIVIDE
      console.log('limitShowing', rows.length, limit)
      rows = rows.slice(0, limit)
    }
    
    rows_filtered = _.orderBy(rows, (row)=>{return parseInt(row.count)}, 'desc')
    if(category != '_all')
      rows_filtered = _.filter(rows_filtered, {'category': category})

    let content_rows = _.map(rows_filtered, function(t, index){
      let v_href = '', v_img = ''
      let v_category = '', v_name = '', v_count = 0, v_fan='Fan'
      switch(section){
        case SECTION_LIKES:
          v_href = 'https://www.facebook.com/' + t.id
          v_img = '//graph.facebook.com/' + t.id + '/picture?width=200'
          v_category = t.category
          v_name = t.name
          v_count = t.count
          v_fan = 'Followers'
          break
        case SECTION_MUSIC:
          v_href = 'https://www.facebook.com/' + t.id
          v_img = '//graph.facebook.com/' + t.id + '/picture?width=200'
          v_category = t.category
          v_name = t.name
          v_count = t.count
          v_fan = 'Fans'
          break
        case SECTION_MUSICSTREAMING:
          v_href = 'https://open.spotify.com/artist/' + t.id
          v_img = t.images && t.images[0] ? t.images[0].url : ''
          v_category = t.application
          v_name = t.name
          v_count = t.count
          v_fan = 'Listeners'
          break
        default:
          break
      }
      return (
        <LazyLoad key={index} height={200} width={200}>
          <a target="_blank" href={v_href}>
            <div className='card'>
              <img className="LazyLoadImg" src={v_img}/> 
              <div className='description'>                     
                <div className='left'>
                  <div className='category'>{v_category}</div>
                  <div className='name'>{v_name}</div>
                </div>
                <div className='right'>
                  <div className='count'>{v_count}</div>
                  <div className='fan'>{v_fan}</div>
                </div>
              </div>
            </div>            
          </a>
        </LazyLoad>
      )
    })
    if(rows_filtered.length == 0)
      content_rows = <EmptyBar />
    
    return (
      <div className="audience-content">
        {content_category}
        <div className="content-list">
          {content_rows}
        </div>
      </div>
    )
  }

	render() {
    const {http_status, http_error, rows, totalCount} = this.state
    const {type, data} = this.props

    let str_type = type == TYPE_EVENT ? 'event' : 'brand'
    let loadingBarTitle = `Hold tight! We\'re getting your ${str_type}\'s statistics...`    

    let content_status = null
		if(http_status == HTTP_INIT){
			content_status = (<LoadingBar key='loadingbar' title={loadingBarTitle} />)
		}else if(http_status == HTTP_LOADING){
			content_status = (<LoadingBar key='download' className='downloading' title={'Downloaded: ' + totalCount} />)
		}else if(http_status == HTTP_LOADING_FAILED){
      content_status = (<LoadingBar key='error' title={'Error Occured!'} />)
    }
    
    let content_main = null
		if(http_status >= HTTP_LOADING) {
      content_main = this.getContent()
    }

		return (
			<div ref="OboeAudience" className="audience">
        {content_status}
				{content_main}
			</div>
		)
	}
}