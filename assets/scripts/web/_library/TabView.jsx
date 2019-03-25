import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'

export class Tab extends React.Component {
  render() {
    return <div>{this.props.children}</div>
  }
}

export class TabView extends React.Component {
  constructor(props) {
    super(props)

    // initialize state
    this.state = { selectedIndex: props.all ? 0 : 1 }
  }

  render() {
    const {all, title, passProps, headerClassName, bodyClassName, hasBackground, hasPerfectScrollBar} = this.props
    const {selectedIndex} = this.state
    let headers = []
    let bodies = []

    if(all) {
      headers.push(
        <div key={0} className={'tab-title'+(selectedIndex==0 ? ' selected' : '')} onClick={() => this.selectIndex(0)}>
          All
        </div>
      )
    }
    for(let i=0; i<this.props.children.length; i++) {
      if(this.props.children[i]){
        headers.push(
          <div key={i+1} className={'tab-title'+(selectedIndex==i+1 ? ' selected' : '')} onClick={() => this.selectIndex(i+1)}>
            {this.props.children[i].props.title}
          </div>
        )
        let childrenWithProps = null
        const isSelected = (selectedIndex==0 || selectedIndex==i+1)
        if(!!passProps) {
          childrenWithProps = React.cloneElement(this.props.children[i].props.children, { isSelected: isSelected })  
        } else {
          childrenWithProps = this.props.children[i].props.children
        }
        bodies.push(
          <div key={i+1} className={'tab'+(isSelected ? ' selected': '')}>
            {childrenWithProps}
          </div>
        )  
      }
    }
    
    let contentHeader = headers
    if (hasPerfectScrollBar && !isMobileDevice()){
      contentHeader = (<PerfectScrollbar suppressScrollY= {false}>
        {headers}
      </PerfectScrollbar>)
    }

    return (
      <div className="tab-view">
        {hasBackground && <div key="tab-background" className="tab-background"/>}
        <div className={`tab-header ${headerClassName}`}>
          {title && <div className="tab-view-title">{title}</div>}
          {contentHeader}
        </div>
        <div className={`tab-body ${bodyClassName}`}>
          {bodies}
        </div>
      </div>
    )
  }

  selectIndex(i) {
    this.setState({
      selectedIndex: i
    })
    if(this.props.onSelectTab) {
      this.props.onSelectTab(i)
    }
  }
}
