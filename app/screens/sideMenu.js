import React, { Component } from 'react';

import {
    View,
    StyleSheet,
    Platform,
    ScrollView,
    TouchableOpacity,
    AsyncStorage,
    Text
} from 'react-native';

import ImageLoad from 'react-native-image-placeholder';
import FIcons from 'react-native-vector-icons/Feather';

import {
    RkButton,
    RkText
} from 'react-native-ui-kitten';

import { Menu } from '../components';
import { scale } from '../utils/scale';
import LoggedUserCredentials from '../utils/modal/LoggedUserCredentials';
import { baseUrl } from '../utils/globle';
import { NotificationService } from '../utils/service';
import { Color } from '../utils/color';

export class SideMenu extends Component {
    constructor(props) {
        super(props);
    }

    onLogOut = async () => {
        const keys = ['accessToken', 'userId', 'userName', 'playerId', 'role'];

        const data = { playerId: LoggedUserCredentials.getPlayerId() };

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        }

        const url = baseUrl + '/users/' + LoggedUserCredentials.getUserId() + '/logout';

        try {
            const res = await fetch(url, config);
            const status = res.status;
            switch (status) {
                case 401: {
                    alert('Session time out !');
                    break;
                }
                case 500: {
                    alert('Something went wrong.Please try later !');
                    break;
                }
                case 200: {
                    try {
                        await AsyncStorage.multiRemove(keys);
                        await NotificationService.deleteAll();
                        this.props.navigation.navigate('SignIn');
                    } catch (e) {
                        console.log("cannot store data");
                    }
                    break;
                }
            }
        } catch (err) {
            alert("Please connect to internet and try again !");
        }
    }

    testData() {
        alert('Setting');
    }

    _navigateToProfile = () => {
        const { navigation } = this.props;
        navigation.navigate('MainProfile', { userId: LoggedUserCredentials.getUserId() });
    }

    render() {
        const { navigation } = this.props;
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.container}
            >
                <View style={styles.header}>
                    <RkButton
                        disabled={true}
                        rkType='clear'
                        onPress={() => alert('Notifications')}>
                    </RkButton>
                    <RkButton
                        disabled={true}
                        rkType='clear'
                        onPress={() => this.testData()}>
                        {/* <Icon name="gear" size={30} color='#ECC951' /> */}
                    </RkButton>
                </View>
                <TouchableOpacity onPress={this._navigateToProfile}>
                    <View style={styles.imgContainer} >
                        <ImageLoad
                            source={{ uri: baseUrl + '/users/' + LoggedUserCredentials.getUserId() + '/profile_pic' }}
                            placeholderSource={require('../assets/images/avator.png')}
                            style={styles.img}
                            isShowActivity={false}
                        />
                        <RkText style={styles.txt}>{LoggedUserCredentials.getUserName()}</RkText>
                    </View>
                </TouchableOpacity>
                <View style={styles.itemContainer}>
                    <View style={styles.row}>
                        <Menu
                            iconName='rss-square'
                            menuName='Feeds'
                            onClick={() => navigation.navigate('Post')}
                        />
                        <Menu
                            iconName='heart'
                            menuName='Cele'
                            onClick={() => alert('We are working on it.\nComming soon.')}
                        />
                        <Menu
                            iconName='newspaper-o'
                            menuName='News'
                            onClick={() => alert('We are working on it.\nComming soon.')}
                        />
                    </View>
                    <View style={styles.row}>
                        <Menu
                            iconName='users'
                            menuName='Citizen'
                            onClick={() => navigation.navigate('Citizen')}
                        />
                        <Menu
                            iconName='bookmark-o'
                            menuName='Events'
                            onClick={() => navigation.navigate("Event")}
                        />
                        <Menu
                            iconName='newspaper-o'
                            menuName='Topics'
                            onClick={() => navigation.navigate('Topic')}
                        />
                    </View>
                    <View style={styles.row}>

                        <Menu
                            style={LoggedUserCredentials.getRole() === 'ADMIN' ? undefined : { width: 0, height: 0 }}
                            iconName='user-plus'
                            menuName='Users'
                            onClick={() => navigation.navigate('User')}
                        />

                        <Menu
                            style={LoggedUserCredentials.getRole() === 'ADMIN' ? { marginRight: 35 } : undefined}
                            iconName='star-o'
                            menuName='Governments'
                            onClick={() => navigation.navigate('Government')}
                        />

                        <Menu
                            style={{ width: 0, height: 0 }}
                            iconName='bookmark-o'
                            menuName='Users'
                            onClick={() => navigation.navigate('User')}
                        />

                    </View>
                </View>
                <View style={styles.footer} >
                    {/* <RkButton
                            rkType='stretch outline'
                            contentStyle={{ color: '#ECC951' }}
                            style={styles.btn}>
                            Invite Friends
                        </RkButton> */}
                    {/* <RkButton
                            rkType='stretch outline'
                            contentStyle={{ color: '#ECC951' }}
                            style={styles.btn}>
                            Submit Feedback
                        </RkButton> */}
                    <RkButton
                        onPress={this.onLogOut}
                        rkType='stretch outline'
                        style={styles.btn}>
                        <Text style={{ color: Color.fontColor, fontSize: 18 }}>Log Out</Text>
                    </RkButton>
                </View>
            </ScrollView>
        )
    }
}

let styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            paddingTop: Platform.OS === 'ios' ? scale(20) : 0,
            backgroundColor: Color.backgroundColor,

        },
        header: {
            height: 60,
            flex: 1,
            flexDirection: 'row',
            marginHorizontal: scale(15),
            justifyContent: 'space-between',
        },
        imgContainer: {
            flex: 3,
            justifyContent: 'center',
            alignItems: 'center',
        },
        img: {
            width: scale(130),
            height: scale(130),
            borderWidth: 0.5,
            marginBottom: 15,
            borderColor: Color.fontColor,
            overflow: 'hidden',
            borderRadius: scale(130 / 2)
        },
        txt: {
            color: Color.fontColor
        },
        itemContainer: {
            flex: 3,
            marginHorizontal: 23,
            marginTop: 30,
        },
        row: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 10
        },
        footer: {
            flex: 5,
            justifyContent: 'flex-end',
            marginVertical: 20,
        },
        btn: {
            marginTop: 10,
            marginHorizontal: 23,
            borderColor: Color.fontColor
        }
    }
);
