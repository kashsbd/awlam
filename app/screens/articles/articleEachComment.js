import React, { PureComponent } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
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
import { ReplyList } from './articleReplyList';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

const bgColor = '#191e1f';
const yellowColor = '#ECC951';

export class ArticleEachComment extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            //number of likes of each comment
            likesCount: props.comment.likes.length,
            //number of replies of each comment
            repliesCount: props.comment.replies.length,
            //have logged user already liked ?
            isLiked: props.comment.likes.includes(LoggedUserCredentials.getOwnerId()),
            //initially we don't show reply modal
            replyModalVisible: false,
            //replies of selected comment
            replies: [],
            //replies loading
            loading: false
        }
    }



    fetchReplies() {
        const { comment } = this.props;
        const url = articleUrl + 'comments/' + comment.commentId + '/replies';

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET'
        };

        this.setState({ loading: true });

        fetch(url, config)
            .then(res => checkResponse(res, url, config).json())
            .then(resJson => this.setState({ replies: resJson, loading: false }))
            .catch(err => this.setState({ loading: false }))
    }

    toggleLikeComment() {
        const { isLiked } = this.state;
        const { comment } = this.props;
        if (isLiked) {
            this.doUnlikeComment(comment.commentId);
        } else {
            this.doLikeComment(comment.commentId);
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

        const likeUrl = articleUrl + 'comments/' + cmtId + "/like";

        fetch(likeUrl, config)
            .then(res => checkResponse(res, likeUrl, config))
            .catch(err => { alert('Something went wrong.Please try later.'); console.log(err) });
    }

    doUnlikeComment(cmtId) {
        const { likesCount } = this.state;
        this.setState({ likesCount: likesCount - 1, isLiked: false }, () => this.doUnlike(cmtId));
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
            .catch(err => { alert('Something went wrong.Please try later.'); console.log(err) });
    }

    openReplyModal() {
        this.setState({ replyModalVisible: true }, () => this.fetchReplies());
    }


    closeReplyModal() {
        this.setState({ replyModalVisible: false }, () => this.fetchReplies());
    }

    updateReply() {
        this.setState({ repliesCount: this.state.repliesCount + 1 }, () => this.fetchReplies());
    }

    render() {
        const {
            replyModalVisible,
            likesCount,
            repliesCount,
            replies,
            isLiked,
            loading
        } = this.state;

        const { comment } = this.props;

        return (
            <View style={{ flex: 1 }}>
                <View style={cmtStyles.container}>
                    <TouchableOpacity onPress={() => { }}>
                        <Avatar
                            rkType='circle'
                            style={cmtStyles.avatar}
                            img={{ uri: ownerProPicUrl + '/' + comment.commentorId }}
                        />
                    </TouchableOpacity>
                    <View style={cmtStyles.content}>
                        <View style={cmtStyles.contentHeader}>
                            <RkText rkType='header5'>{comment.commentorName}</RkText>
                            <TimeAgo time={comment.createdDate} />
                        </View>
                        <RkText rkType='primary2 mediumLine' style={{ marginBottom: 5 }}>{comment.message}</RkText>
                        <View style={{ flexDirection: 'row', marginVertical: 3, width: scale(70), justifyContent: 'space-between' }}>
                            <RkButton rkType='clear' onPress={() => this.toggleLikeComment()}>
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

                            <RkButton rkType='clear' onPress={() => this.openReplyModal()}>
                                <Icon
                                    name="comment-o"
                                    style={cmtStyles.iconStyle}
                                />
                                <RkText
                                    rkType='primary4'
                                    style={{ color: '#ECC951' }}>
                                    {repliesCount === 0 ? null : repliesCount}
                                </RkText>
                            </RkButton>
                        </View>
                    </View>
                </View>

                {/* reply modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={replyModalVisible}
                    onRequestClose={() => this.setState({ replyModalVisible: false })}>
                    <ReplyList
                        loading={loading}
                        replies={replies}
                        commentId={comment.commentId}
                        updateReply={() => this.updateReply()}
                        closeModal={() => this.closeReplyModal()}
                    />
                </Modal>
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