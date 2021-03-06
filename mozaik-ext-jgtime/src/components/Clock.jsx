import React, { Component, PropTypes } from 'react';
import classNames                      from 'classnames';
import d3                              from 'd3/d3';
import moment                          from 'moment';
import timezone                        from 'moment-timezone';


const getCurrentTimeParts = timezoneName => {
    let currentTime = timezoneName ? moment().tz(timezoneName) : moment();

    return {
        moment:  currentTime,
        hours:   currentTime.hours() + currentTime.minutes() / 60,
        minutes: currentTime.minutes(),
        seconds: currentTime.seconds()
    };
};


const secondsScale = d3.scale.linear().domain([0, 59 + 999/1000]).range([-90, 270]);
const minutesScale = d3.scale.linear().domain([0, 59 + 59/60]).range([-90, 270]);
const hoursScale   = d3.scale.linear().domain([0, 11 + 59/60]).range([-90, 270]);

const sunFormats   = ['HH:mm', 'H:mm', 'H:m'];


class Clock extends Component {
    constructor(props) {
        super(props);

        this.state = getCurrentTimeParts(this.props.timezone);
    }

    componentDidMount() {
        setInterval(() => {
            this.setState(getCurrentTimeParts(this.props.timezone));
        }, 1000);
    }

    render() {
        // Hands styles
        const { hours, minutes, seconds } = this.state;

        const hoursStyle   = {
            transform: `rotate(${ hoursScale(hours % 12) }deg)`
        };
        const minutesStyle = {
            transform: `rotate(${ minutesScale(minutes) }deg)`
        };
        const secondsStyle = {
            transform: `rotate(${ secondsScale(seconds) }deg)`
        };

        // Day/night indicator
        const { sunRise, sunSet } = this.props;

        const sunRiseTime = moment(sunRise, sunFormats);
        const sunSetTime  = moment(sunSet,  sunFormats);

        const sunRiseDate = this.state.moment.clone().hours(sunRiseTime.hours()).minutes(sunRiseTime.minutes());
        const sunSetDate  = this.state.moment.clone().hours(sunSetTime.hours()).minutes(sunSetTime.minutes());

        const isDay = this.state.moment.isBetween(sunRiseDate, sunSetDate);
        const timeIndicatorClasses = classNames('time__clock__indicator fa', {
            'fa-sun-o':  isDay,
            'fa-moon-o': !isDay
        });

        const { title, info } = this.props;

        // Textual field, defaults to config value
        const infoFields = {
            timezone: this.props.timezone ? this.props.timezone.replace(/\w+\//, '').replace('_', ' ') : this.props.timezone,
            date:     this.state.moment.format('ll'),
            time:     this.state.moment.format('LT')
        };
        const infoText = infoFields[info] || info;

        const bodyClasses = classNames({ 'widget__body': !!title });
        const body = (
            <div className={bodyClasses}>
                <div className="time__clock__outer-circle">
                    <span className={timeIndicatorClasses}></span>
                    <span className="time__clock__info">{infoText}</span>
                </div>
                <div className="time__clock__hand time__clock__hand--seconds" style={secondsStyle} />
                <div className="time__clock__hand time__clock__hand--minutes" style={minutesStyle} />
                <div className="time__clock__hand time__clock__hand--hours"   style={hoursStyle} />
                <div className="time__clock__inner-circle" />
            </div>
        );

        if (title) {
            let titleText = title;
            if (title.indexOf('::') === 0) {
                titleText = this.state.moment.format(title.substring(2));
            }

            return (
                <div>
                    <div className="widget__header">
                        {titleText}
                        <i className="fa fa-clock-o" />
                    </div>
                    {body}
                </div>
            );
        }

        return body;
    }
}

Clock.displayName = 'Clock';

Clock.propTypes = {
    title:    PropTypes.string,
    info:     PropTypes.string,
    timezone: PropTypes.string,
    sunRise:  PropTypes.string.isRequired,
    sunSet:   PropTypes.string.isRequired
};

Clock.defaultProps = {
    sunRise: '06:00',
    sunSet:  '18:00'
};


export default Clock;
