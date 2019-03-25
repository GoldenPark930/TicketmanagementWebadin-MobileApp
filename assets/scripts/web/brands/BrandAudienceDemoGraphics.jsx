import _ from 'lodash'
import Immutable from 'immutable'
import React from 'react'
import {connect} from 'react-redux'

import {FETCH_AUDIENCE} from '../../_common/redux/audience/actions'
import {FETCH_BRAND} from '../../_common/redux/brands/actions'
import LazyLoad from 'react-lazy-load'
import LoadingBar from '../_library/LoadingBar'
import EmptyBar from '../_library/EmptyBar'
import PieChart from '../_library/PieChart'
import Card from '../_library/Card'
import ProgressCircle from '../_library/ProgressCircle'

const STATE_STATUS_INIT = 0
const STATE_STATUS_LOADING = 1
const STATE_STATUS_LOADING_SUCCESSED = 2
const STATE_STATUS_LOADING_FAILED = 3

@connect(
	(state) => {
		const brands = state.brands.get('collection').toJS()
		const audience = state.audience.get('brand').toJS().gender
		return {
			brands,
			audience
		}
	},
	{FETCH_BRAND, FETCH_AUDIENCE}
)
export default class BrandAudienceDemoGraphics extends React.Component {
	constructor(props) {
		super(props)
		this.state = {status: STATE_STATUS_INIT}
	}
	componentDidMount() {
		if (this.state.status == STATE_STATUS_LOADING) {
			return
		}
		const {brands, params: {id}, FETCH_AUDIENCE} = this.props
		const brand = brands[id]
		document.title = `Demographics - ${brand.displayName} - The Ticket Fairy Dashboard`
		const loadingSetter = (val) => () =>{
			this.setState({status: val})			
		}
		Promise.resolve(FETCH_AUDIENCE(id, 'brand', 'gender'))
			.catch(loadingSetter(STATE_STATUS_LOADING_FAILED))
			.then(loadingSetter(STATE_STATUS_LOADING_SUCCESSED))
		loadingSetter(STATE_STATUS_LOADING)()
	}
	
	render() {
		const {status} = this.state
		const {audience} = this.props
		let content_gender = null
		
		// Gender Breakdown
		let gender = {male: 0, female: 0, male_percent: 0, female_percent: 0}
		if(status > STATE_STATUS_LOADING && audience && audience.audience && audience.audience.gender){
			gender.male = audience.audience.gender.male			
			gender.female = audience.audience.gender.female
			let sum = gender.male+gender.female
			sum = sum < 1 ? 1 : sum
			gender.female_percent = parseInt(gender.female / sum * 100)
			gender.male_percent = 100 - gender.female_percent
		}
		let pieChart = {'FEMALE': gender.female, 'MALE': gender.male}

		content_gender = 
			<div className="row gender-breakdown">
				<div className="col-xs-12 col-sm-4 pie-component">
					<PieChart 
						data={{method: 'local', data: pieChart}}
						options={{size: 200, legends: false, pieLabel: true, colors:['#FB52AE', '#5876FF']}}
					/>
					<div className="pie-component-bar">
						<div className="pie-component-bar-left">
							<div>MALE</div>
						</div>
						<div className="pie-component-bar-center">
							<div>OVERALL</div>
						</div>
						<div className="pie-component-bar-right">
							<div>FEMALE</div>
						</div>
					</div>
				</div>
				<div className="col-xs-12 col-sm-4 female-circle">
					<ProgressCircle img={asset('/assets/resources/images/icon-female.png')} value={gender.female_percent}/>	
					<div className="circle-info">
						<div className="circle-description">
							<div className="description1">
								<div className="circle-value">
									{gender.female}
								</div>
								<div className="circle-type">
									FEMALE
								</div>
							</div>							
							<div className="description2">
								Ticket Buyers
							</div>
						</div>			
					</div>
				</div>
				<div className="col-xs-12 col-sm-4 male-circle">
					<ProgressCircle img={asset('/assets/resources/images/icon-male.png')} value={gender.male_percent}/>
					<div className="circle-info">
						<div className="circle-description">
							<div className="description1">
								<div className="circle-value">
									{gender.male}
								</div>
								<div className="circle-type">
									MALE
								</div>
							</div>							
							<div className="description2">
								Ticket Buyers
							</div>
						</div>			
					</div>
				</div>
			</div>

		return (
			<div className="demographics">
				<Card icon={'fa-male'} icon2={'fa-female'} title={'Gender Breakdown'}>
				{ /* <select id="gender-duration" className="demographics-dropdown">
							<option value={3}>Past 3 months</option>
						</select> */ }
					<div className="card-block-title">
						<div className="highlight">
							Ticket Buyers by <strong>Gender</strong>
						</div>
					</div>
					{content_gender}
				</Card>
			</div>
		)
	}
}

