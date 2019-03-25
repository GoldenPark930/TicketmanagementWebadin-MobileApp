import React from 'react'
import {Link} from 'react-router'

export default class EmptyBar extends React.Component {  
  constructor(props) {
    super(props)
  }
  render() {
    const {link, buttonTitle, content} = this.props
    return (
      <div className="card text-center">
        <div className="card-block">
          <div>
            {!!link && <Link className="btn btn-lg btn-primary btn-shadow" to={link}>
              <i className="fa fa-fw fa-plus" /> {buttonTitle || 'Create'}
            </Link>}
            {!link && (content || (<img  className="no_data_ico"  src={asset('/assets/resources/images/no_data_icon_new.png')}/> ))}
          </div>
        </div>
      </div>
    )
  }
}