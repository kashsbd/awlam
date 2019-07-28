import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity
} from 'react-native';

import {
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';
import EIcon from 'react-native-vector-icons/Entypo';

import { baseUrl } from '../../utils/globle';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { GovernmentItem } from './components';
import { Color } from '../../utils/color';

export class GovernmentList extends React.PureComponent {

    static navigationOptions = ({ navigation }) => ({
        title: 'Government Posts',
        headerStyle: {
            backgroundColor: Color.backgroundColor,
            elevation: 0
        },
        headerTitleStyle: {
            color: Color.fontColor
        },
        headerLeft: (
            <RkButton
                rkType='clear'
                style={{ width: 40, marginLeft: 8 }}
                onPress={navigation.openDrawer}
            >
                <Icon name='bars' size={20} color={Color.fontColor} />
            </RkButton>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            //initial datas
            posts: [],
            //flags to show loading sign
            postsLoading: false,
            refreshing: false,
            //flag to show reload page
            showReloadPage: false,
            totalPages: 1,
            page: 1
        };
    }

    componentDidMount() {
        this.setState({ postsLoading: true }, () => this.getData());
    }

    getData() {
        const { page, posts } = this.state;

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        }

        const url = baseUrl + '/governments/getAllPosts?page=' + page;

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState(
                    {
                        posts: page === 1 ? resJson.docs : [...posts, ...resJson.docs],
                        totalPages: resJson.pages,
                        postsLoading: false,
                        showReloadPage: false,
                        refreshing: false
                    }
                );
            })
            .catch(err => this.setState({
                showReloadPage: true,
                refreshing: false
            }));
    }

    _keyExtractor = (post, index) => post._id + index;

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
        this.props.navigation.navigate('CreateGovernment', { 'updatePost': this.updatePost });
    }

    _onRefresh = () => {
        this.setState({ refreshing: true, page: 1, totalPages: 1 }, () => this.getData());
    }

    _renderItem = (eachPost) => {
        const post = eachPost.item;

        return (
            <GovernmentItem feed={post} {...this.props} />
        )
    }

    onClose = () => this.setState({ showToast: false });

    _renderFooter = () => {
        const { page, totalPages } = this.state;

        if (page === totalPages) return null;

        return (
            <View style={{ flex: 1 }}>
                <ActivityIndicator size='large' color={Color.backgroundColor} />
            </View>
        );
    }

    tapToRetryBtnPress() {
        this.setState({ postsLoading: true, showReloadPage: false });
        setTimeout(() => this.getData(), 1000);
    }

    setListRef = (ref) => {
        this.flatListRef = ref;
    };

    renderEmptyView = () => {
        return (
            <View style={styles.centerLoading}>
                <Icon name="feed" size={scale(50)} style={{ color: Color.backgroundColor }} />
                <RkText style={{ color: Color.backgroundColor }}>No posts to show !</RkText>
            </View>
        )
    }

    render() {
        const {
            posts,
            postsLoading,
            refreshing,
            showReloadPage,
        } = this.state;

        if (showReloadPage) {
            return (
                <RkButton
                    rkType='clear'
                    onPress={() => this.tapToRetryBtnPress()}
                    style={styles.centerLoading}
                >
                    <View>
                        <Icon name="wifi" size={scale(50)} style={{ marginLeft: scale(28), color: Color.backgroundColor }} />
                        <RkText style={{ color: Color.backgroundColor }}>Can't Connect !</RkText>
                        <View style={{ flexDirection: 'row', marginLeft: scale(19) }}>
                            <Icon name="refresh" size={scale(15)} style={{ lineHeight: scale(20), marginRight: scale(5), color: Color.backgroundColor }} />
                            <Text style={{ color: Color.backgroundColor }}>Tap to Retry</Text>
                        </View>
                    </View>
                </RkButton>
            )
        }


        return (
            <View style={{ flex: 1 }} >
                {
                    !postsLoading ?
                        <View style={{ flex: 1 }} >
                            <FlatList
                                ref={this.setListRef}
                                contentContainerStyle={{ flexGrow: 1 }}
                                keyboardShouldPersistTaps={'handled'}
                                keyboardDismissMode="on-drag"
                                ListEmptyComponent={this.renderEmptyView}
                                initialNumToRender={10}
                                data={posts}
                                renderItem={this._renderItem}
                                keyExtractor={this._keyExtractor}
                                style={styles.container}
                                refreshing={refreshing}
                                onRefresh={this._onRefresh}
                                ListFooterComponent={this._renderFooter}
                                onEndReached={this.handleLoadMore}
                                onEndReachedThreshold={0.5}
                            />
                        </View>
                        :
                        <View style={styles.centerLoading}>
                            <ActivityIndicator size={scale(50)} color={Color.backgroundColor} />
                        </View>

                }

                {/* fab button */}
                <TouchableOpacity
                    onPress={this._navigate}
                    style={styles.fabButton}
                >
                    <EIcon name="plus" style={{ color: Color.fontColor, fontSize: 30, margin: 5 }} />
                </TouchableOpacity>
            </View>
        )
    }
}

let styles = StyleSheet.create(
    {
        centerLoading: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        container: {
            paddingVertical: 8
        },
        fabButton: {
            position: 'absolute',
            bottom: 15,
            right: 10,
            width: 60,
            height: 60,
            backgroundColor: Color.backgroundColor,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 2
        },
    }
);