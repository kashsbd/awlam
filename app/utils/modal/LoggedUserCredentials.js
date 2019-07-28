import { AsyncStorage } from 'react-native';

export default class LoggedUserCredentials {
    accessToken = '';
    userName = '';
    userId = '';
    playerId = '';
    role = '';
    hasNoti = false;

    static setLoggedUserData(accessToken, userName, userId, playerId, role) {
        this.accessToken = accessToken;
        this.userName = userName;
        this.userId = userId;
        this.playerId = playerId;
        this.role = role;
    }

    static getAccessToken() {
        return this.accessToken;
    }

    static setAccessToken(accessToken) {
        this.accessToken = accessToken;
        AsyncStorage.setItem('accessToken', accessToken)
    }

    static setUserName(name) {
        this.userName = name;
        AsyncStorage.setItem('userName', name)
    }

    static getUserName() {
        return this.userName;
    }

    static getUserId() {
        return this.userId;
    }

    static getRole() {
        return this.role;
    }

    static setPlayerId(playerId) {
        this.playerId = playerId;
    }

    static getPlayerId() {
        return this.playerId;
    }

    static setNoti(noti) {
        this.hasNoti = noti;
    }

    static getNoti() {
        return this.hasNoti;
    }
}