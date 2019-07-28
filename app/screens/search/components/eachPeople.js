import React, { PureComponent } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet
} from 'react-native';

import {
    Username
} from '../../../components';

import ImageLoad from 'react-native-image-placeholder';

import { scale, scaleVertical } from '../../../utils/scale';
import { baseUrl } from '../../../utils/globle';
import { Color } from '../../../utils/color';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';

export class EachPeople extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isFollowed: false
        }
    }

    _onFollow = () => {
        this.setState({ isFollowed: true });
        const data = { followerId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        };

        const url = baseUrl + '/users/' + this.props.user._id + '/follow';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    _onDelete = () => this.props.onRemove();

    _gotoProfile = () => {
        const { user, navigation } = this.props;
        navigation.navigate('MainProfile', { userId: user._id });
    }

    render() {
        const { user } = this.props;

        return (
            <View style={styles.root}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity onPress={this._gotoProfile}>
                        <ImageLoad
                            style={styles.avatar}
                            source={{ uri: baseUrl + '/users/' + user._id + '/profile_pic' }}
                            placeholderSource={require('../../../assets/images/avator.png')}
                            isShowActivity={false}
                        />
                    </TouchableOpacity>
                </View>
                {
                    !this.state.isFollowed
                        ?
                        <View style={styles.rightContainer}>
                            <Text style={{ fontWeight: '800', marginBottom: 7 }}>
                                <Username name={user.name} role={user.role} />
                            </Text>
                            <View style={styles.btnContainer}>
                                <TouchableOpacity
                                    style={styles.followBtnStyle}
                                    onPress={this._onFollow}
                                >
                                    <Text style={[styles.txtStyle, { color: '#fff' }]}>Follow</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteBtnStyle}
                                    onPress={this._onDelete}
                                >
                                    <Text style={styles.txtStyle}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        :
                        <View style={styles.rightContainer}>
                            <Text style={{ fontWeight: '700', fontSize: 16 }}>{'You have followed ' + user.name + '.'}</Text>
                        </View>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        height: scale(100),
        flexDirection: 'row',
        backgroundColor: Color.fontColor,
        marginTop: 5
    },
    leftContainer: {
        flex: 0.3
    },
    rightContainer: {
        flex: 0.7,
        justifyContent: 'center',
        paddingLeft: 10
    },
    btnContainer: {
        flexDirection: 'row',
    },
    followBtnStyle: {
        width: scale(110),
        height: scale(35),
        backgroundColor: Color.backgroundColor,
        marginRight: 10
    },
    deleteBtnStyle: {
        width: scale(110),
        height: scale(35),
        borderWidth: 1,
        borderColor: Color.backgroundColor
    },
    txtStyle: {
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingTop: scaleVertical(7)
    },
    avatar: {
        width: scale(100),
        height: scale(100),
        overflow: 'hidden'
    },
})