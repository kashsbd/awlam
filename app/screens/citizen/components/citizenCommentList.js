import React, { PureComponent } from 'react';
import {
    View,
    ActivityIndicator,
    Image,
    FlatList,
    Modal,
    Text,
    StyleSheet,
    Dimensions
} from 'react-native';

import {
    RkText,
    RkButton,
    RkTextInput
} from 'react-native-ui-kitten';

import {
    MentionBoxWrapper,
    MentionText
} from '../../../components';

import Icon from 'react-native-vector-icons/FontAwesome';
import SIcon from 'react-native-vector-icons/SimpleLineIcons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';

import { scale } from '../../../utils/scale';
import { EachComment } from '../../social/eachComment';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';
import EachLiker from '../../social/eachLiker';
import { Color } from '../../../utils/color';

const _ = require('lodash');

export class CitizenCommentList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            mentions: [],
            likerModalVisible: false,
            likerLoading: false,
            likers: [],
            dislikers: [],
            routes: [],
            index: 0,
            isErasing: false
        }
    }

    sendComment = () => {
        const { message, mentions } = this.state;
        const { feedId, url } = this.props;

        if (message.trim().length != 0) {

            const cmt_form = {
                cmt_owner: feedId,
                commentor: LoggedUserCredentials.getUserId(),
                comment_type: 'TEXT',
                message,
                mentions
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
                },
                method: 'POST',
                body: JSON.stringify(cmt_form)
            };

            fetch(url + feedId + '/comments', config)
                .then(res => res.json())
                .then(this._updateComment)
                .catch(this._onCmtSendErr);
        }
    }

    _updateComment = (resJson) => {
        const { updateComment } = this.props;
        this.setState({ message: '', mentions: [] });
        updateComment && updateComment([resJson]);
    }

    _onCmtSendErr = () => this.setState({ message: '', mentions: [] });

    _cmtKeyExtractor = (cmt) => cmt._id;

    renderNoCommentsView = () => {
        return (
            <View style={cmtStyles.centerContent}>
                <Icon name="comments-o" size={50} />
                <RkText >No Comments Found !</RkText>
            </View>
        )
    }

    renderLoading() {
        return (
            <View style={cmtStyles.centerContent}>
                <ActivityIndicator animating size={30} color={Color.backgroundColor} />
            </View>
        )
    }

    getPostReactions() {
        const { feedId, url } = this.props;
        const form_data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(form_data)
        };

        const path = url + feedId + '/reactions';

        fetch(path, config)
            .then(res => res.json())
            .then(this._getReactionsSuccess)
            .catch(this._getReactionsErr);
    }

    _getReactionsSuccess = ({ post_likers, post_dislikers }) => {
        let routes = [];

        if (post_likers.length > 0) {
            routes.push({ key: 'like', icon: 'thumbs-o-up' });
        }

        if (post_dislikers.length > 0) {
            routes.push({ key: 'dislike', icon: 'thumbs-o-down' });
        }

        this.setState(
            {
                likers: post_likers,
                dislikers: post_dislikers,
                likerLoading: false,
                routes
            }
        );
    }

    _getReactionsErr = err => this.setState({ likerLoading: false });

    onLikePressed = () => {
        this.setState({ likerModalVisible: true, likerLoading: true }, () => this.getPostReactions());
    }

    _keyExtractor = (item, index) => item.userId;

    dividerComponent = () => {
        return (
            <View style={{ borderTopWidth: 2, borderTopColor: Color.fontColor }} />
        )
    }

    _renderEachLiker = ({ item }) => {
        return (
            <EachLiker
                name={item.name}
                role={item.role}
                userId={item.userId}
                status={item.status}
            />
        )
    }

    _renderLikerView = () => {
        const { likers } = this.state;

        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    style={cmtStyles.root}
                    data={likers}
                    renderItem={this._renderEachLiker}
                    keyExtractor={this._keyExtractor}
                />
            </View>
        )
    }

    _renderDislikerView = () => {
        const { dislikers } = this.state;

        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    style={cmtStyles.root}
                    data={dislikers}
                    renderItem={this._renderEachLiker}
                    keyExtractor={this._keyExtractor}
                />
            </View>
        )
    }

    _renderIcon = ({ route }) => {
        const { likers, dislikers } = this.state;

        switch (route.icon) {
            case 'thumbs-o-up': {
                return (
                    <View style={{ flexDirection: 'row' }}>
                        <Icon name={route.icon} size={20} color={Color.backgroundColor} />
                        <Text style={{ fontSize: 16, marginLeft: 5 }}>{likers.length > 0 ? '(' + likers.length + ')' : ''}</Text>
                    </View>
                );
                break;
            }
            case 'thumbs-o-down': {
                return (
                    <View style={{ flexDirection: 'row' }}>
                        <Icon name={route.icon} size={20} color={Color.backgroundColor} />
                        <Text style={{ fontSize: 16, marginLeft: 5 }}>{dislikers.length > 0 ? '(' + dislikers.length + ')' : ''}</Text>
                    </View>
                );
                break;
            }
        }
    }

    _renderTabBar = props => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={cmtStyles.indicator}
            style={cmtStyles.tabbar}
            tabStyle={cmtStyles.tab}
            renderIcon={this._renderIcon}
        />
    );

    _renderScene = SceneMap({
        like: this._renderLikerView,
        dislike: this._renderDislikerView,
    });

    _handleIndexChange = index => this.setState({ index });

    _renderReactionView() {
        const { likerLoading, routes } = this.state;

        return (
            <View style={{ flex: 1 }}>
                <View style={cmtStyles.headerBarReaction}>
                    <RkButton
                        rkType='clear'
                        style={{ width: 40 }}
                        onPress={this._closeLikerModal}>
                        <Icon name='arrow-left' color='white' size={17} />
                    </RkButton>
                    <RkText style={{ paddingTop: scale(8), marginLeft: scale(15), color: 'white' }}>People who reacted</RkText>
                </View>
                {
                    likerLoading ?
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size={'large'} style={{ alignSelf: 'center', color: Color.backgroundColor }} />
                        </View>
                        :
                        routes && routes.length > 0 ?
                            <TabView
                                navigationState={this.state}
                                renderScene={this._renderScene}
                                renderTabBar={this._renderTabBar}
                                onIndexChange={this._handleIndexChange}
                                initialLayout={{
                                    width: Dimensions.get('window').width
                                }}
                                useNativeDriver
                            />
                            :
                            <View style={cmtStyles.centerContent}>
                                <SIcon name="like" size={50} />
                                <RkText >There is no reaction in this post !</RkText>
                            </View>
                }
            </View>
        )
    }

    _renderEachComment = (eachCmt) => {
        const cmt = eachCmt.item;

        return (
            <EachComment comment={cmt} postType='CITIZEN' />
        );
    };

    _closeLikerModal = _ => this.setState({ likerModalVisible: false });

    _closeCommentModal = _ => {
        const { closeModal } = this.props;
        closeModal && closeModal();
    }

    _onChangeText = (text) => {
        const { message, mentions } = this.state;

        let _mentions = mentions;

        this.text_input.focusInput(false);

        //check if it is removing chars
        if (text.length > message.length) {
            this.setState({ message: text, isErasing: false });
        } else {
            let _text = text.split(/(\s+)/);
            //get last word
            const lastWord = _text[_text.length - 1].trim();

            if (lastWord.length > 0 && lastWord !== '@' && lastWord.startsWith('@')) {
                const index = _.findIndex(mentions, { name: lastWord });
                if (index !== -1) {
                    _mentions.splice(index, 1);
                    _text.pop();
                }
            }

            this.setState({ message: _text.join(''), isErasing: true, mentions: [..._mentions] });
        }

        this.mention_box.onChangeText(text);
    }

    _capMentionBox = ref => this.mention_box = ref;

    _onNamePress = (name_obj) => {
        const { mentions, message } = this.state;

        let _message = message;
        let _mentions = mentions;
        //remove all chars which start with @
        let parts = _message.split(/(\s+)/);

        parts[parts.length - 1] = '@' + name_obj.name + ' ';

        _mentions.push({ name: '@' + name_obj.name, user_id: name_obj.user_id });

        this.setState({ mentions: [..._mentions], message: parts.join('') });
    }

    render() {
        const { message, likerModalVisible, mentions } = this.state;
        const { commentsLoading, comments } = this.props;

        let _message = message;
        let _mentions = mentions;
        let parts = _message.split(/(\s+)/);

        for (let i = 0, length = parts.length; i < length; i++) {
            const each_word = parts[i].trim();

            if (each_word.length > 0 && each_word !== '@' && each_word.startsWith('@')) {
                const index = _.findIndex(_mentions, { name: each_word });
                if (index !== -1) {
                    parts[i] = (<MentionText key={i} name={each_word} />);
                }
            }
        }

        return (
            <View style={cmtStyles.commentContainer}>

                <View style={cmtStyles.headerBar}>
                    <RkButton
                        rkType='clear'
                        style={{ width: 40 }}
                        onPress={this._closeCommentModal}>
                        <Icon name='arrow-left' color={Color.fontColor} size={17} />
                    </RkButton>
                    <RkText style={{ paddingTop: scale(8), marginLeft: scale(15), color: Color.fontColor }}>Comments</RkText>
                    <RkButton
                        rkType='clear'
                        style={{ width: scale(50) }}
                        onPress={this.onLikePressed}>
                        <Icon name='thumbs-up' style={{ color: Color.fontColor, fontSize: 22, marginRight: scale(10) }} />
                    </RkButton>
                </View>

                <View style={{ flex: 1 }} >
                    {
                        commentsLoading ?
                            this.renderLoading()
                            :
                            <FlatList
                                style={cmtStyles.root}
                                keyboardShouldPersistTaps={'handled'}
                                keyboardDismissMode="on-drag"
                                contentContainerStyle={{ flexGrow: 1 }}
                                ListEmptyComponent={this.renderNoCommentsView()}
                                data={comments}
                                keyExtractor={this._cmtKeyExtractor}
                                renderItem={this._renderEachComment}
                            />
                    }
                </View>

                <MentionBoxWrapper
                    ref={this._capMentionBox}
                    onNamePress={this._onNamePress}
                >
                    <View style={cmtStyles.commentFooter}>
                        <RkButton style={cmtStyles.plus} rkType='clear'>
                            <Icon name='plus' size={16} />
                        </RkButton>

                        <RkTextInput
                            onChangeText={this._onChangeText}
                            ref={(ref) => this.text_input = ref}
                            rkType='row sticker'
                            placeholder="Add a comment..." >
                            <Text >{parts}</Text>
                        </RkTextInput>

                        <RkButton
                            onPress={this.sendComment}
                            style={cmtStyles.send}
                            rkType='circle highlight'>
                            <Image source={require('../../../assets/icons/sendIcon.png')} />
                        </RkButton>
                    </View>
                </MentionBoxWrapper>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={likerModalVisible}
                    onRequestClose={this._closeLikerModal}
                >
                    {this._renderReactionView()}
                </Modal>

            </View>
        )
    }
}

let cmtStyles = StyleSheet.create(
    {
        commentContainer: {
            flex: 1
        },
        root: {
            backgroundColor: 'white',
            flex: 1,
        },
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
        },
        commentFooter: {
            flexDirection: 'row',
            minHeight: 60,
            padding: 10,
            backgroundColor: Color.fontColor
        },
        headerBar: {
            flexDirection: 'row',
            minHeight: 55,
            padding: 5,
            justifyContent: 'space-between',
            backgroundColor: Color.backgroundColor
        },
        plus: {
            paddingVertical: 10,
            paddingHorizontal: 10,
            marginRight: 7
        },
        send: {
            width: 40,
            height: 40,
            marginLeft: 10,
        },
        content: {
            marginLeft: 16,
            flex: 1,
            marginBottom: 5
        },
        contentHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 6
        },
        avatar: {
            width: 60,
            height: 60,
            borderRadius: 30,
            overflow: 'hidden',
            marginRight: 5
        },
        headerBarReaction: {
            flexDirection: 'row',
            minHeight: 55,
            padding: 5,
            backgroundColor: Color.backgroundColor
        },
        tabbar: {
            backgroundColor: '#fff'
        },
        tab: {
            width: scale(115),
        },
        indicator: {
            backgroundColor: Color.backgroundColor
        },
        username: {
            color: 'black',
            fontWeight: 'bold',
            fontSize: 17
        },
        text: {
            color: 'black',
            fontSize: 15,
        },
    }
);