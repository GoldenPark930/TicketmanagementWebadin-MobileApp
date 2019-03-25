import React from 'react'
import _ from 'lodash'
import LazyLoad from 'react-lazyload'
import BarChart from '../../_library/BarChart'
import EmptyBar from '../../_library/EmptyBar'
import {
	JSONDatatable, 
	TYPE_FROM_ARRAY,
	SEARCHBAR, DATATABLE, PAGINATIONBAR, 
	IS_FOUND,
} from '../../_library/JSONDatatable'

export default class InfluencerReferrers extends React.Component{
  constructor(props) {
		super(props)
		this.expandedRowID = null
	}
  
  componentDidMount() {

  }

	getFilteredRows(rows, search){
		let rows_filtered = rows
		
		// filter by search
		let keyword = search.join('').trim().toLowerCase()
		if(keyword != ''){
			rows_filtered = _.filter(rows_filtered, (item) => {
				let found = 0
				found += IS_FOUND(item.first_name + ' ' + item.last_name, keyword)
				found += IS_FOUND(item.email, keyword)
				found += IS_FOUND(item.city, keyword)
				found += IS_FOUND(item.country, keyword)
				return found > 0
			})
		}
		return rows_filtered
	}

	getSortedRows(rows_filtered, sort){
		if(sort){
			let dir = sort.asc ? 'asc' : 'desc'
			switch(sort.index){
				case 1: // name
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return t.first_name + ' ' + t.last_name}, dir)
					break
				case 2: // sales_referred
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return isNaN(t.sales_referred) ? 0 : parseInt(t.sales_referred)}, dir)
					break
				case 3: // revenue_generated
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return isNaN(t.revenue_generated) ? 0 : parseFloat(t.revenue_generated)}, dir)
					break
				case 4: // original_cost
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return isNaN(t.original_cost) ? 0 : parseFloat(t.original_cost)}, dir)
					break
				case 5: // refund_due
					rows_filtered = _.orderBy(rows_filtered, (t)=>{return isNaN(t.refund_due) ? 0 : parseFloat(t.refund_due)}, dir)
					break
				default:
					break
			}
		}
		return rows_filtered
	}

	getTableData(datatable, rows_filtered, sort){
		const {event} = this.props
		let currency = getCurrencySymbol(event)

		let clipboard_text = this.getClipboardText(rows_filtered)
		let clipboard = datatable.getClipboardColumn(datatable, clipboard_text)

		let content_header = datatable.getHeaderRow(datatable, [
				{title: '', sort: false},
				{title: 'Customer', sort: false},
				{title: 'No. of Tickets Referred', sort: true, className: 'text-center'},
				{title: 'Revenue Generated (excl. fees)', sort: true, className: 'text-center'},
				{title: 'Original Purchase Price (excl. fees)', sort: false, className: 'text-center'},
				{title: 'Refund Due', sort: false, className: 'text-center'},
				{title: clipboard, sort: false, className: 'column-clipboard'}
			], sort)

		let camalize = (str) => {
			let ret = str.toLowerCase()
			return ret.replace(/\b[a-z]/g,function(f){return f.toUpperCase()})
		}
		let checked_in_at = (str) => {
			let date = moment(str).format('D MMMM YYYY, HH:mm:ss')
			return date == 'Invalid date' ? 'Not Yet' : date
		}
		
		let number = 0
		let self = this
		this.expandedRowID = null
		let content_table = _.map(rows_filtered, (t, index)=>{
			if (t.isExpanded && !t.isDetailRow) {
				this.expandedRowID = t.id
			}
			let isFBuser = t.fb_user_id && t.fb_user_id != ''
			const abbName = t.first_name.charAt(0).toUpperCase() + t.last_name.charAt(0).toUpperCase()
			let avatar = <div className="sales-circle">
				{!!isFBuser && 
				<a target="_blank" href={'https://www.facebook.com/' + t.fb_user_id}>
					<div className='LazyLoad'>
						<LazyLoad height={40} width={40} once>
							<img className="LazyLoadImg" src={'//graph.facebook.com/' + t.fb_user_id + '/picture?type=small'}/>
						</LazyLoad>
					</div>
				</a>}
				{!isFBuser && abbName}
			</div>
			let name = <div className="sales-name">{t.first_name}&nbsp;{t.last_name}</div>

			let content_row = null
			if(!t.isDetailRow){		
				content_row = <tr key={index} className={t.isExpanded ? ' tr-expanded-row' : (number++ % 2==0 ? 'table-stripe-row1' : 'table-stripe-row2')}>
					<td className='toggleExpand' onClick={datatable.onClickDetail.bind(datatable, t.id)}>
						<div className={t.isExpanded ? 'expandIcon expanded' : 'expandIcon'}>
							<i className={t.isExpanded ? 'fa fa-minus-square-o' : 'fa fa-plus-square-o'}/>
						</div>
					</td>
					<td><div className='customer_name'>{avatar}{name}</div></td>
					<td className="text-center">{t.sales_referred}</td>
					<td className="text-center">{currency}{t.revenue_generated}</td>
					<td className="text-center">{currency}{t.original_cost}</td>
					<td className="text-center">{currency}{t.refund_due}</td>
					<td></td>
				</tr>
			}else{
				content_row = <tr className='tr-detail-row' key={index}>
					<td colSpan={7}>
						<div className="row-detail">
							<div className="row-title row">
								<div className="col-xs-6 withDecorator">
									Contact Information
								</div>
								<div className="col-xs-6 withDecorator">
									Location
								</div>
							</div>
							<div className="div-spacing-20"/>
							<div className="row-content row">
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											<i className="fa fa-envelope" aria-hidden="true"></i> Email Address
										</div>
										<div className="value">
											{t.email}
										</div>
									</div>
								</div>
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											<i className="fa fa-phone-square" aria-hidden="true"></i> Phone Number
										</div>
										<div className="value">
											{t.phone}
										</div>
									</div> 
								</div>
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											<i className="fa fa-map-marker" aria-hidden="true"></i> City
										</div>
										<div className="value">
											{t.city}
										</div>
									</div> 
								</div>
								<div className="col-xs-3">
									<div className="content">
										<div className="field">
											<i className="fa fa-globe" aria-hidden="true"></i> Country
										</div>
										<div className="value">
											{t.country}
										</div>
									</div> 
								</div>
							</div>
						</div>
					</td>
				</tr>
			}
			return content_row
		})

		return (rows_filtered.length != 0) ? (
			<table className="table">
				<thead>
					{content_header}
				</thead>
				<tbody>
					{content_table}
				</tbody>
			</table>
		): (
			<EmptyBar/>
		)
	}

	getClipboardText(rows_filtered){
		let ret = ''
		ret += 'Customer' + '\t' + 'No. of Tickets Referred' + '\t' + 'Revenue Generated (excl. fees)' + '\t' + 'Original Purchase Price (excl. fees)' + '\t' + 'Refund Due' + '\n'
		_.map(rows_filtered, (t)=>{
			ret += (t.first_name + ' ' + t.last_name) + '\t' + 
				t.sales_referred + '\t' +
				t.revenue_generated + '\t' +
				t.original_cost + '\t' +
				t.refund_due + '\n'
		})
		return ret
  }
  
  render() {
    const {event, referrers} = this.props

    let number = 0      
    let frequency = {}
    let max = 0
    _.map(referrers, (t, index) => {
      let referred = t.sales_referred ? parseInt(t.sales_referred) : 0
      if(max < referred)
        max = referred
    })
    for(let i = 1; i<=max; i++)
      frequency[i] = 0
    _.map(referrers, (t, index) => {
      if(t.sales_referred && !t.isDetail){							
        let referred = parseInt(t.sales_referred)
        frequency[referred] += 1
      }
    })

    return (
      <div>
        <h3 className="heading_style">Sales Referred by Ticket Buyers</h3>
        {/* data.statistics.share_rate && <div className="influencers-share-rate">
          <h4>Share Rate: {parseFloat(data.statistics.share_rate).toFixed(2)}%</h4>
        </div>*/}
        <div className="card">
          <div className="card-block">
            <div className="text-center">
              <BarChart
                data={{method: 'local', data: frequency}}
                options={{titleX:'No. of Tickets Referred', titleY:'Number of people'}}
              />
            </div>									
          </div>
        </div>
        <div className="influencers-sales-table">
          <JSONDatatable
            type={TYPE_FROM_ARRAY}
            data={referrers}
            sort={{index: 3, asc: false}}
            getFilteredRows={::this.getFilteredRows}
            getSortedRows={::this.getSortedRows}
            getTableData={::this.getTableData}
            getClipboardText={::this.getClipboardText}
						usePagination={false}
						keepExpanded={this.expandedRowID}
          >
            {/* It can give additional className to SEARCHBAR, DATATABLE, PAGINATIONBAR by specifying className="XXX" */}
            <div ref={SEARCHBAR} hasSearch labelTotalCount="Number of Matching Influencers" />
            <div ref={DATATABLE}/> 
          </JSONDatatable>
        </div>
      </div>
    )
  }
}