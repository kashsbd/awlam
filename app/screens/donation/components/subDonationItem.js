import React, { PureComponent } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal,
    ScrollView
} from 'react-native';

import ImageLoad from 'react-native-image-placeholder';
import FastImage from 'react-native-fast-image';

import {
    TimeAgo,
    AutoResizeImage,
    StaticMap,
    MapModal,
    Username
} from '../../../components';

import {
    RkCard,
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import {
    SubSocialBar
} from '.';

import ReadMore from 'react-native-read-more-text';
import PhotoView from "@merryjs/photo-viewer";
import Video from 'react-native-af-video-player';
import FIcons from 'react-native-vector-icons/Feather';

import { donationUrl, baseUrl, postUrl, Google_Api_Key } from '../../../utils/globle';
import { scaleVertical, scale } from '../../../utils/scale';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';

import { image_name } from '../../../utils/mediaUtils';

export class SubEventItem extends PureComponent {

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
            <RkButton rkType='clear' onPress={handlePress}>
                Read more
            </RkButton>
        );
    }

    _renderRevealedFooter = (handlePress) => {
        return (
            <RkButton rkType='clear' onPress={handlePress}>
                Show less
            </RkButton>
        );
    }

    renderAvatars = (medias) => {
        let assets = medias.map(media => {
            if (media.contentType.startsWith('image/')) {

                let mediaPath = donationUrl + '/media/' + media._id + '/' + image_name()

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
            const placeholderPath = postUrl + '/media/' + firstMedia._id + '/thumbnail';
            const videoPath = donationUrl + '/stream/' + firstMedia._id;
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
                                selectedMediaIndex: feed.media.indexOf(firstMedia)
                            }
                        )
                    }
                >
                    <View>
                        <AutoResizeImage
                            width={Dimensions.get('window').width}
                            source={{ uri: donationUrl + '/media/' + firstMedia._id + '/' + image_name() }}
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

        const url = donationUrl + '/' + feed._id + '/delete';

        // fetch(url, config)
        //     .then(res => res.json())
        //     .then(resJson => console.log(resJson));
    }

    showMenu(ownerId) {
        if (LoggedUserCredentials.getUserId() === ownerId) {
            this._menu.show();
        }
    };

    _closeVideoModal = () => this.setState({ videoModalVisible: false });

    showSubPosts(feed) {
        this.props.navigation.navigate('SubEventList', { eid: feed._id });
    }

    setMapRef = ref => this.mapModal = ref;

    showMap = () => this.mapModal.open();

    renderMapView(feed) {
        const width = Math.round(Dimensions.get('window').width);
        const location = feed.location;
        const hasMedia = feed.media.length > 0;

        if (location) {
            return (
                <TouchableOpacity onPress={this.showMap}>
                    <StaticMap
                        style={{ marginBottom: hasMedia ? 10 : 0 }}
                        latitude={location.lat}
                        longitude={location.lon}
                        zoom={13}
                        size={{ width, height: 150 }}
                        apiKey={Google_Api_Key}
                    />
                </TouchableOpacity>
            )
        }
    }

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
                return { source: { uri: donationUrl + '/media/' + path._id + '/' + image_name() } };
            })
        }

        const username = feed.isPublic ? feed.user.name : 'A User';

        const propicUrl = feed.isPublic ? baseUrl + '/users/' + feed.user._id + '/profile_pic' : baseUrl + '/users/' + '1234' + '/profile_pic';

        return (
            isVisible ?
                <View key={feed._id}>
                    <RkCard style={styles.card}>
                        <View rkCardHeader >
                            <RkButton
                                rkType='clear'
                                disabled={!feed.isPublic}
                                onPress={() => this.props.navigation.navigate('MainProfile', { userId: feed.user._id })} >
                                <ImageLoad
                                    style={styles.avatar}
                                    source={{ uri: propicUrl }}
                                    placeholderSource={require('../../../assets/images/avator.png')}
                                    isShowActivity={false}
                                />
                            </RkButton>

                            <View style={{ flex: 1 }}>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <RkText
                                        disabled={!feed.isPublic}
                                        onPress={() => this.props.navigation.navigate('MainProfile', { userId: feed.user._id })}
                                        rkType='header6'
                                        style={{ color: 'black', marginTop: scale(5) }}
                                    >
                                        <Username name={username} role={feed.user.role} />
                                    </RkText>
                                </View>

                                <TimeAgo time={feed.createdAt} />

                            </View>

                        </View>

                        {
                            feed.media.length > 0 ?
                                this.renderMedia(feed)
                                :
                                <View />
                        }

                        {
                            feed.location ?
                                this.renderMapView(feed)
                                :
                                <View />
                        }

                        {
                            feed.description ?
                                <View rkCardContent>
                                    <ReadMore
                                        numberOfLines={2}
                                        renderTruncatedFooter={this._renderTruncatedFooter}
                                        renderRevealedFooter={this._renderRevealedFooter} >
                                        <RkText rkType='primary3' style={{ color: 'black' }}>{feed.description}</RkText>
                                    </ReadMore>
                                </View>
                                :
                                <View />
                        }

                        <View rkCardFooter style={{ paddingBottom: 0, paddingTop: 0 }}>
                            <SubSocialBar
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

                    {
                        feed.location ?
                            <MapModal
                                ref={this.setMapRef}
                                location={feed.location}
                            />
                            : null
                    }
                </View>
                : null
        )
    }
}


let styles = StyleSheet.create(
    {
        card: {
            marginVertical: 8,
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
        btnOutline: {
            borderWidth: 0.3,
            height: 35,
            borderTopColor: 'gray',
            borderBottomColor: 'gray',
            borderLeftColor: '#fff',
            borderRightColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center'
        },
        videoContainer: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'black',
            paddingBottom: scaleVertical(25)
        },
    }
);