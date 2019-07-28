import React from 'react';

import {
    ScrollView,
    Image,
    View,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

import {
    RkCard,
    RkText
} from 'react-native-ui-kitten';

import { Avatar, TimeAgo } from '../../components';
import { scale } from '../../utils/scale';
import ArticleSocialBar from './articleSocialBar';
import { articleUrl, ownerProPicUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';


export class Article extends React.PureComponent {
    static navigationOptions = ({ navigation }) => ({
        title: 'Article',
        headerTitleStyle: {
            color: '#ECC951'
        },
        headerTintColor: '#ECC951',
        headerStyle: {
            backgroundColor: '#191e1f'
        }
    });

    constructor(props) {
        super(props);
        this.state = {
            //comments of an article
            comments: []
        };
    }

    getComments(articleId) {
        const url = articleUrl + articleId + '/comments';
        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        };

        fetch(url, config)
            .then(res => res.json())
            .then(resJson => this.setState({ comments: resJson, commentsLoading: false }))
            .catch(err => this.setState({ commentsLoading: false }))
    }

    render() {
        let params = this.props.navigation.state.params;
        let article = params.article;
        console.log(article);
        return (
            <ScrollView style={styles.root}>
                <RkCard rkType='article'>
                    <Image rkCardImg source={{ uri: articleUrl + 'media/' + article.media.mediaId }} />
                    <View rkCardHeader style={{ borderBottomWidth: 0 }}>
                        <View>
                            <RkText style={styles.title} rkType='header4'>{article.title}</RkText>
                            <TimeAgo time={article.createdDate} />
                        </View>
                        <TouchableOpacity onPress={() => alert('will go profile')}>
                            <Avatar rkType='circle' img={{ uri: ownerProPicUrl + '/' + article.ownerId }} />
                        </TouchableOpacity>
                    </View>
                    {
                        article.description != '' ?
                            <View rkCardContent>
                                <View>
                                    <RkText rkType='primary3 bigLine'>{article.description}</RkText>
                                </View>
                            </View>
                            : <View />
                    }
                    <View rkCardFooter style={{ height: scale(67) }}>
                        <ArticleSocialBar
                            getArticles={() => params.refresh()}
                            data={{ likes: article.likes, commentCount: article.comments.length, articleId: article.articleId }}
                        />
                    </View>
                </RkCard>
            </ScrollView>
        )
    }
}

let styles = StyleSheet.create(
    {
        root: {
            backgroundColor: '#191e1f'
        },
        title: {
            marginBottom: 5,
            color: '#ECC951'
        },
    }
);