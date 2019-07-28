import React, { PureComponent } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Text
} from 'react-native';

import {
    RkText,
    RkButton
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';

import { Color } from '../../utils/color';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { baseUrl } from '../../utils/globle';
import EachLiker from '../social/eachLiker';

export class FollowingModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            datas: [],
            loading: true,
        }
    }

    close = () => this.setState({ modalVisible: false });

    open = () => {
        this.setState({ modalVisible: true });
        const { userId } = this.props;

        let form_data = { visitorId: LoggedUserCredentials.getUserId() }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: JSON.stringify(form_data)
        };

        const url = baseUrl + '/users/' + userId + '/followings';

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => this.setState({ datas: resJson.datas, loading: false }))
            .catch(err => alert('Something went wrong.Please try later.'));
    }

    renderLoading() {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size={30} color={Color.backgroundColor} />
            </View>
        )
    }

    _KeyExtractor = item => item.userId;

    _renderItem = ({ item }) => {
        return (
            <EachLiker
                name={item.name}
                role={item.role}
                userId={item.userId}
                status={item.status}
            />
        );
    }

    renderEmptyView = () => {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="user" size={scale(40)} style={{ color: Color.backgroundColor }} />
                <Text style={{ color: Color.backgroundColor, fontWeight: '600', fontSize: 18 }}>No Following Yet</Text>
            </View>
        )
    }

    render() {
        const { modalVisible, datas, loading } = this.state;

        return (
            <Modal
                animationType="fade"
                transparent={false}
                visible={modalVisible}
                onRequestClose={this.close}
            >
                <View style={styles.mainContainer}>
                    <View style={styles.headerBar}>
                        <RkButton
                            rkType='clear'
                            style={{ width: 40 }}
                            onPress={this.close}>
                            <Icon name='arrow-left' color='#fff' size={17} />
                        </RkButton>
                        <RkText style={{ paddingTop: scale(8), marginLeft: scale(15), color: '#fff' }}>Followers</RkText>
                    </View>
                    {
                        loading ?
                            this.renderLoading()
                            :
                            <FlatList
                                contentContainerStyle={{ flexGrow: 1 }}
                                style={styles.root}
                                ListEmptyComponent={this.renderEmptyView}
                                initialNumToRender={10}
                                data={datas}
                                keyExtractor={this._KeyExtractor}
                                renderItem={this._renderItem}
                            />
                    }
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create(
    {
        mainContainer: {
            flex: 1
        },
        headerBar: {
            flexDirection: 'row',
            minHeight: 55,
            padding: 5,
            backgroundColor: Color.backgroundColor
        },
        root: {
            backgroundColor: 'white',
            flex: 1
        },
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
        },
    }
);