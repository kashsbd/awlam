import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    BackHandler
} from 'react-native';

import {
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';
import Orientation from 'react-native-orientation';
import Toast from 'react-native-another-toast';

import { baseUrl } from '../../utils/globle';
import { scale, scaleVertical } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { PostItem } from './postItem';
import { Color } from '../../utils/color';


export class FollowerPostList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            //selected feed id
            feedId: null,
            //initial datas
            feeds: [],
            //flags to show loading sign
            feedsLoading: false,
            refreshing: false,
            footerLoading: false,
            //flag to show reload page
            showReloadPage: false,
            //different modals
            photoModalVisible: false,
            videoModalVisible: false,
            replyModalVisible: false,
            //media(video or image) path 
            mediaPaths: [],
            videoPath: null,
            selectedMediaIndex: null,
            page: 1,
            hasNext: false,
            showToast: false,
            ssePosts: []
        };
    }

    onClose = () => {
        this.setState({ showToast: false });
    }

    scrollToTop(post) {
        const { feeds } = this.state;
        const temp = JSON.parse(post);
        if (temp !== null || temp !== undefined) {
            const uploadedPost = [temp];
            this.setState({ feeds: [...uploadedPost, ...feeds] });
            if (feeds.length > 0) {
                this.refs.flatListRef.scrollToIndex({ animated: true, index: 0 });
            }
        }
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        this.setState({ feedsLoading: true }, () => this.getData());
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleLoadMore = () => {
        const { hasNext } = this.state;
        if (hasNext) {
            this.setState({ page: this.state.page + 1, footerLoading: true }, () => this.getData());
        }
    }

    getData() {
        const { page } = this.state;

        const form_data = {
            userId: LoggedUserCredentials.getUserId()
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(form_data)
        }

        const url = baseUrl + '/posts/getFollowerPosts?page=' + page;

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState({
                    feeds: page === 1 ? resJson.docs : [...this.state.feeds, ...resJson.docs],
                    hasNext: resJson.pages > page,
                    feedsLoading: false,
                    showReloadPage: false,
                    refreshing: false,
                    footerLoading: false
                });
            })
            .catch(err => this.setState({
                showReloadPage: true,
                refreshing: false,
                footerLoading: false
            }));
    }

    onToastTap = () => {
        const { ssePosts, feeds } = this.state;
        this.setState({ feeds: [...ssePosts, ...feeds], showToast: false }, () => this.toast.closeToast());
        if (feeds.length > 0) {
            this.refs.flatListRef.scrollToIndex({ animated: true, index: 0 });
        }
    }


    _keyExtractor = (feed, index) => feed._id;

    handleBackPress = () => {
        const { page } = this.state;
        if (page === 1) {
            return false;
        } else {
            this.onRefresh();
            this.refs.flatListRef.scrollToIndex({ animated: true, index: 0 });
            return true;
        }
    }

    onRefresh = () => {
        this.setState({ refreshing: true, page: 1 });
        setTimeout(() => {
            this.getData();
            this.setState({ refreshing: false });
        }, 1000);
    }

    _renderItem = (eachFeed) => {
        const feed = eachFeed.item;
        return (
            <PostItem feed={feed} {...this.props} />
        )
    }

    renderNoFeeds() {
        return (
            <View style={styles.centerLoading}>
                <Icon name="feed" size={50} style={{ color: Color.backgroundColor }} />
                <RkText style={{ color: Color.backgroundColor }}>No posts to show !</RkText>
                <RkText style={{ color: Color.backgroundColor }}>Please follow pet lover friends.</RkText>
            </View>
        )
    }

    renderFooterComponent = () => {
        const { footerLoading } = this.state;
        if (footerLoading) {
            return (
                <ActivityIndicator animating size='large' color='#ECC951' />
            )
        } else return null;
    }

    tapToRetryBtnPress() {
        this.setState({ feedsLoading: true, showReloadPage: false });
        setTimeout(() => this.getData(), 1000);
    }

    render() {
        const {
            feeds,
            feedsLoading,
            refreshing,
            showReloadPage,
            showToast
        } = this.state;

        if (showReloadPage) {
            return (
                <RkButton
                    rkType='clear'
                    onPress={() => this.tapToRetryBtnPress()}
                    style={styles.centerLoading}
                >
                    <View>
                        <Icon name="wifi" size={50} style={{ marginLeft: scale(28), color: Color.backgroundColor }} />
                        <RkText style={{ color: Color.backgroundColor }}>Can't Connect !</RkText>
                        <View style={{ flexDirection: 'row', marginLeft: scale(19) }}>
                            <Icon name="refresh" size={15} style={{ lineHeight: scale(20), marginRight: scale(5), color: Color.backgroundColor }} />
                            <Text style={{ color: Color.backgroundColor }}>Tap to Retry</Text>
                        </View>
                    </View>
                </RkButton>
            )
        }

        return (
            <View style={{ flex: 1 }} >
                {
                    !feedsLoading ?
                        feeds && feeds.length === 0 ?
                            this.renderNoFeeds()
                            :
                            <FlatList
                                ref="flatListRef"
                                keyboardShouldPersistTaps={'handled'}
                                keyboardDismissMode="on-drag"
                                data={feeds}
                                removeClippedSubviews={true}
                                renderItem={this._renderItem}
                                keyExtractor={this._keyExtractor}
                                style={styles.container}
                                refreshing={refreshing}
                                onRefresh={this.onRefresh}
                                ListFooterComponent={this.renderFooterComponent}
                                onEndReached={this.handleLoadMore}
                                onEndReachedThreshold={0.5}
                            />
                        :
                        <View style={styles.centerLoading}>
                            <ActivityIndicator size={50} color={Color.backgroundColor} />
                        </View>
                }
                <Toast
                    ref={ref => this.toast = ref}
                    text='New Posts Available !'
                    showToast={showToast}
                    autoClose={false}
                    onToastTap={this.onToastTap}
                    onClose={this.onClose}
                />
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
        card: {
            marginVertical: 8,
            backgroundColor: '#191e1f',
            marginHorizontal: scaleVertical(10)
        },
        avatar: {
            marginRight: 16,
            width: 60,
            height: 60,
            borderRadius: 30,
            overflow: 'hidden'
        },
        menuBtn: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            marginTop: 5
        },
        imgBackground: {
            flex: 1,
            width: null,
            height: null
        },
        paginationStyle: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            marginRight: 15
        },
        activeDot: {
            backgroundColor: '#ECC951',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3
        },
        dot: {
            backgroundColor: '#191e1f',
            width: 5,
            height: 5,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3
        },
        imageStyle: {
            width: null,
            height: scale(270),
            resizeMode: "cover"
        },
        modalContainer: {
            backgroundColor: 'rgba(0,0,0,0.9)'
        },
        videoContainer: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: '#191e1f',
            paddingBottom: scaleVertical(25)
        },
        hashTagContainer: {
            paddingHorizontal: 15,
            paddingBottom: 15
        },
        badge: {
            fontSize: 10,
            width: scale(23),
            height: scale(23),
            color: '#fff',
            textAlign: 'center',
            textAlignVertical: 'center',
            position: 'absolute',
            zIndex: 10,
            bottom: 30,
            right: 8,
            padding: 2,
            backgroundColor: 'red',
            borderRadius: scale(23 / 2)
        }
    }
);
