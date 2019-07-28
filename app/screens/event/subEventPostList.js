import React, { PureComponent } from 'react';

import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    Dimensions
} from 'react-native';

import { SubEventItem } from './components';

import { RkButton } from 'react-native-ui-kitten';
import FIcon from 'react-native-vector-icons/FontAwesome';
import ImageLoad from 'react-native-image-placeholder';
import PhotoView from "@merryjs/photo-viewer";
import moment from 'moment';

import { Color } from '../../utils/color';
import { eventUrl, baseUrl, Google_Api_Key } from '../../utils/globle';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

import {
    shorten_months
} from '../../utils/commonService';

import {
    AutoResizeImage,
    MapModal,
    StaticMap,
} from '../../components';

import {
    image_name
} from '../../utils/mediaUtils';

export class SubEventPostList extends PureComponent {

    static navigationOptions = ({ navigation }) => ({
        title: 'Event Sub Posts',
        headerStyle: {
            backgroundColor: Color.backgroundColor,
        },
        headerTitleStyle: {
            color: Color.fontColor
        },
        headerLeft: (
            <RkButton
                rkType='clear'
                style={{ width: 40, marginLeft: 8 }}
                onPress={() => navigation.goBack(null)}>
                <FIcon name="arrow-left" size={17} color={Color.fontColor} />
            </RkButton>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            headerData: null,
            eid: '',
            posts: [],
            refreshing: false,
            loading: true,
            totalPages: 1,
            page: 1,
            //different modals
            photoModalVisible: false,
            // image path 
            mediaPaths: [],
            isInterested: false,
            isGoing: false,
            going_and_interested_count: 0
        }
    }

    componentDidMount() {
        const eid = this.props.navigation.state.params.eid;
        this.setState({ eid }, () => this.getData());
    }

    getData() {
        const { page, posts, eid } = this.state;

        const url = eventUrl + '/' + eid + '/subposts?page=' + page;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET'
        }

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => {
                console.log(resJson);
                this.setState(
                    {
                        posts: page === 1 ? resJson.posts.docs : [...posts, ...resJson.posts.docs],
                        totalPages: resJson.posts.pages,
                        headerData: resJson.headerData,
                        loading: false,
                        refreshing: false,
                        isInterested: resJson.headerData.interested.includes(LoggedUserCredentials.getUserId()),
                        isGoing: resJson.headerData.going.includes(LoggedUserCredentials.getUserId()),
                        going_and_interested_count: resJson.headerData.interested.length + resJson.headerData.going.length
                    }
                );
            })
            .catch(err => this.setState({
                refreshing: false,
                loading: false
            }));
    }

    renderEmptyView = () => {
        return (
            <View style={{ height: 300, backgroundColor: Color.fontColor }} />
        )
    }

    toggleInterested = () => {
        const { isInterested, going_and_interested_count } = this.state;

        if (isInterested) {
            this.setState({ isInterested: false, going_and_interested_count: going_and_interested_count - 1 }, () => this.onUnInterested());
        } else {
            this.setState({ isInterested: true, going_and_interested_count: going_and_interested_count + 1 }, () => this.onInterested());
        }
    }

    onInterested() {
        const { eid } = this.state;

        const data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        const url = eventUrl + '/' + eid + '/interested';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    onUnInterested() {
        const { eid } = this.state;

        const data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        const url = eventUrl + '/' + eid + '/uninterested';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    toggleGoing = () => {
        const { isGoing, going_and_interested_count } = this.state;

        if (isGoing) {
            this.setState({ isGoing: false, going_and_interested_count: going_and_interested_count - 1 }, () => this.onUnGoing());
        } else {
            this.setState({ isGoing: true, going_and_interested_count: going_and_interested_count + 1 }, () => this.onGoing());
        }
    }

    onGoing() {
        const { eid } = this.state;

        const data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        const url = eventUrl + '/' + eid + '/going';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    onUnGoing() {
        const { eid } = this.state;

        const data = { userId: LoggedUserCredentials.getUserId() };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        const url = eventUrl + '/' + eid + '/ungoing';

        fetch(url, config)
            .then(res => res.json())
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    renderListHeader = () => {

        const {
            start_date_time,
            end_date_time,
            location,
            media,
            event_name,
            description
        } = this.state.headerData;

        const width = Math.round(Dimensions.get('window').width);

        const { isInterested, isGoing, going_and_interested_count } = this.state;

        const start_date = new Date(start_date_time);

        const month = shorten_months[start_date.getMonth()];

        return (
            <View >
                {
                    media.length > 0 ?
                        <TouchableOpacity
                            style={{ marginBottom: 10 }}
                            activeOpacity={0.8}
                            onPress={() =>
                                this.setState(
                                    {
                                        photoModalVisible: true,
                                        mediaPaths: media
                                    }
                                )
                            }
                        >
                            <AutoResizeImage
                                width={Dimensions.get('window').width}
                                source={{ uri: eventUrl + '/media/' + media[0]._id + '/' + image_name() }}
                            />
                        </TouchableOpacity>
                        :
                        null
                }

                <View style={styles.eventDetailContainer} >
                    <View style={styles.eventDetailLeft}>
                        <Text style={{ color: Color.backgroundColor, letterSpacing: 2, fontSize: 16, lineHeight: 17 }}>{month}</Text>
                        <View />
                        <Text style={styles.eventDateStyle}>{start_date.getDate().toString()}</Text>
                    </View>
                    <View style={styles.eventDetailRight}>
                        <Text style={styles.eventNameStyle}>{event_name}</Text>
                    </View>
                </View>

                <View style={styles.row}>

                    <RkButton onPress={this.toggleInterested} rkType="clear" >
                        <View>
                            <FIcon
                                name={isInterested ? 'star' : 'star-o'}
                                size={20}
                                style={{ textAlign: 'center', color: isInterested ? Color.backgroundColor : 'black' }}
                            />
                            <Text style={{ color: isInterested ? Color.backgroundColor : 'black' }}>Interested</Text>
                        </View>
                    </RkButton>

                    <RkButton onPress={this.toggleGoing} rkType="clear" >
                        <View>
                            <FIcon
                                name={isGoing ? 'check-circle' : 'check-circle-o'}
                                size={20}
                                style={{ textAlign: 'center', color: isGoing ? Color.backgroundColor : 'black' }}
                            />
                            <Text style={{ color: isGoing ? Color.backgroundColor : 'black' }}>Going</Text>
                        </View>
                    </RkButton>

                    <RkButton onPress={() => { }} rkType="clear" >
                        <View>
                            <FIcon name='share' size={20} style={{ textAlign: 'center' }} />
                            <Text >Share</Text>
                        </View>
                    </RkButton>

                </View>

                {/* start divider */}
                <View style={{ width: '100%', height: 0.4, backgroundColor: 'grey' }} />

                {/* detail event info */}
                <View style={{ margin: 10 }}>
                    {/* going or interested people count */}
                    <View style={{ width: '100%', flexDirection: 'row', margin: 10 }}>
                        <View style={{ width: '10%' }} >
                            <FIcon name='users' size={20} color='black' />
                        </View>
                        <View style={{ width: '90%' }} >
                            <Text >{`${going_and_interested_count} going or interested`}</Text>
                        </View>
                    </View>
                    {/* start and end time of event */}
                    <View style={{ width: '100%', flexDirection: 'row', margin: 10 }}>
                        <View style={{ width: '10%' }} >
                            <FIcon name='clock-o' size={20} color='black' />
                        </View>
                        <View style={{ width: '90%' }} >
                            <Text>{`${moment(start_date_time).format('ddd, MMM DD [at] h:m A')} - ${moment(end_date_time).format('ddd, MMM DD [at] h:m A')}`}</Text>
                        </View>
                    </View>
                    {/* location of event */}
                    {
                        location ?
                            <View>
                                <View style={{ width: '100%', flexDirection: 'row', margin: 10 }}>
                                    <View style={{ width: '10%' }} >
                                        <FIcon name='map-marker' size={20} color='black' />
                                    </View>
                                    <View style={{ width: '90%' }} >
                                        <Text>{location.address}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={this.showMap} style={{ marginTop: 10 }}>
                                    <StaticMap
                                        latitude={location.lat}
                                        longitude={location.lon}
                                        zoom={13}
                                        size={{ width, height: 150 }}
                                        apiKey={Google_Api_Key}
                                    />
                                </TouchableOpacity>
                            </View>
                            :
                            null
                    }
                </View>

                {/* end divider */}
                <View style={{ width: '100%', height: 0.4, backgroundColor: 'grey' }} />

                {/* event description */}
                {
                    description ?
                        <View style={{ margin: 10 }}>
                            <Text style={{ fontWeight: '600', fontSize: 16, lineHeight: 17, marginVertical: 10, marginLeft: 10 }}>Details</Text>
                            <Text style={{ fontSize: 14, lineHeight: 15, paddingLeft: 10 }}>{description}</Text>
                        </View>
                        :
                        null

                }

                {/* some white spacer */}
                <View style={{ width: '100%', height: 10, backgroundColor: '#fff' }} />

                {/* what is on your mind  */}
                <TouchableOpacity onPress={this._navigate}>
                    <View style={{ flexDirection: 'row', height: scale(70) }}>
                        <View style={{ flex: 0.2, paddingLeft: 20, justifyContent: 'center' }}>
                            <ImageLoad
                                style={styles.avatar}
                                source={{ uri: baseUrl + '/users/' + LoggedUserCredentials.getUserId() + '/profile_pic' }}
                                placeholderSource={require('../../assets/images/avator.png')}
                                isShowActivity={false}
                            />
                        </View>
                        <View style={{ flex: 0.7, justifyContent: 'center' }}>
                            <View style={{ borderWidth: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center', height: scale(35) }}>
                                <Text>What's on your mind ?</Text>
                            </View>
                        </View>
                        <View style={{ flex: 0.2, marginLeft: 10, justifyContent: 'center' }}>
                            <FIcon name="picture-o" size={scale(25)} style={{ color: 'gray' }} />
                            <Text style={{ color: 'gray', fontSize: 13 }}>Photo</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* some white spacer */}
                <View style={{ width: '100%', height: 10, backgroundColor: '#fff', marginBottom: 5 }} />

            </View>
        );
    }

    _renderItem = (eachPost) => {
        const post = eachPost.item;

        return (
            <SubEventItem feed={post} {...this.props} />
        )
    }

    _keyExtractor = (post, index) => post._id + index;

    _onRefresh = () => {
        this.setState({ refreshing: true, page: 1, totalPages: 1 }, () => this.getData());
    }

    _renderFooter = () => {
        const { page, totalPages } = this.state;
        if (page === totalPages) return null;

        return (
            <View style={{ flex: 1 }}>
                <ActivityIndicator size='large' color={Color.backgroundColor} />
            </View>
        );
    }

    handleLoadMore = () => {
        const { page, totalPages } = this.state;

        // check if the current page reaches the last page
        if (page < totalPages) {
            this.setState({ page: page + 1 }, () => this.getData());
        }
    }

    updatePost = (post) => {
        if (post) {
            const uploadedPost = [post];
            this.setState(prevState =>
                (
                    { posts: [...uploadedPost, ...prevState.posts] }
                )
            );
            if (this.state.posts.length > 0) {
                // this.flatListRef.scrollToIndex({ animated: true, index: 0 });
                this.flatListRef.scrollToOffset({ x: 0, y: 0, animated: true });
            }
        }
    }

    _navigate = () => {
        this.props.navigation.navigate('CreateEventPost', { 'updatePost': this.updatePost, 'eid': this.state.eid });
    }

    _captureRef = ref => this.flatListRef = ref;

    _closePhotoView = () => this.setState({ photoModalVisible: false });

    setMapRef = ref => this.mapModal = ref;

    showMap = () => this.mapModal.open();

    render() {
        const {
            loading,
            refreshing,
            posts,
            photoModalVisible,
            mediaPaths,
            headerData
        } = this.state;

        let paths = [];

        if (mediaPaths) {
            paths = mediaPaths.map(path => {
                return { source: { uri: eventUrl + '/media/' + path._id + '/' + image_name() } };
            });
        }

        if (loading) {
            return (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={Color.backgroundColor} />
                </View>
            )
        }

        return (
            <View style={{ flex: 1 }}>

                <FlatList
                    ref={this._captureRef}
                    keyboardShouldPersistTaps={'handled'}
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListHeaderComponent={this.renderListHeader}
                    ListEmptyComponent={this.renderEmptyView}
                    initialNumToRender={10}
                    refreshing={refreshing}
                    data={posts}
                    renderItem={this._renderItem}
                    keyExtractor={this._keyExtractor}
                    onRefresh={this._onRefresh}
                    ListFooterComponent={this._renderFooter}
                    onEndReached={this.handleLoadMore}
                    onEndReachedThreshold={0.5}
                />

                <PhotoView
                    visible={photoModalVisible}
                    data={paths}
                    hideStatusBar={false}
                    hideCloseButton={true}
                    hideShareButton={true}
                    initial={0}
                    onDismiss={this._closePhotoView}
                />

                {
                    headerData.location ?
                        <MapModal
                            ref={this.setMapRef}
                            location={headerData.location}
                        />
                        : null
                }

            </View>
        )
    }
}

const styles = StyleSheet.create(
    {
        root: {
            flex: 1
        },
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        avatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
            overflow: 'hidden'
        },
        eventDetailContainer: {
            flex: 1,
            flexDirection: 'row',
            marginBottom: 15,
            marginTop: 10,
            marginLeft: 20
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
            fontSize: 17,
            fontWeight: '400',
            lineHeight: 18
        },
        eventString: {
            fontSize: 14,
            fontWeight: '200'
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: 10
        }
    }
)