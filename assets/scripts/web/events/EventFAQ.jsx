import React from 'react'
import {connect} from 'react-redux'
import _ from 'lodash'
import Modal from 'react-modal'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import Button from '../_library/Button'
import EventFAQSection from './faq/EventFAQSection'
import modalStyle from '../../_common/core/modalStyle'

@connect(
  (state) => {
    const u = state.auth.get('user')
    return {
      user: u ? u.toJS() : null,
      event: state.events.get('selected').toJS()
    }
  },
  {}
)

@DragDropContext(HTML5Backend)
export default class EventFAQ extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      sections: [],
      moveHistory: [],
      moveHistoryCursor: 0,
      saveMoveHistoryDialogOpen: false
    }
  }

  componentDidMount() {
    const {event} = this.props
    document.title = `FAQs - ${event.displayName} - The Ticket Fairy Dashboard`
    
    this.setState({
      sections: event.faqs || [],
      moveHistory: [],
      moveHistoryCursor: 0,
      saveMoveHistoryDialogOpen: false
    })
  }

  newSection() {
    if(!this.checkContentEditable()) {
      return
    }
    let {sections} = this.state
    sections.push({
      id: new Date().valueOf(),
      name: 'New Section',
      items: [],
      expanded: false
    })
    this.setState({
      sections: sections
    })
  }

  deleteSection(index) {
    if(!this.checkContentEditable()) {
      return
    }
    let {sections} = this.state
    sections.splice(index, 1)
    this.setState({
      sections: sections
    })
  }

  expandSection(index) {
    let {sections} = this.state
    for (let i=0; i<sections.length; i++) {
      if (i===index) {
        sections[i].expanded = true  
      } else {
        sections[i].expanded = false
      }
    }
    this.setState({
      sections: sections
    })
  }

  collapseSection(index) {
    let {sections} = this.state
    sections[index].expanded = false
    this.setState({
      sections: sections
    })
  }

  moveSection(dragIndex, hoverIndex) {
    let {sections} = this.state
    let dragItem = sections[dragIndex]
    sections.splice(dragIndex, 1)
    sections.splice(hoverIndex, 0, dragItem)
    this.setState({
      sections: sections
    })
    this.addMoveHistory('section', {dragIndex: dragIndex, hoverIndex: hoverIndex})
  }

  changeSectionName(index, val) {
    if(!this.checkContentEditable()) {
      return
    }
    let {sections} = this.state
    sections[index].name = val
    this.setState({
      sections: sections
    })
  }

  newItem(index) {
    if(!this.checkContentEditable()) {
      return
    }
    let {sections} = this.state
    sections[index].items.push({
      id: new Date().valueOf(),
      question: 'New Question',
      answer: '',
      expanded: false
    })
    this.setState({
      sections: sections
    }, () => {
      this.expandSection(index)
      this.expandItem(index, sections[index].items.length-1)
    })
  }

  deleteItem(indexSection, indexItem) {
    if(!this.checkContentEditable()) {
      return
    }
    let {sections} = this.state
    sections[indexSection].items.splice(indexItem, 1)
    this.setState({
      sections: sections
    })
  }

  moveItemInsideSection(indexSection, dragIndex, hoverIndex) {
    let {sections} = this.state
    let dragItem = sections[indexSection].items[dragIndex]
    sections[indexSection].items.splice(dragIndex, 1)
    sections[indexSection].items.splice(hoverIndex, 0, dragItem)
    this.setState({
      sections: sections
    })
    this.addMoveHistory('item', {indexSection: indexSection, dragIndex: dragIndex, hoverIndex: hoverIndex})
  }

  moveItemAcrossSection(dragIndexSection, dragIndexItem, hoverIndexSection) {
    let {sections} = this.state
    let dragItem = sections[dragIndexSection].items[dragIndexItem]
    sections[hoverIndexSection].items.push(dragItem)
    sections[dragIndexSection].items.splice(dragIndexItem, 1)
    this.setState({
      sections: sections
    })
    this.expandSection(hoverIndexSection)
    this.addMoveHistory('item-section', {dragIndexSection: dragIndexSection, dragIndexItem: dragIndexItem, hoverIndexSection: hoverIndexSection})
  }

  expandItem(indexSection, indexItem) {
    let {sections} = this.state
    for (let i=0; i<sections[indexSection].items.length; i++) {
      sections[indexSection].items[i].expanded = (i===indexItem)
    }
    this.setState({
      sections: sections
    })
  }

  collapseItem(indexSection, indexItem) {
    let {sections} = this.state
    sections[indexSection].items[indexItem].expanded = false
    this.setState({
      sections: sections
    })
  }

  changeQuestion(indexSection, indexItem, val) {
    if(!this.checkContentEditable()) {
      return
    }
    let {sections} = this.state
    sections[indexSection].items[indexItem].question = val
    this.setState({
      sections: sections
    })
  }

  changeAnswer(indexSection, indexItem, val) {
    if(!this.checkContentEditable()) {
      return
    }
    let {sections} = this.state
    sections[indexSection].items[indexItem].answer = val
    this.setState({
      sections: sections
    })
  }

  addMoveHistory(type, info) {
    let {moveHistory, moveHistoryCursor} = this.state
    moveHistory.splice(moveHistoryCursor)
    moveHistory.push({
      type: type,
      info: info
    })
    this.setState({
      moveHistory: moveHistory,
      moveHistoryCursor: moveHistoryCursor + 1
    })
  }

  undoMoveHistory() {
    let {moveHistory, moveHistoryCursor, sections} = this.state
    if(moveHistoryCursor==0) {
      return
    }
    let move = moveHistory[moveHistoryCursor-1]
    if(move.type=='section') {
      let {dragIndex, hoverIndex} = move.info
      let dragSection = sections[hoverIndex]
      sections.splice(hoverIndex, 1)
      sections.splice(dragIndex, 0, dragSection)
      this.setState({
        moveHistoryCursor: moveHistoryCursor-1,
        sections: sections
      })
    } else if(move.type=='item') {
      let {indexSection, dragIndex, hoverIndex} = move.info
      let dragItem = sections[indexSection].items[hoverIndex]
      sections[indexSection].items.splice(hoverIndex, 1)
      sections[indexSection].items.splice(dragIndex, 0, dragItem)
      this.setState({
        moveHistoryCursor: moveHistoryCursor-1,
        sections: sections
      },() => {
        this.expandSection(indexSection)
      })
    } else if(move.type=='item-section') {
      let {dragIndexSection, dragIndexItem, hoverIndexSection} = move.info
      let dragItem = sections[hoverIndexSection].items[sections[hoverIndexSection].items.length-1]
      sections[hoverIndexSection].items.splice(sections[hoverIndexSection].items.length-1, 1)
      sections[dragIndexSection].items.splice(dragIndexItem, 0, dragItem)
      this.setState({
        moveHistoryCursor: moveHistoryCursor-1,
        sections: sections
      },() => {
        this.expandSection(dragIndexSection)
      })
    }
  }

  redoMoveHistory() {
    let {moveHistory, moveHistoryCursor, sections} = this.state
    if(moveHistoryCursor==moveHistory.length) {
      return
    }
    let move = moveHistory[moveHistoryCursor]
    if(move.type=='section') {
      let {dragIndex, hoverIndex} = move.info
      let dragSection = sections[dragIndex]
      sections.splice(dragIndex, 1)
      sections.splice(hoverIndex, 0, dragSection)
      this.setState({
        moveHistoryCursor: moveHistoryCursor+1,
        sections: sections
      })
    } else if(move.type=='item') {
      let {indexSection, dragIndex, hoverIndex} = move.info
      let dragItem = sections[indexSection].items[dragIndex]
      sections[indexSection].items.splice(dragIndex, 1)
      sections[indexSection].items.splice(hoverIndex, 0, dragItem)
      this.setState({
        moveHistoryCursor: moveHistoryCursor+1,
        sections: sections
      },() => {
        this.expandSection(indexSection)
      })
    } else if(move.type=='item-section') {
      let {dragIndexSection, dragIndexItem, hoverIndexSection} = move.info
      let dragItem = sections[dragIndexSection].items[dragIndexItem]
      sections[dragIndexSection].items.splice(dragIndexItem, 1)
      sections[hoverIndexSection].items.push(dragItem)
      this.setState({
        moveHistoryCursor: moveHistoryCursor+1,
        sections: sections
      },() => {
        this.expandSection(hoverIndexSection)
      })
    }
  }

  saveMoveHistory() {
    this.setState({
      moveHistory: [],
      moveHistoryCursor: 0
    })
  }

  resetMoveHistory() {
    if(!this.checkContentEditable()) {
      return
    }
    this.setState({
      moveHistory: [],
      moveHistoryCursor: 0
    })
  }

  checkContentEditable() {
    let {moveHistory} = this.state
    if(moveHistory.length > 0) {
      this.setState({
        saveMoveHistoryDialogOpen: true
      })
      return false
    } else {
      return true
    }
  }

  closeSaveMoveHistoryDialog() {
    this.setState({
      saveMoveHistoryDialogOpen: false
    })
  }

  saveSaveMoveHistoryDialog() {
    this.saveMoveHistory()
    this.setState({
      saveMoveHistoryDialogOpen: false
    })
  }

  render() {
    let {sections, moveHistory, moveHistoryCursor, saveMoveHistoryDialogOpen} = this.state

    return (
      <div className="eventfaq">
        <div className="eventfaq-buttons">
          <button className="btn btn-success btn-shadow eventfaq-newsection" type="button" onClick={e => this.newSection()}>
            <i className="fa fa-plus" aria-hidden="true"></i>New Section
          </button>
          <button className="btn btn-seablue btn-shadow eventfaq-resetorting" type="button" onClick={e => this.resetMoveHistory()}>
            <i className="fa fa-refresh" aria-hidden="true"></i>Reset Sorting
          </button>
          <button className="btn btn-seablue btn-shadow eventfaq-saveorting" type="button" onClick={e => this.saveMoveHistory()} disabled={moveHistory.length==0}>
            <i className="fa fa-floppy-o" aria-hidden="true"></i>Save Sorting
          </button>
          <button className="btn btn-seablue btn-shadow eventfaq-undosorting" type="button" onClick={e => this.undoMoveHistory()} disabled={moveHistoryCursor==0}>
            <i className="fa fa-undo" aria-hidden="true"></i>Undo Sorting
          </button>
          <button className="btn btn-seablue btn-shadow eventfaq-redosorting" type="button" onClick={e => this.redoMoveHistory()} disabled={moveHistoryCursor==moveHistory.length}>
            <i className="fa fa-repeat" aria-hidden="true"></i>Redo Sorting
          </button>
        </div>
        { _.map(sections, (section, i) => (
          <EventFAQSection
            id={section.id}
            key={section.id}
            index={i}
            section={section}
            onChange={(val) => this.changeSection(i, val)}
            onDelete={() => this.deleteSection(i)}
            onMove={(dragIndex, hoverIndex) => this.moveSection(dragIndex, hoverIndex)}
            onExpand={() => this.expandSection(i)}
            onCollapse={() => this.collapseSection(i)}
            onChangeName={(val) => this.changeSectionName(i, val)}
            onNewItem={() => this.newItem(i)}
            onDeleteItem={(index) => this.deleteItem(i, index)}
            onMoveItemInsideSection={(dragIndex, hoverIndex) => this.moveItemInsideSection(i, dragIndex, hoverIndex)}
            onMoveItemAcrossSection={(dragIndexSection, dragIndexItem, hoverIndexSection) => this.moveItemAcrossSection(dragIndexSection, dragIndexItem, hoverIndexSection)}
            onExpandItem={(index) => this.expandItem(i, index)}
            onCollapseItem={(index) => this.collapseItem(i, index)}
            onChangeQuestion={(index, val) => this.changeQuestion(i, index, val)}
            onChangeAnswer={(index, val) => this.changeAnswer(i, index, val)}
          />
        ))}
        <Modal
          className="modal-dialog modal-trans"
          style={modalStyle}
          isOpen={!!saveMoveHistoryDialogOpen}
          contentLabel="Modal"
          onRequestClose={::this.closeSaveMoveHistoryDialog}
          closeTimeoutMS={150}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div>
                <div className="modal-header">
                  <p className="h4 text-compact">Are you sure?</p>
                </div>
                <div className="modal-body">
                  <p>Tickets table has been modified. Save current changes?</p>
                </div>
                <div className="modal-footer">
                  <div className="btn-toolbar btn-toolbar-right">
                    <Button
                      className="btn btn-primary"
                      type="button"
                      onClick={e => this.saveSaveMoveHistoryDialog()}>Save</Button>
                    <Button
                      className="btn btn-default" type="button"
                      onClick={::this.closeSaveMoveHistoryDialog}>Cancel</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}