import React, { PureComponent } from 'react';

import {
    StyleSheet,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';

import {
    AllTopicList,
    InvitedTopicList
} from './';

import { RkButton } from 'react-native-ui-kitten';
import { TabView, TabBar } from 'react-native-tab-view';

import EIcon from 'react-native-vector-icons/Entypo';
import FIcon from 'react-native-vector-icons/FontAwesome';

import { Color } from '../../utils/color';
import { scale } from '../../utils/scale';

export class TopicList extends PureComponent {

    static navigationOptions = ({ navigation }) => ({
        title: 'Topic Posts',
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
                style={{ width: 40, marginLeft: 8 }}
                onPress={navigation.openDrawer}
            >
                <FIcon name='bars' size={20} color={Color.fontColor} />
            </RkButton>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            index: 1,
            routes: [
                { key: 'first', title: 'Private' },
                { key: 'second', title: 'Public' }
            ]
        };
    }

    updatePost = (post) => {
        this.setState({ index: 1 }, () => this.allTopicRef.scrollToTop(post));
    }

    _navigate = () => {
        this.props.navigation.navigate('CreateTopic', { 'updatePost': this.updatePost });
    }

    _renderTabBar = props => (
        <TabBar
            {...props}
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
                return <InvitedTopicList {...this.props} />;
            case 'second':
                return <AllTopicList ref={ref => this.allTopicRef = ref} {...this.props} />;
            default:
                return null;
        }
    }

    render() {
        return (
            <View style={styles.root}>
                <TabView
                    navigationState={this.state}
                    renderScene={this._renderScene}
                    renderTabBar={this._renderTabBar}
                    onIndexChange={this._handleIndexChange}
                    initialLayout={{ width: Dimensions.get('window').width }}
                    useNativeDriver
                />
                {/* fab button */}
                <TouchableOpacity
                    onPress={this._navigate}
                    style={styles.fabButton}
                >
                    <EIcon name="plus" style={{ color: Color.fontColor, fontSize: 30, margin: 5 }} />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1
    },
    fabButton: {
        position: 'absolute',
        bottom: 15,
        right: 10,
        width: 60,
        height: 60,
        backgroundColor: Color.backgroundColor,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2
    },
    tabbar: {
        backgroundColor: Color.backgroundColor
    },
    tab: {
        width: scale(Dimensions.get('window').width / 2),
    },
    indicator: {
        backgroundColor: Color.fontColor
    },
    label: {
        color: '#fff',
        fontWeight: '400',
    }
})