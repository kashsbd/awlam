import React, { Component } from 'react';
import {
    View,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TextInput
} from 'react-native';

import {
    PeopleList,
    PostsList
} from './';

import { RkText, RkButton } from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';
import FIcon from 'react-native-vector-icons/Feather';
import { TabView, TabBar } from 'react-native-tab-view';

import { scale } from '../../utils/scale';
import { Color } from '../../utils/color';

export class SearchPage extends Component {
    static navigationOptions = () => ({
        header: null
    });

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            index: 0,
            routes: [
                { key: 'first', title: 'People' },
                { key: 'second', title: 'Posts' },
                { key: 'third', title: 'News' },
                { key: 'fourth', title: 'Cele' }
            ],
            searchText: ''
        }
    }

    renderLoading() {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator color={Color.backgroundColor} size={scale(30)} />
            </View>
        )
    }

    renderErrorView() {
        return (
            <View style={styles.centerContent}>
                <Icon name="comments-o" size={scale(50)} />
                <RkText >Something went wrong !</RkText>
            </View>
        )
    }

    _capturePeopleRef = ref => this.people_ref = ref;

    _capturePostRef = ref => this.post_ref = ref;

    _renderScene = ({ route }) => {
        const { searchText } = this.state;

        switch (route.key) {
            case 'first':
                return (
                    <PeopleList
                        query={searchText}
                        ref={this._capturePeopleRef}
                        {...this.props}
                    />
                );
            case 'second':
                return (
                    <PostsList
                        query={searchText}
                        ref={this._capturePostRef}
                        {...this.props}
                    />);
            case 'third':
                return <View {...this.props} />;
            default:
                return null;
        }
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

    _close = () => this.props.navigation.goBack();

    _handleTextInput = text => {
        this.setState({ searchText: text });

        switch (this.state.index) {
            case 0: this.people_ref.searchPeople(text);;
                break;

            case 1: this.post_ref.searchPosts(text);
                break;

            case 2: () => { };
                break;
        }
    }

    _clearText = () => this.setState({ searchText: '' });

    render() {
        const { loading, searchText } = this.state;

        if (loading) {
            this.renderLoading();
        }

        return (
            <View style={{ flex: 1 }} >
                <View style={styles.headerBar}>
                    <View style={{ flex: 0.18, justifyContent: 'center' }}>
                        <RkButton
                            rkType='clear'
                            style={{ width: 50, paddingLeft: 5 }}
                            onPress={this._close}>
                            <Icon name='arrow-left' color={Color.fontColor} size={17} />
                        </RkButton>
                    </View>
                    <View style={{ flex: 0.9, justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <TextInput
                                style={styles.searchBar}
                                placeholder='Search'
                                placeholderTextColor="#919188"
                                underlineColorAndroid="transparent"
                                autoCapitalize="none"
                                onChangeText={this._handleTextInput}
                                value={searchText}
                                maxLength={33}
                                returnKeyType='search'
                            />
                            {
                                searchText ?
                                    <TouchableOpacity
                                        style={styles.crossBtnStyle}
                                        onPress={this._clearText}
                                    >
                                        <FIcon name='x' size={17} color='black' />
                                    </TouchableOpacity>
                                    :
                                    null
                            }
                        </View>
                    </View>
                    <View style={{ flex: 0.08, justifyContent: 'center' }} />
                </View>
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
            </View>
        )
    }

}

let styles = StyleSheet.create({
    root: {
        backgroundColor: Color.fontColor,
        flexGrow: 1
    },
    headerBar: {
        flexDirection: 'row',
        minHeight: 55,
        backgroundColor: Color.backgroundColor
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.fontColor
    },
    indicator: {
        backgroundColor: Color.fontColor
    },
    tabbar: {
        backgroundColor: Color.backgroundColor
    },
    tab: {
        width: scale(115),
    },
    label: {
        color: '#fff',
        fontWeight: '400',
    },
    txtInput: {
        borderWidth: 1,
        borderBottomWidth: 1,
        borderColor: Color.backgroundColor,
        borderBottomColor: Color.backgroundColor
    },
    iconStyle: {
        fontSize: scale(25),
        marginLeft: scale(25),
        color: Color.backgroundColor
    },
    searchBar: {
        borderRadius: 5,
        backgroundColor: "white",
        height: 38,
        fontSize: 15,
        width: '100%',
        paddingHorizontal: 10
    },
    crossBtnStyle: {
        alignSelf: 'center',
        position: 'absolute',
        right: 10,
        width: 20
    }
});