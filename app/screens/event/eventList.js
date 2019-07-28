import React, { PureComponent } from 'react';

import {
    StyleSheet,
    TouchableOpacity,
    View,
    FlatList,
    Text,
    ActivityIndicator
} from 'react-native';

import { RkButton } from 'react-native-ui-kitten';

import { EventItem } from './components';

import EIcon from 'react-native-vector-icons/Entypo';
import FIcon from 'react-native-vector-icons/FontAwesome';

import { Color } from '../../utils/color';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { scale } from '../../utils/scale';
import { eventUrl } from '../../utils/globle';

export class EventList extends PureComponent {

    static navigationOptions = ({ navigation }) => ({
        title: 'Event Posts',
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
                <FIcon name='bars' size={20} color={Color.fontColor} />
            </RkButton>
        )
    });

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

    updatePost = (post) => {
        console.log(post);
        
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

    getData() {
        const { page, posts } = this.state;

        const url = eventUrl + '/?page=' + page + '&role=' + LoggedUserCredentials.getRole();

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <FIcon name="feed" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No posts to show !</Text>
            </View>
        )
    }

    _renderItem = ({ item }) => {
        return (
            <EventItem feed={item} {...this.props} />
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

    _keyExtractor = (post, index) => post._id + index;

    handleLoadMore = () => {
        const { page, totalPages } = this.state;

        // check if the current page reaches the last page
        if (page < totalPages) {
            this.setState({ page: page + 1 }, () => this.getData());
        }
    }

    _navigate = () => {
        this.props.navigation.navigate('CreateEvent', { 'updatePost': this.updatePost });
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
                                keyboardShouldPersistTaps={'handled'}
                                keyboardDismissMode="on-drag"
                                ref={this._captureRef}
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
                            {/* fab button */}
                            <TouchableOpacity
                                onPress={this._navigate}
                                style={styles.fabButton}
                            >
                                <EIcon name="plus" style={{ color: Color.fontColor, fontSize: 30, margin: 5 }} />
                            </TouchableOpacity>
                        </View>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1
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
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
})