import React, { Component } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet
} from 'react-native';

import ImageLoad from 'react-native-image-placeholder';
import Icon from 'react-native-vector-icons/FontAwesome';

import { scale } from '../../../utils/scale';
import { baseUrl } from '../../../utils/globle';
import { Color } from '../../../utils/color';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';

export class EachSearchPeople extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFollowed: props.user.followerLists.includes(LoggedUserCredentials.getUserId()),
            isFollowBtnPressed: false
        }
    }

    _onFollow = () => {
        this.setState({ isFollowBtnPressed: true });
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
        const { isFollowBtnPressed, isFollowed } = this.state;
        const { user } = this.props;
        let followerText = '';
        const followerCount = user.followerLists.length;

        if (followerCount === 1) {
            followerText = followerCount + ' follower';
        } else if (followerCount > 1) {
            followerText = followerCount + ' followers';
        }

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
                    {
                        isFollowBtnPressed ?
                            <View style={{ justifyContent: 'center', marginLeft: 7 }}>
                                <Text style={{ fontWeight: '700' }}>You followed {user.name}.</Text>
                            </View>
                            :
                            <View style={{ justifyContent: 'center', marginLeft: 7 }}>
                                <Text style={{ fontWeight: '800', marginBottom: 3 }}>{user.name}</Text>
                                <Text>{followerText}</Text>
                            </View>
                    }
                </View>

                <View style={styles.rightContainer} >
                    {
                        isFollowed || user._id === LoggedUserCredentials.getUserId() || isFollowBtnPressed ?
                            null
                            :
                            <TouchableOpacity
                                style={styles.btnStyle}
                                onPress={this._onFollow}
                            >
                                <Icon name='user' size={25} />
                            </TouchableOpacity>
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        height: scale(80),
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: Color.fontColor,
        marginTop: 5
    },
    leftContainer: {
        flexDirection: 'row',
        marginLeft: 5
    },
    rightContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatar: {
        width: scale(80),
        height: scale(80),
        overflow: 'hidden'
    },
    btnStyle: {
        marginRight: 20,
    }
})