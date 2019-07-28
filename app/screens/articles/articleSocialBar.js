import React from 'react';
import {
    View,
    StyleSheet,
    Modal
} from 'react-native';

import {
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';

import { scale } from '../../utils/scale';
import { checkResponse } from '../../utils/commonService';
import { articleUrl } from '../../utils/globle';
import { ArticleCommentList } from './articleCommentList';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

const bgColor = '#191e1f';
const yellowColor = '#ECC951';

export default class ArticleSocialBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            likesCount: props.data.likes.length,
            commentCount: props.data.commentCount,
            articleId: props.data.articleId,
            isLiked: props.data.likes.includes(LoggedUserCredentials.getOwnerId()),
            commentModalVisible: false,
            commentsLoading: false,
            comments: []
        }
    }

    showCommentModal() {
        this.setState({ commentModalVisible: true, commentsLoading: true });
        this.getComments();
    }

    getComments() {
        const { articleId } = this.state;
        const url = articleUrl + articleId + "/comments";
        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        };

        fetch(url, config)
            .then(res => checkResponse(res, url, config).json())
            .then(resJson => this.setState({ comments: resJson, commentsLoading: false }))
            .catch(err => this.setState({ commentsLoading: false }))
    }

    isSavedVisible() {
        const { isLiked } = this.state;
        return (isLiked) ? { display: 'flex' } : { display: 'none' };
    }

    isRemovedVisible() {
        const { isLiked } = this.state;
        return (!isLiked) ? { display: 'flex', width: 55, height: 55 } : { display: 'none' };
    }

    onLikePress() {
        const { likesCount, isLiked } = this.state;
        //check whether logged user did like or not
        if (isLiked) {
            this.setState({ likesCount: likesCount - 1, isLiked: false }, () => this.onUnLike());
        } else {
            this.setState({ likesCount: likesCount + 1, isLiked: true }, () => { this.isSavedAnimation.play(); this.onLike(); });
        }
    }

    onLike() {
        const { articleId } = this.state;

        let data = new FormData();
        data.append('ownerId', LoggedUserCredentials.getOwnerId());

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: data
        }

        const likeUrl = articleUrl + articleId + '/like';

        fetch(likeUrl, config)
            .then(res => console.log(res))
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    onUnLike() {
        const { articleId } = this.state;

        let data = new FormData();
        data.append('ownerId', LoggedUserCredentials.getOwnerId());

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: data
        }

        let unlikeUrl = articleUrl + articleId + '/unlike';

        fetch(unlikeUrl, config)
            .then(res => console.log(res))
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    render() {
        const {
            likesCount,
            commentModalVisible,
            commentsLoading,
            articleId,
            comments
        } = this.state;

        const { getArticles } = this.props;

        return (
            <View style={styles.container}>
                <View style={[styles.section, this.isRemovedVisible()]}>
                    <RkButton rkType='clear' onPress={() => this.onLikePress()}>
                        <Icon
                            name={'heart-o'}
                            size={20}
                            color={'#f2f2f2'}
                        />
                    </RkButton>
                    <RkText
                        rkType='primary4'
                        style={{ color: '#fff', left: scale(18), top: scale(18) }}>
                        {likesCount === 0 ? null : likesCount}
                    </RkText>
                </View>

                <View style={[styles.section, this.isSavedVisible()]}>
                    <RkButton rkType='clear' onPress={() => this.onLikePress()} >
                        {/* <Animation
                            style={{ width: 55, height: 55 }}
                            ref={aniRef => this.isSavedAnimation = aniRef}
                            loop={false}
                            source={heart}
                        /> */}
                        <View />
                        <RkText
                            rkType='primary4'
                            style={[{ color: '#ECC951' }]}>
                            {likesCount}
                        </RkText>
                    </RkButton>
                </View>

                <View style={styles.section}>
                    <RkButton rkType='clear' onPress={() => this.showCommentModal()}>
                        <Icon name='comment-o' size={20} color='#f2f2f9' />
                        <RkText rkType='primary4 hintColor' style={[styles.label, { color: 'white', paddingLeft: 7 }]}>{this.props.data.commentCount > 0 ? this.props.data.commentCount : null}</RkText>
                    </RkButton>
                </View>

                <View style={styles.section}>
                    <RkButton rkType='clear' onPress={() => { }}>
                        <Icon name='share' size={20} color='#f2f2f9' />
                    </RkButton>
                </View>

                {/* comment modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={commentModalVisible}
                    onRequestClose={() => { this.setState({ commentModalVisible: false }); this.getComments() }}>
                    <ArticleCommentList
                        articleId={articleId}
                        commentsLoading={commentsLoading}
                        comments={comments}
                        updateComment={() => { this.getComments(); getArticles() }}
                        closeModal={() => { this.setState({ commentModalVisible: false }); getArticles() }}
                    />
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
    },
    section: {
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1
    },
    label: {
        marginLeft: 8,
        alignSelf: 'flex-end'
    }
});
