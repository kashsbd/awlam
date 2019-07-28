import React, { PureComponent } from 'react';
import {
    View,
    Modal,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

import {
    RkText,
    RkButton
} from 'react-native-ui-kitten';

import {
    TopicItem
} from './';

import Icon from 'react-native-vector-icons/FontAwesome';
import FIcon from 'react-native-vector-icons/Feather';

import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';
import { topicUrl } from '../../../utils/globle';
import { Color } from '../../../utils/color';
import { scale } from '../../../utils/scale';
const _ = require('lodash');

export class AllPrivateTopicModal extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            postsLoading: false,
            searched_posts_loading: false,
            posts: [],
            searched_posts: [],
            modalVisible: false,
            refreshing: false,
            totalPages: 1,
            page: 1,
            quary: ''
        }
    }

    filtered_users = [];

    getData() {
        const { page, posts } = this.state;

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET'
        };

        const url = topicUrl + '/private/' + LoggedUserCredentials.getUserId() + '?page=' + page;

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState(
                    {
                        posts: page === 1 ? resJson.docs : [...posts, ...resJson.docs],
                        totalPages: resJson.pages,
                        postsLoading: false,
                        refreshing: false
                    }
                );
            })
            .catch(err => this.setState({
                postsLoading: false,
                refreshing: false
            }));
    }

    searchTopic(quary) {
        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET'
        };

        const url = topicUrl + '/private/' + LoggedUserCredentials.getUserId() + '/search?query=' + quary;

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                this.setState(
                    {
                        searched_posts: resJson,
                        searched_posts_loading: false,
                    }
                );
            })
            .catch(err => this.setState({
                searched_posts_loading: false
            }));
    }

    _keyExtractor = (post, index) => post._id + index;

    _onRefresh = () => {
        this.setState({ refreshing: true, page: 1, totalPages: 1 }, () => this.getData());
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
            <View style={{ flex: 1 }}>
                <ActivityIndicator size='large' color={Color.backgroundColor} />
            </View>
        );
    }

    _handleLoadMore = () => {
        const { page, totalPages } = this.state;

        // check if the current page reaches the last page
        if (page < totalPages) {
            this.setState({ page: page + 1 }, () => this.getData());
        }
    }

    renderEmptyView = () => {
        return (
            <View style={styles.centerContent}>
                <Icon name="user" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No posts to show.</Text>
            </View>
        )
    }

    renderNoUserFoundView = () => {
        return (
            <View style={styles.centerContent}>
                <Icon name="user" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No Users Found</Text>
            </View>
        )
    }

    _handleTextInput = text => this.setState({ quary: text }, () => this.searchTopic(text));

    _clearText = () => this.setState({ quary: '' });

    renderSearchBar() {
        const { quary } = this.state;

        return (
            <View style={styles.searchBarContainer} >
                <TextInput
                    style={styles.searchBar}
                    placeholder='Search'
                    placeholderTextColor="#919188"
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                    onChangeText={this._handleTextInput}
                    value={quary}
                    maxLength={33}
                    returnKeyType='search'
                />
                {
                    quary ?
                        <TouchableOpacity
                            style={styles.crossBtnStyle}
                            onPress={this._clearText}
                        >
                            <FIcon name='x' size={17} color='black' />
                        </TouchableOpacity>
                        :
                        null
                }
            </View>
        )
    }

    close = () => this.setState({ modalVisible: false });

    open = () => this.setState({ modalVisible: true, postsLoading: true }, () => this.getData());

    render() {
        const {
            refreshing,
            posts,
            searched_posts,
            postsLoading,
            searched_posts_loading,
            modalVisible,
            quary
        } = this.state;

        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={this.close}
            >
                <View style={styles.root}>
                    <View style={styles.headerBar}>
                        <RkButton
                            rkType='clear'
                            style={{ width: scale(40) }}
                            onPress={this.close}>
                            <Icon name='arrow-left' color='#fff' size={17} />
                        </RkButton>
                        <RkText style={{ paddingTop: scale(8), marginLeft: scale(15), color: '#fff' }}>More Topic</RkText>
                    </View>

                    {this.renderSearchBar()}

                    {
                        quary.trim().length > 0
                            ?
                            !searched_posts_loading ?
                                <FlatList
                                    contentContainerStyle={{ flexGrow: 1 }}
                                    style={styles.listStyle}
                                    ListEmptyComponent={this.renderNoUserFoundView}
                                    initialNumToRender={10}
                                    data={searched_posts}
                                    renderItem={this._renderItem}
                                    keyExtractor={this._keyExtractor}
                                />
                                :
                                <View style={styles.centerContent}>
                                    <ActivityIndicator
                                        size={scale(50)}
                                        color={Color.backgroundColor}
                                    />
                                </View>
                            :
                            !postsLoading ?
                                <FlatList
                                    contentContainerStyle={{ flexGrow: 1 }}
                                    style={styles.listStyle}
                                    ListEmptyComponent={this.renderEmptyView}
                                    initialNumToRender={10}
                                    data={posts}
                                    renderItem={this._renderItem}
                                    keyExtractor={this._keyExtractor}
                                    refreshing={refreshing}
                                    onRefresh={this._onRefresh}
                                    ListFooterComponent={this._renderFooter}
                                    onEndReached={this._handleLoadMore}
                                    onEndReachedThreshold={0.5}
                                />
                                :
                                <View style={styles.centerContent}>
                                    <ActivityIndicator
                                        size={scale(50)}
                                        color={Color.backgroundColor}
                                    />
                                </View>

                    }
                </View>
            </Modal>
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
        headerBar: {
            flexDirection: 'row',
            minHeight: 55,
            padding: 5,
            backgroundColor: Color.backgroundColor
        },
        searchBarContainer: {
            height: scale(55),
            justifyContent: 'center',
            backgroundColor: Color.fontColor
        },
        searchBar: {
            borderRadius: 5,
            borderColor: Color.backgroundColor,
            borderWidth: 1,
            alignSelf: 'center',
            backgroundColor: "white",
            height: 38,
            fontSize: 15,
            width: '80%',
            paddingHorizontal: 10
        },
        crossBtnStyle: {
            alignSelf: 'center',
            position: 'absolute',
            right: 40,
            width: 20
        },
        listStyle: {
            marginTop: 5
        }
    }
);
