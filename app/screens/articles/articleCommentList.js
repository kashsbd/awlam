import React, { PureComponent } from 'react';
import {
    View,
    ActivityIndicator,
    Image,
    FlatList
} from 'react-native';

import {
    RkText,
    RkButton,
    RkTextInput,
    RkStyleSheet
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';

import { articleUrl } from '../../utils/globle';
import { scale } from '../../utils/scale';
import { EachComment } from './articleEachComment';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

export class ArticleCommentList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            message: null
        }
    }

    sendComment() {
        const { message } = this.state;
        const { updateComment, articleId } = this.props;

        let cmt = new FormData();
        cmt.append('articleId', articleId);
        cmt.append('ownerId', LoggedUserCredentials.getOwnerId());
        cmt.append('message', message);
        cmt.append('commentorName', LoggedUserCredentials.getOwnerName());

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: cmt
        };

        fetch(articleUrl + 'comments', config)
            .then(res => { this.setState({ message: null }); updateComment(); })
            .catch(err => this.setState({ message: null }))

    }

    _CmtKeyExtractor = (cmt) => {
        return cmt.commentId;
    }

    renderNoCommentsView() {
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
                <ActivityIndicator animating size={30} />
            </View>
        )
    }

    render() {
        const { message, } = this.state;
        const { commentsLoading, comments, closeModal } = this.props;

        return (
            <View style={cmtStyles.commentContainer}>
                <View style={cmtStyles.headerBar}>
                    <RkButton
                        rkType='clear'
                        style={{ width: 40 }}
                        onPress={() => closeModal()}>
                        <Icon name='arrow-left' color='black' size={17} />
                    </RkButton>
                    <RkText style={{ paddingTop: scale(8), marginLeft: scale(15) }}>Comments</RkText>
                </View>
                {
                    commentsLoading ?
                        this.renderLoading()
                        :
                        comments.length === 0 ?
                            this.renderNoCommentsView()
                            :
                            <FlatList
                                style={cmtStyles.root}
                                data={comments}
                                keyExtractor={this._CmtKeyExtractor}
                                renderItem={(comment) => (<EachComment comment={comment.item} />)}
                            />
                }
                <View style={cmtStyles.commentFooter}>
                    <RkButton style={cmtStyles.plus} rkType='clear'>
                        <Icon name='plus' size={16} />
                    </RkButton>

                    <RkTextInput
                        onChangeText={(message) => this.setState({ message })}
                        value={message}
                        rkType='row sticker'
                        placeholder="Add a comment..." />

                    <RkButton
                        onPress={() => this.sendComment()}
                        style={cmtStyles.send}
                        rkType='circle highlight'>
                        <Image source={require('../../assets/icons/sendIcon.png')} />
                    </RkButton>
                </View>
            </View>
        )
    }
}

let cmtStyles = RkStyleSheet.create(theme => ({
    commentContainer: {
        flex: 1
    },
    root: {
        backgroundColor: theme.colors.screen.base,
        flex: 1
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.screen.base
    },
    commentFooter: {
        flexDirection: 'row',
        minHeight: 60,
        padding: 10,
        backgroundColor: theme.colors.screen.alter
    },
    headerBar: {
        flexDirection: 'row',
        minHeight: 55,
        padding: 5,
        backgroundColor: theme.colors.screen.alter
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
    container: {
        paddingLeft: 19,
        paddingRight: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
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
}));