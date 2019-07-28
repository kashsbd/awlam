import React, { PureComponent } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    FlatList
} from 'react-native';

import { topicUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { Color } from '../../utils/color';

import {
    TopicItem,
    InvitedListHeaderComponent
} from './components';

export class InvitedTopicList extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            userPrivateTopicList: [],
            posts: [],
            loading: false,
            refreshing: false,
            totalPages: 1,
            page: 1,
        }
    }

    componentDidMount() {
        this.setState({ loading: true }, () => this.getData());
    }

    getData() {
        const { page, posts } = this.state;

        const url = topicUrl + '/invited/' + LoggedUserCredentials.getUserId() + '?page=' + page;

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
                        userPrivateTopicList: resJson.userPrivateTopic,
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

    renderListHeader = () => {
        const { userPrivateTopicList } = this.state;
        if (userPrivateTopicList && userPrivateTopicList.length > 0) {
            return (
                <InvitedListHeaderComponent
                    posts={userPrivateTopicList}
                    key={userPrivateTopicList.length}
                    {...this.props}
                />
            )
        }

        return <View />;
    }

    _renderItem = ({ item, index }) => {
        if (index === 0) {
            return (
                <>
                    <View>
                        <Text style={styles.titleStyle}>Invited Topics</Text>
                    </View>
                    <TopicItem feed={item} {...this.props} />
                </>
            )
        }
        return (
            <TopicItem feed={item} {...this.props} />
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
            <View style={styles.root}>
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

    render() {
        let {
            loading,
            posts,
            refreshing
        } = this.state;

        if (loading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={Color.backgroundColor} />
                </View>
            )
        }

        return (
            <View style={styles.root}>
                <FlatList
                    keyboardShouldPersistTaps={'handled'}
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListHeaderComponent={this.renderListHeader}
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
        );
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
        titleStyle: {
            fontSize: 17,
            fontWeight: '500',
            marginLeft: 5
        }
    }
)