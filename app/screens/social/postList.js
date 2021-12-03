import React from 'react';
import {
    View,
    Text,
    AppState,
    StyleSheet,
    Dimensions
} from 'react-native';

import {
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';
import Orientation from 'react-native-orientation';
import { FloatingAction } from 'react-native-floating-action';
import { TabView, TabBar } from 'react-native-tab-view';
import io from 'socket.io-client/dist/socket.io';

import { scale } from '../../utils/scale';
import { FontAwesome } from '../../assets/icons';
import { AllPostList } from './allPostList';
import { PopularPostList } from './popularPostList';
import { FollowerPostList } from './followerPostList';
import { NotificationService } from '../../utils/service';
import { NotificationModel } from '../../utils/modal/notificationModel';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { baseUrl } from '../../utils/globle';

import { Color } from '../../utils/color';

import { SearchBar } from './searchBar';

export class PostList extends React.PureComponent {
    static navigationOptions = ({ navigation }) => ({
        title: 'Search',
        headerTitle: <SearchBar onPress={() => navigation.state.params.goToSearch()} />,
        headerStyle: {
            backgroundColor: Color.backgroundColor,
            elevation: 0
        },
        headerTitleStyle: {
            color: Color.fontColor
        },
        headerLeft: (
            <RkButton
                rkType='clear'
                style={{ width: 40, marginLeft: scale(8) }}
                onPress={() => navigation.openDrawer()}>
                <Icon name='bars' size={20} color={Color.fontColor} />
            </RkButton>
        ),
        headerRight: (
            <View style={{ flexDirection: 'row' }}>
                <RkButton
                    rkType='clear'
                    style={{ marginRight: 20 }}
                    onPress={() => navigation.state.params.goToSearch()}>
                    <Icon name="search" size={scale(23)} color={Color.fontColor} />
                </RkButton>

                <View style={{ height: '100%', position: 'relative' }}>
                    {
                        navigation.state.params != undefined ?
                            navigation.state.params.hasNoti ?
                                <Text style={styles.badge}></Text>
                                : null
                            : null
                    }
                    <RkButton
                        rkType='clear'
                        style={{ marginRight: 20 }}
                        onPress={() => navigation.state.params.goToNavigationPage()}>
                        <Icon name="bell-o" size={scale(23)} color={Color.fontColor} />
                    </RkButton>
                </View>
            </View>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            index: 1,
            routes: [
                { key: 'first', title: 'Hot' },
                { key: 'second', title: 'Public' },
                { key: 'third', title: 'News' },
                { key: 'fourth', title: 'Follower' },
                { key: 'fifth', title: 'Cele' }
            ],
        };

        this.noti_socket = io(baseUrl + '/all_noties?userId=' + LoggedUserCredentials.getUserId());
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        this.subscribeToNotiSocket();
        this.getUnsavedNotis();
        AppState.addEventListener('change', this._handleAppStateChange);
        this.props.navigation.setParams({ hasNoti: LoggedUserCredentials.getNoti(), goToNavigationPage: this._goToNavigationPage, goToSearch: this._goToSearch });
    }

    _onNotiReceived = (data) => {
        LoggedUserCredentials.setNoti(true);
        this.props.navigation.setParams({ hasNoti: true });
        this.saveNoti(data);
    };

    subscribeToNotiSocket() {
        this.noti_socket.on('noti::created', this._onNotiReceived);
    }

    _goToSearch = () => {
        this.props.navigation.navigate('Search');
    }

    _handleAppStateChange = async (nextAppState) => {
        if (nextAppState) {

            const form_data = {
                playerId: LoggedUserCredentials.getPlayerId(),
                status: nextAppState
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
                },
                method: 'POST',
                body: JSON.stringify(form_data)
            }

            const url = baseUrl + '/users/' + LoggedUserCredentials.getUserId() + '/notifyAppChange';

            try {
                const res = await fetch(url, config);
                const status = res.status;
                switch (status) {
                    case 401: {
                        // alert('Something went wrong.Please try later !');
                        break;
                    }
                    case 500: {
                        // alert('Something went wrong.Please try later !');
                        break;
                    }
                    case 200: {
                        break;
                    }
                }
            } catch (err) {
                // alert("Please connect to internet and try again !");
            }
        }
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.noti_socket.off('noti::created', this._onNotiReceived);
    }

    async  getUnsavedNotis() {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        }

        const url = baseUrl + '/users/' + LoggedUserCredentials.getUserId() + '/getUnsavedNotis';

        try {
            const res = await fetch(url, config);
            const status = res.status;
            switch (status) {
                case 401: {
                    // alert('Something went wrong.Please try later !');
                    break;
                }
                case 500: {
                    // alert('Something went wrong.Please try later !');
                    break;
                }
                case 200: {
                    const resJson = await res.json();
                    if (resJson && resJson.length > 0) {
                        this.props.navigation.setParams({ hasNoti: true });
                        LoggedUserCredentials.setNoti(true);
                        for (let eachNoti of resJson) {
                            this.saveNoti(eachNoti);
                        }
                    }
                    break;
                }
            }
        } catch (err) {
            // alert("Please connect to internet and try again !");
        }
    }

    async saveNoti(noti) {
        if (noti) {
            const notiModel = new NotificationModel(noti);
            NotificationService.save(notiModel);

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
                },
                method: 'POST',
            }

            const url = baseUrl + '/notifications/' + noti._id + '/notifySaved';

            try {
                const res = await fetch(url, config);
                const status = res.status;
                switch (status) {
                    case 401: {
                        // alert('Something went wrong.Please try later !');
                        break;
                    }
                    case 500: {
                        // alert('Something went wrong.Please try later !');
                        break;
                    }
                    case 200: {
                        break;
                    }
                }
            } catch (err) {
                // alert("Please connect to internet and try again !");
            }
        }
    }

    _goToNavigationPage = () => {
        this.props.navigation.navigate('Noti');
        this.props.navigation.setParams({ hasNoti: false });
        LoggedUserCredentials.setNoti(false);
    }

    _navigate = (route) => {
        const { navigate } = this.props.navigation;

        switch (route) {
            case 'btn_upload_post': navigate('PostUpload', { 'updatePost': this.updatePost });
                break;
        }
    }

    updatePost = (post) => {
        this.setState({ index: 1 }, () => this.allPostRef.scrollToTop(post));
    }

    _handleResults = () => {

    }

    _renderTabBar = props => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={styles.indicator}
            style={styles.tabbar}
            tabStyle={styles.tab}
            labelStyle={styles.label}
        />
    );

    _handleIndexChange = index => this.setState({ index });

    _renderScene = ({ route }) => {
        switch (route.key) {
            case 'first':
                return <PopularPostList {...this.props} />;
            case 'second':
                return <AllPostList ref={ref => this.allPostRef = ref} {...this.props} />;
            case 'third':
                return <FollowerPostList {...this.props} />;
            default:
                return null;
        }
    }

    render() {
        const actions = [
            {
                color: Color.fabColor,
                text: 'Create Post',
                icon: (<Icon name='upload' size={scale(18)} color={Color.fontColor} />),
                name: 'btn_upload_post',
                position: 1
            }
        ];

        return (
            <View style={{ flex: 1 }}>
                <TabView
                    navigationState={this.state}
                    renderScene={this._renderScene}
                    renderTabBar={this._renderTabBar}
                    onIndexChange={this._handleIndexChange}
                    initialLayout={{
                        width: Dimensions.get('window').width
                    }}
                    useNativeDriver
                />
                <FloatingAction
                    actions={actions}
                    color={Color.fabColor}
                    distanceToEdge={scale(15)}
                    floatingIcon={<Icon name='plus' size={scale(17)} color={Color.fontColor} />}
                    onPressItem={this._navigate}
                />
            </View>
        )
    }
}

let styles = StyleSheet.create(
    {
        badge: {
            width: scale(10),
            height: scale(10),
            textAlign: 'center',
            textAlignVertical: 'center',
            position: 'absolute',
            zIndex: 10,
            bottom: 18,
            right: 18,
            padding: scale(2),
            backgroundColor: 'red',
            borderRadius: scale(5)
        },
        tabbar: {
            backgroundColor: Color.backgroundColor
        },
        tab: {
            width: scale(115),
        },
        indicator: {
            backgroundColor: Color.fontColor
        },
        label: {
            color: '#fff',
            fontWeight: '400',
        }
    }
);
