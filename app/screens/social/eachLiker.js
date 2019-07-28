import React, { PureComponent } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

import ImageLoad from 'react-native-image-placeholder';

import { Color } from '../../utils/color';
import { baseUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { Username } from '../../components';

export default class EachLiker extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            status: props.status
        }
    }

    _followUser() {
        const { userId } = this.props;

        const data = { followerId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        };

        const url = baseUrl + '/users/' + userId + '/follow';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    _unfollowUser() {
        const { userId } = this.props;

        const data = { followerId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        };

        const url = baseUrl + '/users/' + userId + '/unfollow';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    _onPress = () => {
        const { status } = this.state;
        switch (status) {
            case 'Follow': {
                this.setState({ status: 'Unfollow' });
                this._followUser();
                break;
            }
            case 'Unfollow': {
                this.setState({ status: 'Follow' });
                this._unfollowUser();
                break;
            }
        }
    }

    render() {
        const { userId, name, role } = this.props;

        return (
            <View style={styles.container}>
                <View style={{ flexDirection: 'row' }}>
                    <ImageLoad
                        style={styles.avatar}
                        source={{ uri: baseUrl + '/users/' + userId + '/profile_pic' }}
                        placeholderSource={require('../../assets/images/avator.png')}
                        isShowActivity={false}
                    />
                    <Text style={{ color: 'black', marginTop: 20, fontWeight: '500', marginRight: 10 }}>
                        <Username name={name} role={role} />
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={this._onPress}
                    style={styles.btnStyle}
                >
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Text style={{ color: 'white' }}>{this.state.status}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create(
    {
        container: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            margin: 2,
            paddingHorizontal: 5,
            backgroundColor: Color.fontColor
        },
        avatar: {
            width: 60,
            height: 60,
            borderRadius: 30,
            overflow: 'hidden',
            marginRight: 5
        },
        btnStyle: {
            alignSelf: 'center',
            width: 100,
            height: 30,
            borderRadius: 30,
            backgroundColor: Color.backgroundColor
        }
    }
)