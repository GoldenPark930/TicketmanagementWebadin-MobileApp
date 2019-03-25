import contants from './constants'

export default constants = {
    menuOptionLabel: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Open Sans'
    },
    menuOptionCustomStyles: {
        optionText: {
            color: 'white',
            fontSize: 14,
            fontFamily: 'Open Sans'
        }
    },
    menuOptionsCustomStyles: {
        optionsContainer: {
            backgroundColor: contants.colors.background5,
            paddingTop: 10,
            paddingBottom: 10,
            marginTop: 25
        },
        optionWrapper: {
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
            paddingBottom: 10
        },
        optionTouchable: {
            underlayColor: contants.colors.background6,
            activeOpacity: 70
        }
    },
    menuOptionsCustomStylesForSelect: {
        optionsContainer: {
            backgroundColor: contants.colors.background5,
            paddingTop: 5,
            paddingBottom: 5,
            marginTop: 50,
          maxHeight: 300
        }
    },
    menuOptionDateStyle: {
        optionsContainer:{
            backgroundColor: contants.colors.background5,
            padding: 10,
            marginTop: 50,
            width:460, height:250
        }
    }
}
