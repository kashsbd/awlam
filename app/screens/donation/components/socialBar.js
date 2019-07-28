import React from 'react';
import {
    View,
    StyleSheet
} from 'react-native';

import {
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';
import Share from 'react-native-share';

import { scale } from '../../../utils/scale';
import { donationUrl, baseUrl } from '../../../utils/globle';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';
import { Color } from '../../../utils/color';

export class SocialBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isInterested: props.interested.includes(LoggedUserCredentials.getUserId()),
        }
    }

    onToggleInterest = () => {
        const { isInterested } = this.state;

        if (isInterested) {
            this.setState({ isInterested: false }, () => this.onInterestBtnUnClick());
        } else {
            this.setState({ isInterested: true }, () => this.onInterestBtnClick());
        }
    }

    onInterestBtnClick() {
        const { did } = this.props;

        const data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        const url = donationUrl + '/' + did + '/interested';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    onInterestBtnUnClick() {
        const { did } = this.props;

        const data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        const url = donationUrl + '/' + did + '/uninterested';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    onShare = () => {
        const { did } = this.props;

        let shareOptions = {
            title: "Awlam",
            url: baseUrl + '/web/events/' + did,
            subject: "Awlam Post" //  for email
        };

        Share.open(shareOptions);
    }

    render() {
        const { isInterested } = this.state;

        return (
            <View style={styles.container}>

                <View style={styles.section}>
                    <RkButton
                        rkType='clear'
                        hitSlop={{ top: 30, bottom: 30, left: 40, right: 40 }}
                        onPress={this.onToggleInterest}
                    >
                        <Icon
                            name={isInterested ? 'star' : 'star-o'}
                            style={[styles.iconStyle, { color: isInterested ? Color.backgroundColor : 'black' }]}
                        />

                        <RkText rkType='primary4' style={[{ marginLeft: 5 }, { color: isInterested ? Color.backgroundColor : 'black' }]} >
                            Interested
                        </RkText>

                    </RkButton>
                </View>

                <View style={styles.section}>
                    <RkButton
                        rkType='clear'
                        hitSlop={{ top: 30, bottom: 30, left: 40, right: 40 }}
                        onPress={this.onShare}
                    >
                        <Icon name='share' size={scale(20)} />
                        <RkText rkType='primary4' style={{ marginLeft: 5 }} >
                            Share
                        </RkText>
                    </RkButton>
                </View>

            </View>
        )
    }
}

let styles = StyleSheet.create(
    {
        container: {
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
            padding: 8
        },
        section: {
            justifyContent: 'center',
            flexDirection: 'row',
            flex: 1,
            height: scale(33)
        },
        iconStyle: {
            fontSize: 20
        }
    }
)
