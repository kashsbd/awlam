import React, { Component } from 'react';
import {
    View,
    TouchableOpacity,
} from 'react-native';

import {
    RkText,
    RkButton,
    RkStyleSheet
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';

import { Avatar, TimeAgo } from '../../components';
import { ownerProPicUrl, articleUrl } from '../../utils/globle';
import { checkResponse } from '../../utils/commonService';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

const bgColor = '#191e1f';
const yellowColor = '#ECC951';

export class ArticleEachReply extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //likes count of each reply
            likesCount: props.reply.likes.length,
            //have logged user already liked ?
            isLiked: props.reply.likes.includes(LoggedUserCredentials.getOwnerId()),
        }
    }

    toggleLikeReply() {
        const { isLiked } = this.state;
        const { reply } = this.props;
        if (isLiked) {
            this.doUnlikeComment(reply.commentId);
        } else {
            this.doLikeComment(reply.commentId);
        }
    }

    doLikeComment(cmtId) {
        const { likesCount } = this.state;
        this.setState({ likesCount: likesCount + 1, isLiked: true }, () => this.doLike(cmtId));
    }

    doLike(cmtId) {
        let data = new FormData();
        data.append('ownerId', LoggedUserCredentials.getOwnerId());

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: data
        }

        const likeUrl = articleUrl + 'comments/' + cmtId + '/like';

        fetch(likeUrl, config)
            .then(res => checkResponse(res, likeUrl, config))
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    doUnlikeComment(cmtId) {
        const { likesCount } = this.state;
        this.setState({ likesCount: likesCount - 1, isLiked: false }, () => this.doUnlike(cmtId))
    }

    doUnlike(cmtId) {
        let data = new FormData();
        data.append('ownerId', LoggedUserCredentials.getOwnerId());

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: data
        }

        const unLikeUrl = articleUrl + 'comments/' + cmtId + '/unlike';

        fetch(unLikeUrl, config)
            .then(res => checkResponse(res, unLikeUrl, config))
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    render() {
        const { reply } = this.props;
        const { likesCount, isLiked } = this.state;

        return (
            <View style={cmtStyles.container}>
                <TouchableOpacity onPress={() => { }}>
                    <Avatar
                        rkType='circle'
                        style={cmtStyles.avatar}
                        img={{ uri: ownerProPicUrl + '/' + reply.commentorId }}
                    />
                </TouchableOpacity>
                <View style={cmtStyles.content}>
                    <View style={cmtStyles.contentHeader}>
                        <RkText rkType='header5'>{reply.commentorName}</RkText>
                        <TimeAgo time={reply.createdDate} />
                    </View>
                    <RkText rkType='primary2 mediumLine' style={{ marginBottom: 5 }}>{reply.message}</RkText>
                    <View style={{ flexDirection: 'row', marginVertical: 3, width: scale(70), justifyContent: 'space-between' }}>
                        <RkButton rkType='clear' onPress={() => this.toggleLikeReply()}>
                            <Icon
                                name={isLiked ? 'heart' : 'heart-o'}
                                style={cmtStyles.iconStyle}
                            />
                            <RkText
                                rkType='primary4'
                                style={[{ color: '#ECC951' }]}>
                                {likesCount === 0 ? null : likesCount}
                            </RkText>
                        </RkButton>
                    </View>
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
    iconStyle: {
        color: yellowColor,
        fontSize: 16,
        marginRight: 5
    }
}));