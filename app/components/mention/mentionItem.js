import React from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet
} from 'react-native';

import ImageLoad from 'react-native-image-placeholder';
import { baseUrl } from '../../utils/globle';


const MentionItem = ({ item, onSuggestionTap }) => {

    return (
        <TouchableOpacity onPress={() => onSuggestionTap(item)}>
            <View style={styles.suggestionsRowContainer}>
                <View style={styles.userIconBox}>
                    <ImageLoad
                        style={styles.avatar}
                        source={{ uri: baseUrl + '/users/' + item._id + '/profile_pic' }}
                        placeholderSource={require('../../assets/images/avator.png')}
                        isShowActivity={false}
                    />
                </View>
                <View style={styles.userDetailsBox}>
                    <Text style={styles.displayNameText}>{item.name}</Text>
                    <Text style={styles.usernameText}>@{item.name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export {
    MentionItem
}

const styles = StyleSheet.create(
    {
        suggestionsRowContainer: {
            flexDirection: 'row',
            margin: 5
        },
        userIconBox: {
            height: 60,
            width: 60,
            alignItems: 'center',
            justifyContent: 'center'
        },
        avatar: {
            marginRight: 16,
            width: 60,
            height: 60,
            overflow: 'hidden'
        },
        usernameInitials: {
            color: '#fff',
            fontWeight: '800',
            fontSize: 14
        },
        userDetailsBox: {
            flex: 1,
            justifyContent: 'center',
            paddingLeft: 5,
            paddingRight: 15
        },
        displayNameText: {
            fontSize: 13,
            fontWeight: '500'
        },
        usernameText: {
            fontSize: 12,
            color: 'rgba(0,0,0,0.6)'
        }
    }
);

