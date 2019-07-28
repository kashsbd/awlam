import React, { PureComponent } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Text
} from 'react-native';

import ImageLoad from 'react-native-image-placeholder';

import {
    TimeAgo,
    AutoResizeImage,
    StaticMap,
    Username
} from '../../../components';

import {
    RkCard,
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import {
    SocialBar
} from './';

import PhotoView from "@merryjs/photo-viewer";
import io from 'socket.io-client/dist/socket.io';

import { donationUrl, baseUrl, Google_Api_Key } from '../../../utils/globle';
import { Color } from '../../../utils/color';
import { scaleVertical, scale } from '../../../utils/scale';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';

import { image_name } from '../../../utils/mediaUtils';

import {
    shorten_months,
    getEventDate
} from '../../../utils/commonService';

export class EventItem extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            //different modals
            photoModalVisible: false,
            //media(video or image) path 
            mediaPaths: [],
            selectedMediaIndex: null,
            isVisible: true,
            //interested user
            interested: props.feed.interested || []
        }

        this.socket = io(baseUrl + '/all_likes');
    }

    _menu = null;

    onInterestedCountReceive = (data) => {
        if (data && (data.id === this.props.feed._id)) {
            this.setState({ interested: data.interested });
        }
    }

    componentDidMount() {
        this.socket.on('donation::reacted', this.onInterestedCountReceive);
    }

    componentWillUnmount() {
        this.socket.off('donation::reacted', this.onInterestedCountReceive);
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
                    source={{ uri: donationUrl + '/media/' + firstMedia._id + '/' + image_name() }}
                />
            </TouchableOpacity>
        )
    }

    renderEventInfo(event) {
        const { start_date_time, location } = event;
        const { interested } = this.state;

        const start_date = new Date(start_date_time);

        const dateWithAmPm = getEventDate(start_date);

        const month = shorten_months[start_date.getMonth()];

        return (
            <View style={styles.eventDetailContainer} >
                <View style={styles.eventDetailLeft}>
                    <Text style={styles.eventDateStyle}>{start_date.getDate().toString()}</Text>
                    <View />
                    <Text style={{ color: Color.backgroundColor }}>{month}</Text>
                </View>
                <View style={styles.eventDetailRight}>
                    <Text style={styles.eventNameStyle}>{event.event_name}</Text>
                    <Text style={styles.eventString}>{dateWithAmPm}</Text>
                    {
                        location && location.address ?
                            <Text style={styles.eventString}>{location.address}</Text>
                            :
                            null
                    }
                    {
                        interested && interested.length > 0 ?
                            <Text style={styles.eventString} numberOfLines={1}>{`${interested.length} people interested`}</Text>
                            :
                            null
                    }
                </View>
            </View>
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
        this.props.navigation.navigate('SubDonationList', { did: feed._id });
    }

    _closePhotoView = () => this.setState({ photoModalVisible: false });

    render() {
        const { feed, showMoreBtn = true } = this.props;

        const {
            photoModalVisible,
            selectedMediaIndex,
            mediaPaths,
            isVisible,
            interested
        } = this.state;

        let paths = [];

        if (mediaPaths) {
            paths = mediaPaths.map(path => {
                return { source: { uri: donationUrl + '/media/' + path._id + '/' + image_name() } };
            })
        }

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
                                        onPress={() => this.props.navigation.navigate('MainProfile', { userId: feed.user._id })}
                                        rkType='header6'
                                        style={{ color: 'black', marginTop: scale(5) }}
                                    >
                                        <Username name={feed.user.name} role={feed.user.role} />
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
                            this.renderEventInfo(feed)
                        }

                        {
                            showMoreBtn ?
                                <TouchableOpacity
                                    style={styles.btnOutline}
                                    onPress={() => this.showSubPosts(feed)}
                                >
                                    <Text>follow up stories ...</Text>
                                </TouchableOpacity>
                                :
                                <View />
                        }

                        <View
                            rkCardFooter
                            style={{ paddingBottom: 0, paddingTop: 0 }} >

                            <SocialBar
                                key={interested.length}
                                eventId={feed._id}
                                interested={interested}
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
                        onDismiss={this._closePhotoView}
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
        },
        eventDetailContainer: {
            flex: 1,
            flexDirection: 'row',
            marginBottom: 15,
            marginTop: 5
        },
        eventDetailLeft: {
            width: '25%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        eventDetailRight: {
            width: '75%',
            justifyContent: 'center'
        },
        eventNameStyle: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 17
        },
        eventDateStyle: {
            fontSize: 19,
            fontWeight: '700',
            lineHeight: 26,
            letterSpacing: 2
        },
        eventString: {
            fontSize: 14,
            fontWeight: '200'
        }
    }
);