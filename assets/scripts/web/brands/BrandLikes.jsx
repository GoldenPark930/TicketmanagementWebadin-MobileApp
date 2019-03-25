import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {
	OboeAudience, 
	TYPE_BRAND,
	SECTION_LIKES,
} from '../_library/OboeAudience'

@connect(
  (state) => {
    const brands = state.brands.get('collection').toJS()
    return {
      brands
    }
  }
)
export default class BrandLikes extends React.Component {
  componentDidMount() {    
    const {brands, params: {id}} = this.props
    const brand = brands[id]
    document.title = `Likes - ${brand.displayName} - The Ticket Fairy Dashboard`
  }
  
  render() {
    const {brands, params: {id}} = this.props
    return (
      <div className="audience-likes">
        <OboeAudience
          type={TYPE_BRAND}
          section={SECTION_LIKES}
          limitShowing={true}
          data={{
            url: `/api/audience/${id}/`, 
            node: 'data.audience.likes.*', 
            param: {type: 'brand', section: 'likes'}
          }} 
        />
      </div>
    )
  }
}

