import React, { PureComponent } from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    Text,
    FlatList,
    StyleSheet
} from 'react-native';

import {
    RkText,
    RkButton,
    RkTextInput
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';

import {
    MentionBoxWrapper,
    MentionText
} from '../../components';

import { cmtUrl } from '../../utils/globle';
import { scale } from '../../utils/scale';
import { Color } from '../../utils/color';
import { EachReply } from './eachReply';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

const _ = require('lodash');

export class ReplyList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            //reply message
            message: '',
            mentions: [],
            isErasing: false
        }
    }

    sendReply = () => {
        const { message, mentions } = this.state;
        const { commentId, postType } = this.props;

        if (message.trim().length != 0) {

            const reply_form = {
                type: postType,
                cmt_owner: commentId,
                commentor: LoggedUserCredentials.getUserId(),
                comment_type: 'TEXT',
                message: message,
                mentions
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
                },
                method: 'POST',
                body: JSON.stringify(reply_form)
            };

            const url = cmtUrl + '/' + commentId + '/replies';

            fetch(url, config)
                .then(res => res.json())
                .then(this._onReplySuccess)
                .catch(this._onReplyErr);

            this.setState({ message: '' });
        }
    }

    _onReplySuccess = _ => {
        const { updateReply } = this.props;
        updateReply && updateReply();
    }

    _onReplyErr = _ => alert('Something went wrong.Please try later!');

    _cmtKeyExtractor = cmt => cmt._id;

    renderNoRepliesView() {
        return (
            <View style={cmtStyles.centerContent}>
                <Icon name="comments-o" size={50} />
                <RkText >No Replies Found !</RkText>
            </View>
        )
    }

    renderLoading() {
        return (
            <View style={cmtStyles.centerContent}>
                <ActivityIndicator size={30} color={Color.backgroundColor} />
            </View>
        )
    }

    _renderEachReply = (eachReply) => {
        const reply = eachReply.item;

        return (
            <EachReply reply={reply} />
        )
    }

    _closeModal = () => {
        const { closeModal } = this.props;
        closeModal && closeModal();
    }

    _onChangeText = (text) => {
        const { message, mentions } = this.state;

        let _mentions = mentions;

       // this.text_input.focusInput(false);

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
        const { message, mentions } = this.state;
        const { replies, loading } = this.props;

        let _message = message;
        let _mentions = mentions;
        console.log('message', _message);
        let parts = _message.split(/(\s+)/);

        console.log('parts', parts);

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
                        onPress={this._closeModal}>
                        <Icon name='arrow-left' color='#fff' size={17} />
                    </RkButton>
                    <RkText style={{ paddingTop: scale(8), marginLeft: scale(15), color: '#fff' }}>Replies</RkText>
                </View>

                <View style={{ flex: 1 }}>
                    {
                        loading ?
                            this.renderLoading()
                            :
                            <FlatList
                                contentContainerStyle={{ flexGrow: 1 }}
                                ListEmptyComponent={this.renderNoRepliesView()}
                                style={cmtStyles.root}
                                data={replies}
                                keyExtractor={this._cmtKeyExtractor}
                                renderItem={this._renderEachReply}
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
                            placeholder="Add a reply..."
                        >
                            <Text >{parts}</Text>
                        </RkTextInput>

                        <RkButton
                            onPress={this.sendReply}
                            style={cmtStyles.send}
                            rkType='circle highlight'>
                            <Image source={require('../../assets/icons/sendIcon.png')} />
                        </RkButton>
                    </View>
                </MentionBoxWrapper>
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
            flex: 1
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
        }
    }
);