import React from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    FlatList
} from 'react-native';

import {
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';

import { postUrl } from '../../utils/globle';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { PostItem } from './postItem';
import { Color } from '../../utils/color';

export class EachPost extends React.PureComponent {

    static navigationOptions = ({ navigation }) => ({
        title: 'Each Post',
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
                onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={scale(17)} color={Color.fontColor} />
            </RkButton>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            postId: '',
            //initial datas
            post: null,
            comments: [],
            //flags to show loading sign
            postLoading: false,
            refreshing: false,
            //flag to show reload page
            showError: false
        };

    }

    componentDidMount() {
        const postId = this.props.navigation.state.params.postId;
        this.setState({ postLoading: true, postId }, () => this.getData());
    }

    async getData() {
        const { postId } = this.state;

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        }

        const url = postUrl + '/' + postId;

        try {
            const res = await fetch(url, config);
            const status = res.status;
            switch (status) {
                case 404: {
                    this.setState({ postLoading: false, showError: true });
                    break;
                }
                case 500: {
                    this.setState({ postLoading: false, showError: true });
                    break;
                }
                case 200: {
                    const resJson = await res.json();
                    this.setState({ post: resJson, postLoading: false, refreshing: false, showError: false });
                    break;
                }
            }
        } catch (err) {
            this.setState({ refreshing: false, showError: true });
            alert("Please connect to internet and try again !");
        }
    }

    _keyExtractor = (cmt, index) => cmt._id + index;

    _onRefresh = () => {
        this.setState({ refreshing: true }, () => this.getData());
    }

    _renderItem = (eachPost) => {
        const post = eachPost.item;

        return (
            <View />
        )
    }

    renderListHeader = () => {
        const { post } = this.state;

        if (post) {
            return (
                <PostItem feed={post} {...this.props} />
            )
        }

        return <View />
    }

    _renderErrorView() {
        return (
            <View style={styles.centerContent}>
                <Icon name="comments-o" size={scale(50)} />
                <RkText >Something went wrong !</RkText>
            </View>
        )
    }

    render() {
        const {
            postLoading,
            refreshing,
            showError,
            comments
        } = this.state;

        return (
            <View style={{ flex: 1 }} >
                {
                    !postLoading ?
                        showError ?
                            this._renderErrorView()
                            :
                            <FlatList
                                ListHeaderComponent={this.renderListHeader}
                                contentContainerStyle={{ flexGrow: 1 }}
                                initialNumToRender={10}
                                data={comments}
                                renderItem={this._renderItem}
                                keyExtractor={this._keyExtractor}
                                style={styles.container}
                                refreshing={refreshing}
                                onRefresh={this._onRefresh}
                            />
                        :
                        <View style={styles.centerContent}>
                            <ActivityIndicator size={scale(50)} color={Color.backgroundColor} />
                        </View>
                }
            </View>
        )
    }
}

let styles = StyleSheet.create(
    {
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        container: {
            paddingVertical: 8
        }
    }
);
