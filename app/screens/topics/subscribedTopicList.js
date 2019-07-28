import React, { PureComponent } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    Text
} from 'react-native';

import FIcon from 'react-native-vector-icons/FontAwesome';

import {
    TopicItem
} from './components';

import { topicUrl } from '../../utils/globle';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { Color } from '../../utils/color';

export class SubscribedTopicList extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            loading: true,
            posts: [],
            page: 1,
            totalPages: 1
        }
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        const { page, posts } = this.state;

        const url = topicUrl + '/subscribed/' + LoggedUserCredentials.getUserId() + '?page=' + page;

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
                        posts: page === 1 ? resJson.docs : [...posts, ...resJson.docs],
                        totalPages: resJson.pages,
                        loading: false,
                        refreshing: false
                    }
                );
            })
            .catch(err => this.setState({
                loading: false,
                refreshing: false
            }));
    }

    _onRefresh = () => {
        this.setState({ refreshing: true, page: 1, totalPages: 1 }, () => this.getData());
    }

    renderEmptyView = () => {
        return (
            <View style={styles.centerLoading}>
                <FIcon name="feed" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No posts to show !</Text>
            </View>
        )
    }

    _renderItem = ({ item }) => {
        return (
            <TopicItem feed={item} {...this.props} />
        )
    }

    _renderFooter = () => {
        const { page, totalPages } = this.state;

        if (page === totalPages) return null;

        return (
            <View style={styles.root}>
                <ActivityIndicator size='large' color={Color.backgroundColor} />
            </View>
        );
    }

    _keyExtractor = (post, index) => post._id + index;

    handleLoadMore = () => {
        const { page, totalPages } = this.state;

        // check if the current page reaches the last page
        if (page < totalPages) {
            this.setState({ page: page + 1 }, () => this.getData());
        }
    }

    _captureRef = ref => this.flatListRef = ref;

    render() {
        const { refreshing, posts, loading } = this.state;

        return (
            <View style={styles.root}>
                {
                    loading ?
                        <View style={styles.centerLoading}>
                            <ActivityIndicator size={scale(50)} color={Color.backgroundColor} />
                        </View>
                        :
                        <View style={styles.root}>
                            <FlatList
                                ref={this._captureRef}
                                keyboardShouldPersistTaps={'handled'}
                                keyboardDismissMode="on-drag"
                                contentContainerStyle={{ flexGrow: 1 }}
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
                }
            </View>
        )
    }
}

const styles = StyleSheet.create(
    {
        root: {
            flex: 1
        },
        centerLoading: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }
    }
)