import React, { Component } from 'react';

import {
    View,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    FlatList
} from 'react-native';

import {
    RkButton
} from 'react-native-ui-kitten';

import ImageLoad from 'react-native-image-placeholder';
import FIcon from 'react-native-vector-icons/FontAwesome';

import {
    FollowerModal,
    FollowingModal,
    EditProfileModal
} from './';

import PhotoView from "@merryjs/photo-viewer";
import { baseUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { PostItem } from '../social/postItem';
import { Color } from '../../utils/color';
import { scale } from '../../utils/scale';
import { Username } from '../../components';

export class Profile extends Component {

    constructor(props) {
        super(props)
        this.state = {
            userData: null,
            posts: [],
            userId: '',
            loading: true,
            refreshing: false,
            follower: [],
            following: [],
            photoModalVisible: false,
            totalPages: 1,
            page: 1,
        }
    }

    static navigationOptions = ({ navigation }) => ({
        title: 'Profile',
        headerStyle: {
            backgroundColor: Color.backgroundColor,
        },
        headerTitleStyle: {
            color: Color.fontColor
        },
        headerLeft: (
            <RkButton
                rkType='clear'
                style={{ width: 40, marginLeft: 8 }}
                onPress={() => navigation.goBack(null)}>
                <FIcon name="arrow-left" size={17} color={Color.fontColor} />
            </RkButton>
        )
    });

    navigate(route) {
        this.props.navigation.navigate(route);
    }

    componentDidMount() {
        const userId = this.props.navigation.state.params.userId;
        this.setState({ userId }, () => this.getData());
    }

    getData() {
        const { page, posts, userId } = this.state;

        const url = baseUrl + '/users/' + userId + '/posts?page=' + page;

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET'
        }

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState(
                    {
                        posts: page === 1 ? resJson.posts.docs : [...posts, ...resJson.posts.docs],
                        userData: resJson.user,
                        totalPages: resJson.posts.pages,
                        loading: false,
                        refreshing: false
                    }
                );
            })
            .catch(err => this.setState({
                refreshing: false
            }));
    }

    renderEmptyView = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <FIcon name="feed" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No posts to show !</Text>
            </View>
        )
    }

    _showFollowers = () => {
        this.followerModal.open();
    }

    _showFollowings = () => {
        this.followingModal.open();
    }

    _onEditPressed = () => {
        this.editProfileModal.open();
    }

    renderListHeader = () => {
        let { userData, userId } = this.state;
        const userName = userData.name;

        return (
            <View style={{ backgroundColor: Color.fontColor }}>
                <View style={{ flexDirection: 'column', margin: 15 }}>
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={this._showProfilePhoto} style={{ flex: 0.4, marginTop: 10 }}>
                            <ImageLoad
                                style={styles.avatar}
                                source={{ uri: baseUrl + '/users/' + userId + '/profile_pic' }}
                                placeholderSource={require('../../assets/images/avator.png')}
                                isShowActivity={false}
                            />
                        </TouchableOpacity>
                        <View style={{ flex: 0.6, paddingTop: 5 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity onPress={this._showFollowers} >
                                    <View >
                                        <Text style={{ alignSelf: 'center' }} >{userData.followers.length} </Text>
                                        <Text style={styles.txtStyle}>followers</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this._showFollowings}>
                                    <View>
                                        <Text style={{ alignSelf: 'center' }}>{userData.followings.length} </Text>
                                        <Text style={styles.txtStyle}>followings</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ marginHorizontal: 10, marginTop: 10 }}>
                                {this._renderMultiButton()}
                            </View>
                        </View>
                    </View>
                    <View style={{ marginLeft: 20, marginTop: 15 }}>
                        <Text style={{ color: Color.backgroundColor, fontWeight: '400', fontSize: 17 }}>
                            <Username name={userName} role={userData.role} />
                        </Text>
                    </View>
                </View>
            </View>
        )
    }

    _showProfilePhoto = () => this.setState({ photoModalVisible: true });

    _closeProfilePhoto = () => this.setState({ photoModalVisible: false });

    _renderItem = (eachPost) => {
        const post = eachPost.item;

        return (
            <PostItem feed={post} {...this.props} />
        )
    }

    _keyExtractor = (post, index) => post._id + index;

    _onRefresh = () => {
        this.setState({ refreshing: true, page: 1, totalPages: 1 }, () => this.getData());
    }

    _renderFooter = () => {
        const { page, totalPages } = this.state;

        if (page === totalPages) return null;

        return (
            <View style={{ flex: 1 }}>
                <ActivityIndicator size='large' color={Color.backgroundColor} />
            </View>
        );
    }

    handleLoadMore = () => {
        const { page, totalPages } = this.state;

        // check if the current page reaches the last page
        if (page < totalPages) {
            this.setState({ page: page + 1 }, () => this.getData());
        }
    }

    _setFollowerModalRef = ref => this.followerModal = ref;

    _setFollowingModalRef = ref => this.followingModal = ref;

    _setEditProfileModalRef = ref => this.editProfileModal = ref;

    _onFollowPressed = () => {
        const data = { followerId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        };

        const url = baseUrl + '/users/' + this.state.userId + '/follow';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));

        this._onRefresh();
    }

    _onUnFollowedPressed = () => {
        const data = { followerId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        };

        const url = baseUrl + '/users/' + this.state.userId + '/unfollow';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));

        this._onRefresh();
    }

    _renderMultiButton() {
        const { userId, userData } = this.state;
        const index = userData.followers.indexOf(LoggedUserCredentials.getUserId());

        let text;
        let cb;

        if (userId === LoggedUserCredentials.getUserId()) {
            text = 'Edit Profile';
            cb = this._onEditPressed;
        } else if (index > -1) {
            text = 'Unfollow';
            cb = this._onUnFollowedPressed;
        } else {
            text = 'Follow';
            cb = this._onFollowPressed;
        }

        return (
            <TouchableOpacity
                style={styles.btn}
                onPress={cb}
            >
                <Text style={{ textAlign: 'center', marginTop: 4, color: Color.backgroundColor }}>{text}</Text>
            </TouchableOpacity>
        );
    }

    render() {
        let {
            userId,
            loading,
            photoModalVisible,
            posts,
            refreshing
        } = this.state;

        let photo = [{
            source: { uri: baseUrl + '/users/' + userId + '/profile_pic' }
        }];

        if (loading) {
            return (
                <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                    <ActivityIndicator size="large" color={Color.backgroundColor} />
                </View>
            )
        }

        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListHeaderComponent={this.renderListHeader}
                    ListEmptyComponent={this.renderEmptyView}
                    initialNumToRender={10}
                    refreshing={refreshing}
                    data={posts}
                    renderItem={this._renderItem}
                    keyExtractor={this._keyExtractor}
                    onRefresh={this._onRefresh}
                    ListFooterComponent={this._renderFooter}
                    onEndReached={this.handleLoadMore}
                    onEndReachedThreshold={0.5}
                />
                <PhotoView
                    visible={photoModalVisible}
                    data={photo}
                    hideStatusBar={true}
                    hideCloseButton={true}
                    hideShareButton={true}
                    onDismiss={this._closeProfilePhoto}
                />
                <FollowerModal
                    ref={this._setFollowerModalRef}
                    userId={userId}
                />
                <FollowingModal
                    ref={this._setFollowingModalRef}
                    userId={userId}
                />
                <EditProfileModal
                    ref={this._setEditProfileModalRef}
                    userId={userId}
                    refresh={this._onRefresh}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        overflow: 'hidden',
        marginLeft: 10,
        borderWidth: 1
    },
    imageContainer: {
        flexDirection: 'row'
    },
    txtStyle: {
        color: Color.backgroundColor,
        fontSize: 16
    },
    btn: {
        backgroundColor: Color.fontColor,
        borderColor: Color.backgroundColor,
        borderWidth: 1,
        borderRadius: 5,
        height: 35
    }
})
