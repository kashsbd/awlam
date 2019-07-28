import React from 'react';
import {
    Animated,
    FlatList,
    View,
    StyleSheet,
    ActivityIndicator
} from 'react-native';

import { Color } from '../../utils/color';
import { MentionItem } from './mentionItem';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { baseUrl } from '../../utils/globle';

export class MentionBoxWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            suggestionRowHeight: new Animated.Value(0),
            isTrackingStarted: false,
            messages: [],
            mentions: [],
            keyword: "",
            data: []
        }

        this.isTrackingStarted = false;
        this.previousChar = " ";
        this.arrayholder = [];
    }

    getUsers(keyword) {
        const user_id = LoggedUserCredentials.getUserId();

        const url = baseUrl + '/users/' + user_id + '/search?query=' + keyword;

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        }

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => { this.setState({ data: resJson }); this.arrayholder = resJson })
            .catch(error => this.setState({ data: [] }));
    }

    componentDidMount() {
        this.getUsers(this.state.keyword);
    }

    renderLoadingComponent = () => {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator />
            </View>
        )
    }

    _renderItem = ({ item }) => {
        return (
            <MentionItem
                item={item}
                onSuggestionTap={this.onSuggestionTap}
            />
        )
    }

    onSuggestionTap = (user) => {
        this.isTrackingStarted = false;
        this.closeSuggestionsPanel();

        const user_obj = { name: user.name.replace(/ /g, ''), user_id: user._id };

        this.setState({ isTrackingStarted: false }, () => this.props.onNamePress(user_obj));
    }

    _keyExtractor = (data, index) => index;

    startTracking() {
        this.isTrackingStarted = true;
        this.openSuggestionsPanel();
        this.setState({ isTrackingStarted: true });
    }

    stopTracking() {
        this.isTrackingStarted = false;
        this.closeSuggestionsPanel();
        this.setState({ isTrackingStarted: false });
    }

    openSuggestionsPanel(height) {
        Animated.timing(this.state.suggestionRowHeight, {
            toValue: height ? height : 150,
            duration: 100,
        }).start();
    }

    closeSuggestionsPanel() {
        Animated.timing(this.state.suggestionRowHeight, {
            toValue: 0,
            duration: 100,
        }).start();
    }

    updateSuggestions(lastKeyword) {
        let temp = lastKeyword;
        const query = temp.replace('@', '');

        const newData = this.arrayholder.filter(item => {

            const itemData = item.name.toUpperCase();

            const textData = query.toUpperCase();

            return itemData.indexOf(textData) > -1;
        });

        if (newData && newData.length === 0) {
            this.stopTracking();
        }

        this.setState({ data: newData });
    }


    identifyKeyword(val) {
        if (this.isTrackingStarted) {
            const pattern = new RegExp(`\\${'B'}${'@'}[a-z0-9_-]+|\\${'B'}${'@'}`, `gi`);
            const keywordArray = val.match(pattern);
            if (keywordArray && !!keywordArray.length) {
                const lastKeyword = keywordArray[keywordArray.length - 1];
                this.setState({ keyword: lastKeyword }, () => this.updateSuggestions(lastKeyword));
            }
        }
    }

    onChangeText = (text) => {
        const lastChar = text.substr(text.length - 1);
        const wordBoundry = this.previousChar.trim().length === 0;
        // lastChar === '@' && wordBoundry
        if (lastChar === '@') {
            this.startTracking();
        } else if (lastChar === ' ' && this.state.isTrackingStarted || text === "") {
            this.stopTracking();
        }

        this.previousChar = lastChar;
        this.identifyKeyword(text);
    }

    render() {
        const { suggestionRowHeight, data } = this.state;
        const { children, style } = this.props;

        return (
            <View style={style}>
                <Animated.View style={[styles.suggestionsPanelStyle, { height: suggestionRowHeight }]}>
                    <FlatList
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps={'handled'}
                        keyboardDismissMode="on-drag"
                        horizontal={false}
                        enableEmptySections={true}
                        data={data}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />
                </Animated.View>
                {children}
            </View>
        )
    }
}


const styles = StyleSheet.create(
    {
        suggestionsPanelStyle: {
            backgroundColor: Color.fontColor,
            zIndex: 1000,
            position: "absolute",
            bottom: 60,
            width: '100%',
            marginBottom: 2
        },
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }
    }
);