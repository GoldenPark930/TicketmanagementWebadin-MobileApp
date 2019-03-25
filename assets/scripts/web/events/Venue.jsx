import React from 'react'

import Address from '../_library/Address'
import Field from '../_library/Field'
import Card from '../_library/Card'

export default class Venue extends React.Component {
  render() {
    const {children, onSelect, flagDisabled, flagHidden, ...address} = this.props
    const streetLabel = [address.streetNumber, address.street].filter(Boolean).join(' ')
    const cityLabel = [address.city, address.state, address.postalCode].filter(Boolean).join(' ')
    let fullAddress = [address.displayName, streetLabel, cityLabel, address.country].filter(Boolean).join(', ')
    let visibility = flagHidden ? 'Hidden' : 'Visible'
    let access = flagDisabled ? 'No' : 'Yes'

    return (
      <Card icon={'fa-envelope-open'} title={'Venue Details'} className={'venue'}>
        <div onClick={onSelect}>
          <Field label="Venue Name" size="small" value={address.displayName} readOnly = {true}/>
          <Field label="Location" size="small" value = {fullAddress} readOnly = {true}/>
          <Field label="Visibility" size="small" value = {visibility} readOnly = {true}/>
          <Field label="Disabled Access" size="small" value = {access} readOnly = {true}/>
          <div className="availability">
          {flagDisabled && <div className="text-success"><i className="fa fa-wheelchair" /> Disabled access available</div>}
          {flagHidden && <div><i className="fa fa-circle-o" /> Customers <i>cannot</i> see the venue</div>}
          {!flagHidden && <div className="text-success"><i className="fa fa-circle" /> Customers can see the venue</div>}
          </div>
          {children && <div className="venue-buttons">{children}</div>}
        </div>
      </Card>
    )
  }
}

