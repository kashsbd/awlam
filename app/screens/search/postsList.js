import React, { PureComponent } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    ActivityIndicator
} from 'react-native';

import {
    PostItem
} from '../social';

import FIcon from 'react-native-vector-icons/FontAwesome';

import { scale } from '../../utils/scale';
import { Color } from '../../utils/color';
import { postUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

export class PostsList extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            //flag for searching posts
            s_loading: false,
            s_refreshing: false,
            posts: [],
            s_total_pages: 1,
            s_page: 1
        }
    }

    searchPosts(query) {
        const { s_page, posts } = this.state;

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        }

        const url = postUrl + '/' + LoggedUserCredentials.getUserId() + '/search' + '?page=' + s_page + '&query=' + query;

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState(
                    {
                        posts: s_page === 1 ? resJson.docs : [...posts, ...resJson.docs],
                        s_total_pages: resJson.pages,
                        s_loading: false,
                        s_refreshing: false,
                    }
                );
            })
            .catch(err => this.setState({
                s_loading: false,
                s_refreshing: false
            }));
    }

    _keyExtractor = (post, index) => post._id + index;


    _onSearchRefresh = () => {
        this.setState({ s_refreshing: true, s_page: 1, s_total_pages: 1 }, () => this.searchPosts(this.props.query));
    }

    _renderSearchFooter = () => {
        const { s_page, s_total_pages } = this.state;

        if (s_page === s_total_pages) return null;

        return (
            <View style={{ flex: 1 }}>
                <ActivityIndicator size='large' color={Color.backgroundColor} />
            </View>
        );
    }

    handleLoadSearchMore = () => {
        const { s_page, s_total_pages } = this.state;

        // check if the current page reaches the last page
        if (s_page < s_total_pages) {
            this.setState({ s_page: s_page + 1 }, () => this.searchPosts(this.props.query));
        }
    }

    renderEmptyView = () => {
        return (
            <View style={styles.centerContent}>
                <FIcon name="feed" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No Posts to show !</Text>
            </View>
        )
    }

    _renderSearchItem = ({ item }) => {
        return (
            <PostItem feed={item} {...this.props} />
        )
    }

    render() {
        const {
            s_loading,
            s_refreshing,
            posts
        } = this.state;


        if (s_loading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={Color.backgroundColor} />
                </View>
            )
        }

        return (
            <View style={styles.root}>
                <FlatList
                    style={{ backgroundColor: '#fff' }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={this.renderEmptyView}
                    initialNumToRender={10}
                    refreshing={s_refreshing}
                    data={posts}
                    renderItem={this._renderSearchItem}
                    keyExtractor={this._keyExtractor}
                    onRefresh={this._onSearchRefresh}
                    ListFooterComponent={this._renderSearchFooter}
                    onEndReached={this.handleLoadSearchMore}
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
        }
    }
)