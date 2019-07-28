import React, { PureComponent } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    ActivityIndicator
} from 'react-native';

import {
    EachPeople,
    EachSearchPeople
} from './components';

import FIcon from 'react-native-vector-icons/FontAwesome';

import { scale } from '../../utils/scale';
import { Color } from '../../utils/color';
import { baseUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

export class PeopleList extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            //flag for people suggestion
            loading: false,
            refreshing: false,
            showSearchedResult: false,
            //flag for searching people
            s_loading: false,
            s_refreshing: false,
            posts: [],
            people: [],
            totalPages: 1,
            page: 1,
            s_total_pages: 1,
            s_page: 1
        }
    }

    componentDidMount() {
        this.setState({ loading: true }, () => this.getData());
    }

    getData() {
        const { page, posts } = this.state;

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        }

        const url = baseUrl + '/users/' + LoggedUserCredentials.getUserId() + '/suggestions' + '?page=' + page;

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

    searchPeople(query) {
        const { s_page, people } = this.state;

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        }

        const url = baseUrl + '/users/search' + '?page=' + s_page + '&query=' + query;

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState(
                    {
                        people: s_page === 1 ? resJson.docs : [...people, ...resJson.docs],
                        s_total_pages: resJson.pages,
                        s_loading: false,
                        s_refreshing: false,
                        showSearchedResult: query.trim().length > 0
                    }
                );
            })
            .catch(err => this.setState({
                s_loading: false,
                s_refreshing: false
            }));
    }

    _keyExtractor = (post, index) => post._id + index;

    _onRefresh = () => {
        this.setState({ refreshing: true, page: 1, totalPages: 1 }, () => this.getData());
    }

    _onSearchRefresh = () => {
        this.setState({ s_refreshing: true, s_page: 1, s_total_pages: 1 }, () => this.searchPeople(this.props.query));
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

    _renderSearchFooter = () => {
        const { s_page, s_total_pages } = this.state;

        if (s_page === s_total_pages) return null;

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

    handleLoadSearchMore = () => {
        const { s_page, s_total_pages } = this.state;

        // check if the current page reaches the last page
        if (s_page < s_total_pages) {
            this.setState({ s_page: s_page + 1 }, () => this.searchPeople(this.props.query));
        }
    }

    renderEmptyView = () => {
        return (
            <View style={styles.centerContent}>
                <FIcon name="user" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No Users to show !</Text>
            </View>
        )
    }

    renderHeaderView = () => {
        return (
            <View style={styles.headerStyle}>
                <Text >People You May Know</Text>
            </View>
        )
    }

    _handleRemove = (index) => {
        const start = this.state.posts.slice(0, index);
        const end = this.state.posts.slice(index + 1);
        this.setState({ posts: start.concat(end) });
    }

    _renderItem = ({ item, index }) => {
        return (
            <EachPeople
                user={item}
                onRemove={() => this._handleRemove(index)}
                {...this.props}
            />
        )
    }

    _renderSearchItem = ({ item }) => {
        return (
            <EachSearchPeople
                user={item}
                {...this.props}
            />
        )
    }

    render() {
        const {
            loading,
            s_loading,
            refreshing,
            s_refreshing,
            posts,
            people,
            showSearchedResult
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
                {
                    !showSearchedResult ?

                        loading ?
                            <View style={styles.centerContent}>
                                <ActivityIndicator size="large" color={Color.backgroundColor} />
                            </View>
                            :
                            <FlatList
                                style={{ backgroundColor: '#fff' }}
                                contentContainerStyle={{ flexGrow: 1 }}
                                ListHeaderComponent={this.renderHeaderView}
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
                        :
                        s_loading ?
                            <View style={styles.centerContent}>
                                <ActivityIndicator size="large" color={Color.backgroundColor} />
                            </View>
                            :
                            <FlatList
                                style={{ backgroundColor: '#fff' }}
                                contentContainerStyle={{ flexGrow: 1 }}
                                ListEmptyComponent={this.renderEmptyView}
                                initialNumToRender={10}
                                refreshing={s_refreshing}
                                data={people}
                                renderItem={this._renderSearchItem}
                                keyExtractor={this._keyExtractor}
                                onRefresh={this._onSearchRefresh}
                                ListFooterComponent={this._renderSearchFooter}
                                onEndReached={this.handleLoadSearchMore}
                                onEndReachedThreshold={0.5}
                            />

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
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        headerStyle: {
            backgroundColor: Color.fontColor,
            height: scale(55),
            justifyContent: 'center'
        }
    }
)