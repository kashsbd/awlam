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
import { Username } from '../../../components';
const _ = require('lodash');

export class EachPeople extends Component {
    constructor(props) {
        super(props);
        const index = _.findIndex(props.selected_user, { _id: props.user._id });
        this.state = {
            isSelected: index === -1 ? false : true,
        }
    }

    _onSelect() {
        const { onSelect, user } = this.props;
        this.setState({ isSelected: true }, () => onSelect && onSelect({ _id: user._id, name: user.name }));
    }

    _onUnSelect() {
        const { onUnSelect, user } = this.props;
        this.setState({ isSelected: false }, () => onUnSelect && onUnSelect({ _id: user._id, name: user.name }));
    }

    _gotoProfile = () => {
        const { user, navigation } = this.props;
        navigation.navigate('MainProfile', { userId: user._id });
    }

    _onPress = () => {
        const { isSelected } = this.state;
        if (isSelected) {
            this._onUnSelect();
        } else {
            this._onSelect();
        }
    }

    render() {
        const { isSelected } = this.state;
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
                </View>
                <View style={styles.rightContainer} >
                    <TouchableOpacity
                        onPress={this._onPress}
                        style={styles.btnStyle}
                    >
                        <View>
                            <Text style={{ fontWeight: '800', marginBottom: 3 }}>
                                <Username name={user.name} role={user.role} />
                            </Text>
                            <Text>{followerText}</Text>
                        </View>
                        <View style={styles.iconContainer}>
                            {
                                isSelected && <Icon name='check-circle' size={25} />
                            }
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        height: scale(80),
        flexDirection: 'row',
        backgroundColor: Color.fontColor,
        marginTop: 5
    },
    leftContainer: {
        flexDirection: 'row',
        marginLeft: 5,
        flex: 0.24
    },
    rightContainer: {
        justifyContent: 'center',
        flex: 0.75
    },
    avatar: {
        width: scale(80),
        height: scale(80),
        overflow: 'hidden'
    },
    btnStyle: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    iconContainer: {
        justifyContent: 'center'
    }
})