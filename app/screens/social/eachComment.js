import React, { PureComponent } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    StyleSheet
} from 'react-native';

import {
    RkText,
    RkButton
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';
import ImageLoad from 'react-native-image-placeholder';

import { TimeAgo, CommentText, Username } from '../../components';
import { baseUrl, cmtUrl } from '../../utils/globle';
import { ReplyList } from './replyList';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { Color } from '../../utils/color';

export class EachComment extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            //number of likes of each comment
            likesCount: props.comment.likes ? props.comment.likes.length : 0,
            //number of replies of each comment
            repliesCount: props.comment.replies ? props.comment.replies.length : 0,
            //have logged user already liked ?
            isLiked: props.comment.likes ? props.comment.likes.includes(LoggedUserCredentials.getUserId()) : false,
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

        const replyUrl = cmtUrl + '/' + comment._id + '/replies';

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET'
        };

        this.setState({ loading: true });

        fetch(replyUrl, config)
            .then(res => res.json())
            .then(this._onRepliesGet)
            .catch(this._onRepliesErr)
    }

    _onRepliesGet = resJson => {
        this.setState({ replies: resJson.docs, loading: false });
    }

    _onRepliesErr = err => this.setState({ loading: false });

    toggleLikeComment = () => {
        const { isLiked } = this.state;
        const { comment } = this.props;
        if (isLiked) {
            this.doUnlikeComment(comment._id);
        } else {
            this.doLikeComment(comment._id);
        }
    }

    doLikeComment(cmtId) {
        const { likesCount } = this.state;
        this.setState({ likesCount: likesCount + 1, isLiked: true }, () => this.doLike(cmtId));
    }

    doLike(cmtId) {
        const like_data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(like_data)
        }

        const likeUrl = cmtUrl + '/' + cmtId + '/like';

        fetch(likeUrl, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    doUnlikeComment(cmtId) {
        const { likesCount } = this.state;
        this.setState({ likesCount: likesCount - 1, isLiked: false }, () => this.doUnlike(cmtId));
    }

    doUnlike(cmtId) {
        const unlike_data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(unlike_data)
        }

        const unLikeUrl = cmtUrl + '/' + cmtId + '/unlike';

        fetch(unLikeUrl, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    openReplyModal = () => {
        this.setState({ replyModalVisible: true }, () => this.fetchReplies());
    }


    closeReplyModal = () => {
        this.setState({ replyModalVisible: false }, () => this.fetchReplies());
    }

    updateReply = () => {
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

        const { comment, postType } = this.props;

        return (
            <View style={{ flex: 1 }}>
                <View style={cmtStyles.container}>
                    <TouchableOpacity >
                        <ImageLoad
                            style={cmtStyles.avatar}
                            source={{ uri: baseUrl + '/users/' + comment.commentor._id  + '/profile_pic' }}
                            placeholderSource={require('../../assets/images/avator.png')}
                            isShowActivity={false}
                        />
                    </TouchableOpacity>
                    <View style={cmtStyles.content}>
                        <View style={cmtStyles.contentHeader}>
                            <RkText rkType='header5'>
                                <Username name={comment.commentor.name} role={comment.commentor.role} />
                            </RkText>
                            <TimeAgo time={comment.createdAt} />
                        </View>
                        <RkText rkType='primary2 mediumLine' style={{ marginBottom: 5 }}>
                            <CommentText
                                message={comment.message}
                                mentions={comment.mentions}
                            />
                        </RkText>
                        <View style={{ flexDirection: 'row', marginVertical: 3, width: scale(70), justifyContent: 'space-between' }}>
                            <RkButton rkType='clear' onPress={this.toggleLikeComment}>
                                <Icon
                                    name={isLiked ? 'heart' : 'heart-o'}
                                    style={cmtStyles.iconStyle}
                                />
                                <RkText
                                    rkType='primary4'
                                    style={{ color: Color.backgroundColor }}>
                                    {likesCount === 0 ? null : likesCount}
                                </RkText>
                            </RkButton>

                            <RkButton rkType='clear' onPress={this.openReplyModal}>
                                <Icon
                                    name="comment-o"
                                    style={cmtStyles.iconStyle}
                                />
                                <RkText
                                    rkType='primary4'
                                    style={{ color: Color.backgroundColor }}>
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
                        postType={postType}
                        loading={loading}
                        replies={replies}
                        commentId={comment._id}
                        updateReply={this.updateReply}
                        closeModal={this.closeReplyModal}
                    />
                </Modal>
            </View>
        )
    }
}

let cmtStyles = StyleSheet.create(
    {
        container: {
            paddingLeft: 19,
            paddingRight: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'flex-start'
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
            color: Color.backgroundColor,
            fontSize: 16,
            marginRight: 5
        },
        avatar: {
            marginRight: 16,
            width: 50,
            height: 50,
            borderRadius: 25,
            overflow: 'hidden'
        },
    }
);