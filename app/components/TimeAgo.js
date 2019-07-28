// @flow
import React, { PureComponent } from "react";
import { RkText } from 'react-native-ui-kitten';
// import moment from "moment";

var moment = require('moment-timezone');
export class TimeAgo extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            timer: null,
        }
    }

    static defaultProps = {
        hideAgo: false,
        interval: 60000
    };

    componentDidMount() {
        this.createTimer();
    }

    createTimer = () => {
        this.setState({
            timer: setTimeout(() => {
                this.update();
            }, this.props.interval)
        });
    };

    componentWillUnmount() {
        clearTimeout(this.state.timer);
    }

    update = () => {
        this.forceUpdate();
        this.createTimer();
    };

    render() {
        const { time, hideAgo, style } = this.props;
        return (
            <RkText rkType='secondary2 hintColor' style={style}>
                {this.getJustNow(time)}
            </RkText>
        );
    }

    getJustNow(time) {
        let mmTime = moment.tz(time, 'Asia/Yangon').fromNow();
        if (mmTime === 'a few seconds ago') {
            return 'just now';
        } else {
            return mmTime;
        }
    }
}
