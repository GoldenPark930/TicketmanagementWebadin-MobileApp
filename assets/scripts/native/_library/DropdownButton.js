import React from 'react'
import {Menu, MenuOptions, MenuTrigger} from 'react-native-popup-menu'
import Button from './Button'
import {menu} from '../../native/styles'
import PropTypes from 'prop-types';

export default class DropdownButton extends React.Component {
    static propTypes = {
        style: PropTypes.any,
        title: PropTypes.string,
        icon: PropTypes.string
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {children} = this.props
        return (
            <Menu>
                <MenuTrigger>
                    <Button {...this.props} size='small' rightIcon='caret-down' disabled={true}/>
                </MenuTrigger>
                <MenuOptions customStyles={menu.menuOptionsCustomStyles}>{children}</MenuOptions>
            </Menu>
        )
    }
}
