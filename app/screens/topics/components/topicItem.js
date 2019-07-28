import React, { PureComponent } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Text
} from 'react-native';

import ImageLoad from 'react-native-image-placeholder';
import BottomSheet from 'react-native-js-bottom-sheet';
import FIcons from 'react-native-vector-icons/Feather';

import {
    TimeAgo,
    AutoResizeImage,
    StaticMap,
    Username
} from '../../../components';

import {
    RkCard,
    RkText,
    RkButton
} from 'react-native-ui-kitten';

import {
    SocialBar,
} from './';

import ReadMore from 'react-native-read-more-text';
import PhotoView from "@merryjs/photo-viewer";

import { topicUrl, baseUrl, Google_Api_Key } from '../../../utils/globle';
import { Color } from '../../../utils/color';
import { scaleVertical, scale } from '../../../utils/scale';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';

import { image_name } from '../../../utils/mediaUtils';

export class TopicItem extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            //different modals
            photoModalVisible: false,
            //media(video or image) path 
            mediaPaths: [],
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

    renderMedia(feed) {
        let firstMedia = feed.media[0];

        return (
            <TouchableOpacity
                style={{ marginBottom: 10 }}
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
                <AutoResizeImage
                    width={Dimensions.get('window').width}
                    source={{ uri: topicUrl + '/media/' + firstMedia._id + '/' + image_name() }}
                />
            </TouchableOpacity>
        )
    }

    setMenuRef = ref => this._menu = ref;

    setMapRef = ref => this.mapModal = ref;

    editPost(feed) {
        this._menu.hide();
    };

    showMap = () => this.mapModal.open();

    deletePost(feed) {
        this._menu.hide();
        this.setState({ isVisible: false });

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
        }

        const url = topicUrl + '/' + feed._id + '/delete';

        // fetch(url, config)
        //     .then(res => res.json())
        //     .then(resJson => console.log(resJson));
    }

    showMenu(ownerId) {
        if (LoggedUserCredentials.getUserId() === ownerId) {
            this._menu.show();
        }
    };

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

    showSubPosts(feed) {
        this.props.navigation.navigate('SubTopicList', { tid: feed._id });
    }

    _setMenuRef = ref => this.menu_ref = ref;

    render() {
        const { feed, showMoreBtn = true } = this.props;

        const {
            photoModalVisible,
            selectedMediaIndex,
            mediaPaths,
            isVisible
        } = this.state;

        let paths = [];

        if (mediaPaths) {
            paths = mediaPaths.map(path => {
                return { source: { uri: topicUrl + '/media/' + path._id + '/' + image_name() } };
            })
        }

        const username = feed.user.name;

        const propicUrl = baseUrl + '/users/' + feed.user._id + '/profile_pic';

        return (
            isVisible ?
                <View>
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

                        {
                            showMoreBtn ?
                                <TouchableOpacity
                                    style={styles.btnOutline}
                                    onPress={() => this.showSubPosts(feed)}
                                >
                                    <Text>follow up topics ...</Text>
                                </TouchableOpacity>
                                :
                                <View />
                        }

                        <View
                            rkCardFooter
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                        >
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

                    <BottomSheet
                        ref={this._setMenuRef}
                        itemDivider={3}
                        backButtonEnabled
                        coverScreen={false}
                        title="Menu"
                        options={[
                            {
                                title: 'Public',
                                icon: <FIcons name="globe" color={Color.backgroundColor} size={24} />,
                                onPress: this._onPublicBtnPressed
                            },
                            {
                                title: 'Private',
                                icon: <FIcons name="lock" color={Color.backgroundColor} size={24} />,
                                onPress: this._onAysBtnPressed
                            }
                        ]}
                        isOpen={false}
                    />

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
        btnOutline: {
            borderWidth: 0.3,
            height: 35,
            borderTopColor: 'gray',
            borderBottomColor: 'gray',
            borderLeftColor: '#fff',
            borderRightColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center'
        }
    }
);