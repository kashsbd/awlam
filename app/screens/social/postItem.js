import React, { PureComponent } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    ScrollView,
    Text
} from 'react-native';

import ImageLoad from 'react-native-image-placeholder';
import FastImage from 'react-native-fast-image';

import {
    SocialBar,
    TimeAgo,
    Tags,
    AutoResizeImage,
    Username
} from '../../components';

import {
    RkCard,
    RkText,
    RkButton
} from 'react-native-ui-kitten';

import Menu, { MenuItem } from 'react-native-material-menu';
import ReadMore from 'react-native-read-more-text';
import PhotoView from "@merryjs/photo-viewer";
import Video from 'react-native-af-video-player';
import FIcons from 'react-native-vector-icons/Feather';
import PIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { postUrl, baseUrl } from '../../utils/globle';
import { scaleVertical, scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

import { Color } from '../../utils/color';
import { image_name } from '../../utils/mediaUtils';

export class PostItem extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            //different modals
            photoModalVisible: false,
            videoModalVisible: false,
            //media(video or image) path 
            mediaPaths: [],
            videoPath: [],
            selectedMediaIndex: null,
            isVisible: true
        }
    }

    _menu = null;

    _renderTruncatedFooter = (handlePress) => {
        return (
            <TouchableOpacity
                onPress={handlePress}
            >
                <Text style={{ fontSize: 15, fontWeight: '400', color: 'gray', alignSelf: 'flex-end' }}>Read more ...</Text>
            </TouchableOpacity>
        );
    }

    _renderRevealedFooter = (handlePress) => {
        return (
            <TouchableOpacity
                onPress={handlePress}
            >
                <Text style={{ fontSize: 15, fontWeight: '400', color: 'gray', alignSelf: 'flex-end' }} >Show less</Text>
            </TouchableOpacity>
        );
    }

    onTagPress = () => {
        console.log('tag pressed');
    }

    renderHashTag(tags) {
        return (
            <Tags
                initialTags={tags}
                readonly={true}
                onTagPress={this.onTagPress}
            />
        )
    }

    renderAvatars = (medias) => {
        let assets = medias.map(media => {
            if (media.contentType.startsWith('image/')) {

                let mediaPath = postUrl + '/media/' + media._id + '/' + image_name();

                return (
                    <TouchableOpacity
                        key={media._id}
                        onPress={() => this.setState({ photoModalVisible: true, mediaPaths: medias, selectedMediaIndex: medias.indexOf(media) })}>
                        <FastImage
                            source={{ uri: mediaPath }}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                overflow: 'hidden',
                                margin: 3,
                            }}
                        />
                    </TouchableOpacity>
                )
            }
        })
        return assets;
    }

    renderMedia(feed) {
        let firstMedia = feed.media[0];

        if (firstMedia.contentType.startsWith("video/")) {
            const placeholderPath = postUrl + '/media/' + feed.media[0]._id + '/thumbnail';
            const videoPath = postUrl + '/stream/' + firstMedia._id;
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        this.setState(
                            {
                                videoModalVisible: true,
                                videoPath: videoPath
                            }
                        );
                    }
                    }
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <AutoResizeImage
                            width={Dimensions.get('window').width}
                            source={{ uri: placeholderPath }}
                        />
                        <FIcons
                            name="play-circle"
                            style={{ color: '#fff', fontSize: 50, zIndex: 2, position: 'absolute' }}
                        />
                    </View>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        this.setState(
                            {
                                photoModalVisible: true,
                                mediaPaths: feed.media,
                                selectedMediaIndex: feed.media.indexOf(feed.media[0])
                            }
                        )
                    }
                >
                    <View>
                        <AutoResizeImage
                            width={Dimensions.get('window').width}
                            source={{ uri: postUrl + '/media/' + feed.media[0]._id + '/' + image_name() }}
                        />
                        {
                            feed.media.length === 1 ?
                                <View />
                                :
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ flexDirection: 'row', zIndex: 2, position: 'absolute', right: 2, bottom: 2, backgroundColor: '#fff', borderRadius: 10 }}>
                                    {this.renderAvatars(feed.media)}
                                </ScrollView>
                        }
                    </View>
                </TouchableOpacity>
            )
        }
    }

    setMenuRef = ref => {
        this._menu = ref;
    };

    editPost(feed) {
        this._menu.hide();
    };

    deletePost(feed) {
        this._menu.hide();
        this.setState({ isVisible: false });

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
        }

        const url = postUrl + '/' + feed._id + '/delete';

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => console.log(resJson));
    }

    showMenu(ownerId) {
        if (LoggedUserCredentials.getUserId() === ownerId) {
            this._menu.show();
        }
    };

    _closeVideoModal = () => this.setState({ videoModalVisible: false });

    render() {
        const { feed, isTouchable = true } = this.props;

        const {
            photoModalVisible,
            videoPath,
            selectedMediaIndex,
            videoModalVisible,
            mediaPaths,
            isVisible
        } = this.state;

        let paths = [];

        if (mediaPaths) {
            paths = mediaPaths.map(path => {
                return { source: { uri: postUrl + '/media/' + path._id + '/' + image_name() } };
            })
        }

        return (
            isVisible ?
                <View key={feed._id}>
                    <RkCard style={styles.card}>
                        <View rkCardHeader >
                            <RkButton
                                rkType='clear'
                                disabled={!isTouchable}
                                onPress={() => this.props.navigation.navigate('MainProfile', { userId: feed.user._id })} >
                                <ImageLoad
                                    style={styles.avatar}
                                    source={{ uri: baseUrl + '/users/' + feed.user._id + '/profile_pic' }}
                                    placeholderSource={require('../../assets/images/avator.png')}
                                    isShowActivity={false}
                                />
                            </RkButton>

                            <View style={{ flex: 1 }}>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <RkText
                                        disabled={!isTouchable}
                                        onPress={() => this.props.navigation.navigate('MainProfile', { userId: feed.user._id })}
                                        rkType='header6'
                                        style={{ color: 'black', marginTop: scale(5) }}
                                    >
                                        <Username name={feed.user.name} role={feed.user.role} />
                                    </RkText>
                                    <Menu
                                        ref={this.setMenuRef}
                                        button={
                                            <RkButton
                                                rkType='clear'
                                                onPress={() => this.showMenu(feed.user._id)}
                                            >
                                                <PIcon
                                                    name='dots-vertical'
                                                    style={{ fontSize: scale(18), color: 'black', marginTop: scale(5) }}
                                                />
                                            </RkButton>
                                        }
                                    >
                                        <MenuItem onPress={() => this.deletePost(feed)}>Delete Post</MenuItem>
                                    </Menu>
                                </View>

                                <TimeAgo time={feed.createdAt} />

                            </View>

                        </View>

                        {
                            feed.hashTags.length > 0 ?
                                <View style={styles.hashTagContainer}>
                                    {this.renderHashTag(feed.hashTags)}
                                </View>
                                :
                                <View />
                        }

                        {
                            feed.media.length > 0 ?
                                this.renderMedia(feed)
                                :
                                <View />
                        }

                        {
                            feed.status_type === 'TEXT' && feed.status ?
                                <View rkCardContent>
                                    <ReadMore
                                        numberOfLines={3}
                                        renderTruncatedFooter={this._renderTruncatedFooter}
                                        renderRevealedFooter={this._renderRevealedFooter} >
                                        <RkText rkType='primary3' style={{ color: 'black' }}>{feed.status}</RkText>
                                    </ReadMore>
                                </View>
                                :
                                <View />
                        }

                        <View rkCardFooter style={{ paddingBottom: 0, paddingTop: 0 }}>
                            <SocialBar
                                feedLikes={feed.likes}
                                feedDislikes={feed.dislikes}
                                feedCommentCount={feed.comments.length}
                                feedId={feed._id}
                            />
                        </View >

                    </RkCard>

                    <PhotoView
                        visible={photoModalVisible}
                        data={paths}
                        hideStatusBar={false}
                        hideCloseButton={true}
                        hideShareButton={true}
                        initial={selectedMediaIndex || 0}
                        onDismiss={e => {
                            // don't forgot set state back.
                            this.setState({ photoModalVisible: false });
                        }}
                    />

                    {/* video modal */}
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={videoModalVisible}
                        onRequestClose={this._closeVideoModal}>
                        <View style={styles.videoContainer} >
                            <Video
                                url={videoPath}
                                autoPlay
                                fullScreenOnly
                            // lockPortraitOnFsExit
                            />
                        </View>
                    </Modal>
                </View>
                : null
        )
    }
}


let styles = StyleSheet.create(
    {
        card: {
            marginVertical: 8,
            backgroundColor: Color.fontColor,
            marginRight: scaleVertical(20),
            width: '100%'
        },
        avatar: {
            marginRight: 16,
            width: 60,
            height: 60,
            borderRadius: 30,
            overflow: 'hidden'
        },
        videoContainer: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'black',
            paddingBottom: scaleVertical(25)
        },
        hashTagContainer: {
            paddingHorizontal: 10,
            paddingBottom: 8,
        }
    }
);