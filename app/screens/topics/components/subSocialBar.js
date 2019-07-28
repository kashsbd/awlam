import React from 'react';
import {
    View,
    Modal,
    StyleSheet
} from 'react-native';

import {
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';
import io from 'socket.io-client/dist/socket.io';
import Share from 'react-native-share';

import { scale } from '../../../utils/scale';
import { topicUrl, baseUrl } from '../../../utils/globle';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';
import { TopicCommentList } from './';
import { Color } from '../../../utils/color';

export class SubSocialBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            //like count
            likesCount: props.feedLikes.length,
            //unlike count
            dislikesCount: props.feedDislikes.length,
            //comment count
            commentCount: props.feedCommentCount,
            //check whether current user liked or not
            isLiked: props.feedLikes.includes(LoggedUserCredentials.getUserId()),
            //check whether current user disliked or not
            isDisliked: props.feedDislikes.includes(LoggedUserCredentials.getUserId()),
            //initial array of comments
            comments: [],
            //flag to control comments loading
            commentsLoading: false,
            //flag to control comment modal
            commentModalVisible: false,
        }

        this.socket = io(baseUrl + '/all_likes');
    }

    onLikeCountReceive = (data) => {
        if (data && (data.id === this.props.feedId)) {
            this.setState({ likesCount: data.likesCount, dislikesCount: data.dislikesCount });
        }
    }

    onCmtCountReceive = (data) => {
        if (data && (data.id === this.props.feedId)) {
            this.setState({ commentCount: data.cmtCount });
        }
    }

    componentDidMount() {
        this.socket.on('subtopic::reacted', this.onLikeCountReceive);
        this.socket.on('subtopic::commented', this.onCmtCountReceive);
    }

    componentWillUnmount() {
        this.socket.off('subtopic::reacted', this.onLikeCountReceive);
        this.socket.off('subtopic::commented', this.onCmtCountReceive);
    }

    onLike = () => {
        const { feedId } = this.props;
        const { isLiked, likesCount, isDisliked, dislikesCount } = this.state;

        const data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        let url = '';

        if (isDisliked) {
            this.setState({ isDisliked: false, dislikesCount: dislikesCount > 0 ? dislikesCount - 1 : 0 });
        }

        if (isLiked) {
            this.setState({ isLiked: false, likesCount: likesCount - 1 });
            url = topicUrl + '/subposts/' + feedId + '/unlike';
        } else {
            this.setState({ isLiked: true, likesCount: likesCount + 1 });
            url = topicUrl + '/subposts/' + feedId + '/like';
        }

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    onUnLike = () => {
        const { feedId } = this.props;
        const { isDisliked, unlikesCount, isLiked, likesCount } = this.state;

        const data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        let url = '';

        if (isLiked) {
            this.setState({ isLiked: false, likesCount: likesCount > 0 ? likesCount - 1 : 0 });
        }

        if (isDisliked) {
            this.setState({ isDisliked: false, unlikesCount: unlikesCount - 1 });
            url = topicUrl + '/subposts/' + feedId + '/undislike';
        } else {
            this.setState({ isDisliked: true, unlikesCount: unlikesCount + 1 });
            url = topicUrl + '/subposts/' + feedId + '/dislike';
        }

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    async getComments() {
        const { feedId } = this.props;

        const url = topicUrl + '/subposts/' + feedId + '/comments';

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        };

        try {
            let res = await fetch(url, config);
            const resJson = await res.json();
            this.setState({ comments: resJson.docs, commentsLoading: false })
        } catch (error) {
            this.setState({ commentsLoading: false })
        }
    }

    showCommentModal = () => {
        this.setState({ commentModalVisible: true, commentsLoading: true });
        this.getComments();
    }

    updateComment = (cmt) => {
        const { comments } = this.state;
        this.setState({ comments: [...this.state.comments, ...cmt], commentCount: comments.length });
    }

    onShare = () => {
        const { feedId } = this.props;
        let shareOptions = {
            title: "Awlam",
            url: baseUrl + '/web/subtopics/' + feedId,
            subject: "Awlam Post" //  for email
        };

        Share.open(shareOptions);
    }

    _closeModel = () => {
        const { comments } = this.state;
        this.setState({ commentModalVisible: false, commentCount: comments.length });
    }

    render() {
        const {
            likesCount,
            dislikesCount,
            commentModalVisible,
            commentsLoading,
            comments,
            commentCount,
            isLiked,
            isDisliked
        } = this.state;

        return (
            <View style={styles.container}>

                <View style={styles.section}>
                    <RkButton
                        rkType='clear'
                        hitSlop={{ top: 30, bottom: 30, left: 40, right: 40 }}
                        onPress={this.onLike}
                    >
                        <Icon
                            name={isLiked ? 'thumbs-up' : 'thumbs-o-up'}
                            style={styles.iconStyle}
                        />
                        {
                            likesCount === 0
                                ? <RkText style={{ color: 'green', width: scale(12) }} />
                                :
                                <RkText rkType='primary4' style={{ color: Color.backgroundColor, marginLeft: 5 }} >
                                    {likesCount}
                                </RkText>
                        }
                    </RkButton>
                </View>

                <View style={[styles.section, { justifyContent: 'flex-start' }]}>
                    <RkButton
                        rkType='clear'
                        hitSlop={{ top: 30, bottom: 30, left: 40, right: 40 }}
                        onPress={this.onUnLike}
                    >
                        <Icon
                            name={isDisliked ? 'thumbs-down' : 'thumbs-o-down'}
                            style={styles.iconStyle}
                        />
                        {
                            dislikesCount === 0
                                ? <RkText style={{ color: 'green', width: scale(12) }} />
                                :
                                <RkText rkType='primary4' style={{ color: Color.backgroundColor, marginLeft: 5 }} >
                                    {dislikesCount}
                                </RkText>
                        }
                    </RkButton>
                </View>

                <View style={styles.section}>
                    <RkButton
                        rkType='clear'
                        hitSlop={{ top: 30, bottom: 30, left: 40, right: 40 }}
                        onPress={this.showCommentModal}
                    >
                        <Icon name='comment-o' size={scale(20)} color={Color.backgroundColor} />
                        {
                            commentCount === 0
                                ? <RkText style={{ color: 'green', width: scale(12) }} />
                                :
                                <RkText rkType='primary4' style={{ color: Color.backgroundColor, marginLeft: 5 }} >
                                    {commentCount}
                                </RkText>
                        }
                    </RkButton>
                </View>

                <View style={styles.section}>
                    <RkButton
                        rkType='clear'
                        hitSlop={{ top: 30, bottom: 30, left: 40, right: 40 }}
                        onPress={this.onShare}
                    >
                        <Icon name='share' size={scale(20)} color={Color.backgroundColor} />
                    </RkButton>
                </View>

                {/* comment modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={commentModalVisible}
                    onRequestClose={this._closeModel}>
                    <TopicCommentList
                        url={topicUrl + '/subposts/'}
                        feedId={this.props.feedId}
                        commentsLoading={commentsLoading}
                        comments={comments}
                        updateComment={this.updateComment}
                        closeModal={this._closeModel}
                    />
                </Modal>
            </View>
        )
    }
}

let styles = StyleSheet.create(
    {
        container: {
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
            padding: 8
        },
        section: {
            justifyContent: 'center',
            flexDirection: 'row',
            flex: 1,
            height: scale(33)
        },
        label: {
            marginLeft: scale(8),
            alignSelf: 'flex-end'
        },
        iconStyle: {
            color: Color.backgroundColor,
            fontSize: 20
        }
    }
)
