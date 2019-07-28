import React, { PureComponent } from 'react';

import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity
} from 'react-native';

import { CitizenItem, SubCitizenItem } from './components';

import { RkButton } from 'react-native-ui-kitten';
import FIcon from 'react-native-vector-icons/FontAwesome';
import ImageLoad from 'react-native-image-placeholder';

import { Color } from '../../utils/color';
import { citizenUrl, baseUrl } from '../../utils/globle';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

export class SubCitizenPostList extends PureComponent {

    static navigationOptions = ({ navigation }) => ({
        title: 'Citizen Sub Posts',
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

    constructor(props) {
        super(props);
        this.state = {
            headerData: null,
            cid: '',
            posts: [],
            refreshing: false,
            loading: true,
            totalPages: 1,
            page: 1,
        }
    }


    componentDidMount() {
        const cid = this.props.navigation.state.params.cid;
        this.setState({ cid }, () => this.getData());
    }

    getData() {
        const { page, posts, cid } = this.state;

        const url = citizenUrl + '/' + cid + '/subposts?page=' + page;

        const config = {
            headers: {
                'Content-Type': 'application/json',
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
                        totalPages: resJson.posts.pages,
                        headerData: resJson.headerData,
                        loading: false,
                        refreshing: false
                    }
                );
            })
            .catch(err => this.setState({
                refreshing: false,
                loading: false
            }));
    }

    renderEmptyView = () => {
        return (
            <View style={styles.centerContent}>
                <FIcon name="feed" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No sub posts to show !</Text>
            </View>
        )
    }

    renderListHeader = () => {
        const { headerData } = this.state;
        return (
            <View>
                <TouchableOpacity onPress={this._navigate}>
                    <View style={{ flexDirection: 'row', backgroundColor: Color.fontColor, height: scale(70) }}>
                        <View style={{ flex: 0.2, paddingLeft: 20, justifyContent: 'center' }}>
                            <ImageLoad
                                style={styles.avatar}
                                source={{ uri: baseUrl + '/users/' + LoggedUserCredentials.getUserId() + '/profile_pic' }}
                                placeholderSource={require('../../assets/images/avator.png')}
                                isShowActivity={false}
                            />
                        </View>
                        <View style={{ flex: 0.7, justifyContent: 'center' }}>
                            <View style={{ borderWidth: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center', height: scale(35) }}>
                                <Text>What's on your mind ?</Text>
                            </View>
                        </View>
                        <View style={{ flex: 0.2, marginLeft: 10, justifyContent: 'center' }}>
                            <FIcon name="picture-o" size={scale(25)} style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray', fontSize: 13 }}>Photo</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <CitizenItem
                    feed={headerData}
                    showMoreBtn={false}
                    {...this.props}
                />
            </View>
        );
    }

    _renderItem = (eachPost) => {
        const post = eachPost.item;

        return (
            <SubCitizenItem feed={post} {...this.props} />
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

    updatePost = (post) => {
        if (post) {
            const uploadedPost = [post];
            this.setState(prevState =>
                (
                    { posts: [...uploadedPost, ...prevState.posts] }
                )
            );
            if (this.state.posts.length > 0) {
                // this.flatListRef.scrollToIndex({ animated: true, index: 0 });
                this.flatListRef.scrollToOffset({ x: 0, y: 0, animated: true });
            }
        }
    }

    _navigate = () => {
        this.props.navigation.navigate('CreateCitizenPost', { 'updatePost': this.updatePost, 'cid': this.state.cid });
    }

    _captureRef = ref => this.flatListRef = ref;

    render() {
        const {
            loading,
            refreshing,
            posts
        } = this.state;

        if (loading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={Color.backgroundColor} />
                </View>
            )
        }

        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    ref={this._captureRef}
                    keyboardShouldPersistTaps={'handled'}
                    keyboardDismissMode="on-drag"
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
            </View>
        )
    }
}

const styles = StyleSheet.create(
    {
        root: {
            flex: 1
        },
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        avatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
            overflow: 'hidden'
        },
    }
)