import React from 'react';
import {
  View,
  StyleSheet,
  Text
}	from 'react-native';
import Day from './Day'

export default class Month extends React.Component {
  constructor(props) {
    super(props);

    this.weekDaysLocale = props.weekDaysLocale.slice();

    if (props.startFromMonday) {
      this.weekDaysLocale.push(this.weekDaysLocale.shift());
    }
  }

  renderWeekDays(){
    let {
      width, bodyTextColor
    } = this.props;
    console.log('=====width', width)
    return(
      <View style={styles.weekDaysContainer}>
        {
          this.weekDaysLocale.map((dayName, i) => {
            return(
              <View key={i} style={[styles.weekDay, {width: Math.floor(width/7)}]}>
                <Text style={[styles.weekDayText, {color: bodyTextColor }]}>
                  {dayName}
                </Text>
              </View>
            )
          })
        }
      </View>
    )
  }

  renderDays(){
    let {
      days, changeSelection
    } = this.props;
    return(
      <View style={styles.daysContainer}>
        {days.map((day, i) => {
          return (
            <Day
              key={i}
              {...this.props}
              disabled={day.disabled}
              status={day.status}
              date={day.date}
              onDayPress={changeSelection}
            />
          );
        })}
      </View>
    )
  }

  render() {
    let {
      days, changeSelection, style, monthsLocale,
      bodyBackColor, bodyTextColor, headerSepColor, width, monthTextColor
    } = this.props;

    var monthHeader = monthsLocale[days[15].date.getMonth()] + ' - ' + days[15].date.getFullYear();

    return (
      <View style={[style, {flex: 1, backgroundColor: bodyBackColor, arguments: 'center'}]}>
        <View style={{
          backgroundColor: 'rgb(113, 115, 117)',
          alignItems: 'center',
          marginBottom: 15,
          marginTop: 30
        }}>
          <Text style={[styles.monthHeader, {color: monthTextColor || bodyTextColor}]}>
            {monthHeader}
          </Text>
        </View>

        {this.renderWeekDays()}
        {this.renderDays()}
        <View style={styles.divider} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  monthHeader: {
    fontWeight: '600',
    color: '#363636',
    fontSize: 12,
    marginVertical: 10
  },
  weekDayText: {
    width: 25.7143,
    height: 12.8571,
    lineHeight: 12.8571,
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 1,
    color: '#fff',
    fontWeight: '600',
  },
  weekDay: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  weekDaysContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between'
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 200
  },
  divider: {
    height: 1,
    backgroundColor: '#979797',
    alignSelf: 'stretch',
    opacity: 0.11
  }
});
