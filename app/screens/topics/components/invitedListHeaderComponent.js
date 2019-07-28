import React, { PureComponent } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

import { TopicItem, AllPrivateTopicModal } from './';

import FIcon from 'react-native-vector-icons/FontAwesome';

import { Color } from '../../../utils/color';
import { scale } from '../../../utils/scale';

export class InvitedListHeaderComponent extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            posts: props.posts,
            temp_posts: props.posts.length >= 4 ? props.posts.slice(0, 3) : props.posts
        }
    }

    _keyExtractor = (post, index) => post._id + index;

    _loadMore = () => this.all_private_modal.open();

    _renderFooter = () => {
        const { posts, temp_posts } = this.state;

        if (posts.length === temp_posts.length) return null;

        if (posts.length > temp_posts.length) {
            return (
                <View style={{ flex: 1, marginBottom: 10 }}>
                    <TouchableOpacity
                        style={styles.btnStyle}
                        onPress={this._loadMore}
                    >
                        <Text style={{ color: 'black', padding: scale(7) }}>See More</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    _renderItem = ({ item, index }) => {
        return (
            <TopicItem feed={item} {...this.props} />
        )
    }

    renderListHeader = () => {
        return (
            <Text style={styles.titleStyle} >Your Private Topics</Text>
        )
    }

    setRef = ref => this.all_private_modal = ref;

    render() {
        const {
            temp_posts
        } = this.state;

        return (
            <View style={styles.root}>
                <FlatList
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListHeaderComponent={this.renderListHeader}
                    initialNumToRender={3}
                    data={temp_posts}
                    renderItem={this._renderItem}
                    keyExtractor={this._keyExtractor}
                    ListFooterComponent={this._renderFooter}
                />
                <AllPrivateTopicModal ref={this.setRef} {...this.props} />
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
        btnStyle: {
            backgroundColor: Color.fontColor,
            height: scale(40),
            alignItems: 'center',
            justifyContent: 'center'
        },
        headerStyle: {
            backgroundColor: Color.fontColor,
            height: scale(55),
            justifyContent: 'center'
        },
        titleStyle: {
            fontSize: 17,
            fontWeight: '500',
            marginTop: 7,
            marginLeft: 5
        }
    }
)