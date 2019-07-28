import React, { PureComponent } from 'react';
import {
    View,
    TouchableWithoutFeedback,
    ImageBackground,
    TouchableOpacity,
    StyleSheet,
    Text,
    Modal,
    Dimensions
} from 'react-native';

import {
    SocialBar,
    TimeAgo
} from '../../components';

import {
    RkCard,
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import ReadMore from 'react-native-read-more-text';
import PhotoView from "@merryjs/photo-viewer";
import Swiper from 'react-native-swiper';
import Video from 'react-native-af-video-player';
import Image from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import PIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ownerProPicUrl, feedUrl } from '../../utils/globle';
import { scaleVertical } from '../../utils/scale';

let width = Dimensions.get('window').width;

export class PostItemWithComment extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            //different modals
            photoModalVisible: false,
            videoModalVisible: false,
            replyModalVisible: false,
            //media(video or image) path 
            mediaPaths: [],
            videoPath: null,
            selectedMediaIndex: null,
        }
    }


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

    onRefresh() {
        this.setState({ refreshing: true });
        this.getData();
        this.setState({ refreshing: false });
    }

    renderMedia(medias) {
        let assets = medias.map(media => {
            let mediaPath = feedUrl + 'media/' + media.mediaId;

            if (media.contentType.startsWith('image/')) {
                return (
                    <TouchableWithoutFeedback
                        key={media.mediaId}
                        // rkCardImg
                        style={{ width, height: (width * 9) / 16 }}
                        onPress={() => this.setState({ photoModalVisible: true, mediaPaths: medias, selectedMediaIndex: medias.indexOf(media) })}
                    >
                        <Image
                            //rkCardImg
                            style={{ width, height: (width * 9) / 16 }}
                            source={{ uri: mediaPath }}
                            indicator={Progress.Pie}
                            indicatorProps={{
                                size: 80,
                                borderWidth: 0,
                                color: 'rgba(150, 150, 150, 1)',
                                unfilledColor: 'rgba(200, 200, 200, 0.2)'
                            }}
                        />
                    </TouchableWithoutFeedback>
                )
            } else if (media.contentType.startsWith('video/')) {
                const placeholderPath = feedUrl + 'media/' + media.mediaId + '/thumbnail';

                return (
                    <ImageBackground
                        key={media.mediaId}
                        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                        source={{ uri: placeholderPath }}

                    >
                        <TouchableOpacity
                            onPress={() => this.setState({ videoModalVisible: true, videoPath: mediaPath })}
                        >
                            <MIcon
                                style={{ opacity: 0.9 }}
                                name={'play-circle-outline'}
                                color={'white'}
                                size={75} />
                        </TouchableOpacity>
                    </ImageBackground>
                )
            }
        });

        return assets;
    }

    render() {
        const { feed, isTouchable = true, style } = this.props;
        const {
            photoModalVisible,
            videoPath,
            selectedMediaIndex,
            videoModalVisible,
            mediaPaths
        } = this.state;

        let paths = [];
        if (mediaPaths) {
            paths = mediaPaths.map(path => {
                return { source: { uri: feedUrl + 'media/' + path.mediaId } };
            })
        }

        return (
            <View key={feed.feedId}>
                <RkCard style={[styles.card, style]}>
                    <View rkCardHeader >
                        <RkButton
                            rkType='clear'
                            disabled={!isTouchable}
                            onPress={() => this.props.navigation.navigate('MainProfile', { ownerId: feed.ownerId })} >
                            <Image
                                style={styles.avatar}
                                source={{ uri: ownerProPicUrl + '/' + feed.ownerId }} />
                        </RkButton>
                        <View style={{ flex: 1 }}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <RkText
                                    disabled={!isTouchable}
                                    onPress={() => this.props.navigation.navigate('MainProfile', { ownerId: feed.ownerId })}
                                    rkType='header6'
                                    style={{ color: '#ECC951', marginTop: 5 }}
                                >
                                    {feed.ownerName}
                                </RkText>
                                <TimeAgo style={{ marginTop: 6 }} time={feed.createdDate} />
                            </View>
                            {
                                feed.petsName && feed.activity ?
                                    <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                        <PIcon name='paw' style={{ fontSize: 18, marginRight: 5, color: '#ECC951' }} />
                                        <Text style={{ color: '#ECC951', flexWrap: 'wrap', flex: 1 }} >{feed.petsName} is  {feed.activity} </Text>
                                    </View>
                                    :
                                    <View />
                            }
                        </View>
                    </View>
                    {
                        feed.hashtags ?
                            <View style={styles.hashTagContainer}>
                                <Text style={{ color: '#fff' }} >{feed.hashtags}</Text>
                            </View>
                            :
                            <View />
                    }
                    <View rkCardImg>
                        <Swiper
                            paginationStyle={styles.paginationStyle}
                            dot={<View style={styles.dot} />}
                            activeDot={<View style={styles.activeDot} />}
                        >
                            {this.renderMedia(feed.media)}
                        </Swiper>
                    </View>
                    {
                        feed.status != '' ?
                            <View rkCardContent>
                                <ReadMore
                                    rkCardContent
                                    numberOfLines={2}
                                    renderTruncatedFooter={this._renderTruncatedFooter}
                                    renderRevealedFooter={this._renderRevealedFooter} >
                                    <RkText rkType='primary3'>{feed.status}</RkText>
                                </ReadMore>
                            </View>
                            :
                            <View />
                    }
                    <View rkCardFooter style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <SocialBar
                            feedLikes={feed.likes ? feed.likes : []}
                            feedCommentCount={feed.comments ? feed.comments.length : 0}
                            feedId={feed.feedId}
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
                    onRequestClose={() => this.setState({ videoModalVisible: false })}>
                    <View style={styles.videoContainer} >
                        <Video
                            url={videoPath}
                            autoPlay
                            fullScreenOnly
                            lockPortraitOnFsExit
                        />
                    </View>
                </Modal>
            </View>
        )
    }
}


let styles = StyleSheet.create(
    {
        card: {
            marginVertical: 8,
            backgroundColor: '#191e1f',
            marginHorizontal: scaleVertical(10),
        },
        avatar: {
            marginRight: 16,
            width: 60,
            height: 60,
            borderRadius: 30,
            overflow: 'hidden'
        },
        paginationStyle: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            marginRight: 15
        },
        activeDot: {
            backgroundColor: '#ECC951',
            width: 8,
            height: 8,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3
        },
        dot: {
            backgroundColor: '#191e1f',
            width: 5,
            height: 5,
            borderRadius: 4,
            marginLeft: 3,
            marginRight: 3,
            marginTop: 3,
            marginBottom: 3
        },
        videoContainer: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: '#191e1f',
            paddingBottom: scaleVertical(25)
        },
        hashTagContainer: {
            paddingHorizontal: 15,
            paddingBottom: 8,
        }
    }
);