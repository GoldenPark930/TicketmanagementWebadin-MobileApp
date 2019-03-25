import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import LazyLoad from 'react-lazy-load'

import {FETCH_BRAND} from '../../_common/redux/brands/actions'
import {FETCH_BRAND_AUDIENCE} from '../../_common/redux/audience/actions'
import LoadingBar from '../_library/LoadingBar'
import EmptyBar from '../_library/EmptyBar'
import Card from '../_library/Card'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3

const SHOW_LIKES_COUNT_THRESHOLD = 50
@connect(
  (state) => {
    const brands = state.brands.get('collection').toJS()
    const audience = state.audience.get('audience').toJS()    
    return {
      brands,
      audience
    }
  },
  {FETCH_BRAND_AUDIENCE,FETCH_BRAND}
)
export default class BrandAnalytics extends React.Component {
  constructor(props) {
    super(props)
    this.state = {status: STATE_STATUS_INIT}
  }
  componentDidMount() {
    if (this.state.status == STATE_STATUS_LOADING) {
      return
    }
    const {brands, FETCH_BRAND_AUDIENCE, params: {id}} = this.props
    const loadingSetter = (val) => () =>{
      this.setState({status: val})      
    }
    Promise.resolve(FETCH_BRAND_AUDIENCE(id))
      .catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
      .then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
    loadingSetter(STATE_STATUS_LOADING)()
  }
  render() {
    const {status} = this.state
    const {audience} = this.props
    let content
    switch (status){
      case STATE_STATUS_INIT:
        content = null
        break
      case STATE_STATUS_LOADING:
        content = <LoadingBar title={'Hold tight! We\'re getting your brand\'s statistics...'} />
        break
      case STATE_STATUS_LOADING_SUCCESSED:        
        // --- sales ---
        content = null
        let data = audience.audience
        if(data == null){
          content = <EmptyBar />
        }else{
          let allowedCategory = ['Musician/Band', 'Musician', 'Record Label', 'Music Genre']

          let newArray = []
          for(var i = 0; i < data.likes.length; i++) {
            var obj = data.likes[i]
            if(parseInt(obj.count) >= SHOW_LIKES_COUNT_THRESHOLD){
              if (allowedCategory.indexOf(obj.category) > -1) {
                newArray.push({
                  id: obj.id,
                  count: parseInt(obj.count, 10),
                  name: obj.name,
                  category: obj.category
                })
              }        
              //console.log('no=%d, id=%d, count=%d, name=%s, category=%s', i, parseInt(obj.id), parseInt(obj.count), obj.name, obj.category)
            }      
          }
          newArray.sort(function(a,b) {return (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)} )
          //console.log("load from json = ", newArray.length)
          let number = 0
          let rows = _.map(newArray, function(t, index){
            return (
              <tr key={index} className={number++ % 2== 0 ? 'row-stale' : ''}>
                <td><a target="_blank" href={'https://www.facebook.com/' + t.id}><LazyLoad height={200}><img className="LazyLoadImg" src={'//graph.facebook.com/' + t.id + '/picture?width=200'}/></LazyLoad></a></td>
                <td>{t.count}</td>
                <td>{t.category}</td>
                <td><a target="_blank" href={'https://www.facebook.com/' + t.id}>{t.name}</a></td>
              </tr>
              )
          })
          content = <Card title={' '}>
            <div className = "row">
              <div className="col-xs-12">                                
                <div className="table_reponsive">
                  <table className="table tickets-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Number of People</th>
                        <th>Category</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        }
        break
      case STATE_STATUS_LOADING_FAILED:
        content = null
        break
      default:
        content = null
        break
    }

    return (
      <div>
        <div className="row">
          <div className="col-xs-9">
            <h2>Audience</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
              {content}
          </div>
        </div>
      </div>
    )
  }
}

