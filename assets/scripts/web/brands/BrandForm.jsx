import _ from 'lodash'
import {reduxForm} from 'redux-form'
import React from 'react'

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import ClipboardButton from 'react-clipboard.js'

import AutoSlugField from '../_library/AutoSlugField'
import Button from '../_library/Button'
import Field from '../_library/Field'
import Card from '../_library/Card'

const countries = {
	'': 'Select Country',
	'us': 'United States',
	'uk': 'United Kingdom',
	'au': 'Australia',
	'nz': 'New Zealand'
}
function validateBrand(data) {
	const required = [
		'attributes.displayName',
		'attributes.slug',
		'attributes.legalEntity',
		'attributes.addressLine1',
		'attributes.city',
		'attributes.state',
		'attributes.zip',
		'attributes.country',
	]
	const errors = {}

	required.forEach(function(f) {
		if (!_.get(data, f)) {
			_.set(errors, f, 'Required')
		}
	})
	return errors
}

@reduxForm({
	form: 'brand',
	fields: [
		'attributes.displayName',
		'attributes.slug',
		'attributes.legalEntity',
		'attributes.addressLine1',
		'attributes.addressLine2',
		'attributes.city',
		'attributes.state',
		'attributes.zip',
		'attributes.country',
		'attributes.taxID',
		'attributes.accountName',
		'attributes.accountNumber',
		'attributes.routingNumber',
		'attributes.bsb',
		'attributes.sortCode',
	],
	validate: validateBrand
})
export default class BrandForm extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			brandUrlCopied: false
		}
	}
	copyBrandUrlAfter() {
		this.setState({
			brandUrlCopied: true
		})
	}
	copyBrandUrlOut(e) {
		if(this.state.brandUrlCopied) {
			setTimeout(() => {
				this.setState({
					brandUrlCopied: false
				})  
			}, 500)
		}
	}
	render() {
		const {submitting, onCancel, handleSubmit, 
			fields: {attributes: {displayName, slug,legalEntity, addressLine1, addressLine2, city, state, zip, country, taxID, 
				accountName, accountNumber, routingNumber, bsb, sortCode}}, 
			submitLabel, initialValues} = this.props
		const state1 = this.props.fields.attributes.state
		return (
			<form ref="form" method="POST" onSubmit={handleSubmit}>
				<Card icon={'fa-info'} title={'Brand Details'}>
					<Field id="displayName" label="Name" {...displayName} />
					<label className="autoslugfield-label" onMouseLeave={::this.copyBrandUrlOut}>
						URL
						<ClipboardButton component="span" data-clipboard-text={'https://www.theticketfairy.com/events/'+slug.value} onSuccess={::this.copyBrandUrlAfter}>
							<OverlayTrigger placement="right" overlay={this.state.brandUrlCopied?<Tooltip id="brandUrlCopied">Copied</Tooltip>:<Tooltip id="brandUrlCopied">Copy Brand URL</Tooltip>} trigger={['hover']}>
								<i className="fa fa-clipboard brand-url-copy" />
							</OverlayTrigger>
						</ClipboardButton>
					</label>
					<AutoSlugField id="slug" label="Link URL" {...slug} separator="-"
						hint="Letters, numbers and hyphens only"
						suggestion={displayName.value}>
						<Field.PrefixAddon className="link-prefix hidden-xs">
							<img className="link-prefix-img" src={asset('/assets/resources/images/event-url.png')}/>
							<div className="link-prefix-url">https://www.theticketfairy.com/events/</div>
						</Field.PrefixAddon>
					</AutoSlugField>
				</Card>
				<Card icon={'fa-briefcase'} title={'Business Details'}>
					<div className="row">
						<div className="col-xs-12">
							<div className={'form-group ' + (country.error ? 'has-error' : '')}>
								<div className="floating-field-group active">
									<div className="floating-field">
										<label className="control-label" htmlFor="country">Country</label>
										<select 
											className="form-control"
											id="country" className="form-control" {...country}>					 
											{_.map(countries, (value, key) => <option key={key} value={key}>{value}</option>)}
										</select>
									</div>
								</div>
								{!!country.error && country.touched && <div className="help-block">{country.error}</div>}
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-xs-12">
							<Field id="legalEntity" label="Legal Entity Name" {...legalEntity} />
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<Field id="addressLine1" label="Address (Line 1)" {...addressLine1} />
						</div>
						<div className="col-sm-6">
							<Field id="addressLine2" label="Address (Line 2)" {...addressLine2} />
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<Field id="city" label="City" {...city} />
						</div>
						<div className="col-sm-6">
							<Field id="state" label="State" {...state1} />
						</div>
					</div>
					<div className="row">
						<div className="col-sm-6">
							<Field id="zip" label="Zip/Postcode" {...zip} />
						</div>
						<div className="col-sm-6">							
							<Field id="taxID" label="GST/VAT Number" {...taxID} />								
						</div>
					</div>			 
				</Card>
				<Card icon={'fa-money'} title={'Payout Details'}>					
					<div className="row">
						<div className="col-sm-6">
							<Field id="accountName" label="Account Holder Name" {...accountName} />
						</div>
						<div className="col-sm-6">
							<Field id="accountNumber" label="Account Number" {...accountNumber} />
						</div>
					</div>
					{!!country && country.value == 'us' &&
					<div className="row">
						<div className="col-xs-12">
							<Field id="routingNumber" label="Routing Number" {...routingNumber} />
						</div>
					</div>
					}
					{!!country && country.value == 'au' &&
					<div className="row">
						<div className="col-xs-12">
							<Field id="BSB" label="BSB" {...bsb} /> 
						</div>
					</div>
					}
					{!!country && country.value == 'uk' &&
					<div className="row">
						<div className="col-xs-12">
							<Field id="sortCode" label="Sort Code" {...sortCode} />
						</div>
					</div>
					}
				</Card> 
				<div className="card-block card-footer text-center btn-toolbar">					
					<Button type="submit" className="btn btn-primary btn-lg btn-shadow" loading={submitting}>{submitLabel}</Button>
					{onCancel && <Button className="btn btn-danger btn-lg btn-shadow" type="button" disabled={submitting} onClick={onCancel}>Cancel</Button>}
				</div>
			</form>
		)
	}
}
