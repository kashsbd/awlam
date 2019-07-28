import React from 'react';
import {
    FlatList,
    Image,
    View,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Text
} from 'react-native';

import {
    RkText,
    RkCard,
    RkButton
} from 'react-native-ui-kitten';

import {
    TimeAgo
} from '../../components';

import Icon from 'react-native-vector-icons/FontAwesome';

import Orientation from 'react-native-orientation';
import PhotoView from "@merryjs/photo-viewer";
import { FloatingAction } from 'react-native-floating-action';

import { articleUrl } from '../../utils/globle';
import ArticleSocialBar from './articleSocialBar';
import { checkResponse } from '../../utils/commonService';
import { scale } from '../../utils/scale';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

export class ArticleLists extends React.PureComponent {
    static navigationOptions = ({ navigation }) => ({
        title: 'Popular Articles',
        headerStyle: {
            backgroundColor: '#191e1f',
        },
        headerTitleStyle: {
            color: '#ECC951'
        },
        headerLeft: (
            <RkButton
                rkType='clear'
                contentStyle={{ color: '#ECC951' }}
                style={{ width: 40, marginLeft: 8 }}
                onPress={() => navigation.goBack(null)}>
                <Icon name="arrow-left" size={17} color='#ECC951' />
            </RkButton>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            //selected article id
            articleId: null,
            //initial datas
            articles: [],
            //flags to show loading sign
            articlesLoading: false,
            refreshing: false,
            //flag to show reload page
            showReloadPage: false,
            //different modals
            photoModalVisible: false,
            //media(image) path 
            mediaPath: null,
        }
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        this.setState({ articlesLoading: true }, () => this.getData());
    }

    getData() {
        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'GET',
        }

        fetch(articleUrl, config)
            .then(res => checkResponse(res, articleUrl, config).json())
            .then(resJson => {
                let reversedArray = resJson.reverse().push(null);
                this.setState({ articles: resJson, articlesLoading: false, showReloadPage: false });
            })
            .catch(err => { this.setState({ showReloadPage: true }); console.log(err) });
    }

    onRefresh() {
        this.setState({ refreshing: true });
        this.getData();
        this.setState({ refreshing: false });
    }

    goToEachArticle(selectedArticle) {
        this.props.navigation.navigate('EachArticle', { article: selectedArticle, 'refresh': () => this.getData() });
    }

    _keyExtractor(article) {
        if (article) {
            return article.id;
        }
    }

    _renderItem(eachArticle) {
        const article = eachArticle.item;
        if (article === null) {
            return (
                <View style={{ height: 100 }} />
            )
        }
        return (
            <TouchableOpacity
                delayPressIn={70}
                activeOpacity={0.8}
                onPress={this.goToEachArticle.bind(this, article)}>
                <RkCard rkType='imgBlock' style={styles.card}>
                    <Image rkCardImg source={{ uri: articleUrl + 'media/' + article.media.mediaId }} />
                    <View rkCardImgOverlay rkCardContent style={styles.overlay}>
                        <RkText
                            rkType='header4 inverseColor'
                            style={styles.headerColor}>
                            {article.title}
                        </RkText>
                        <TimeAgo time={article.createdDate} />
                    </View>
                    <View rkCardFooter style={{ height: scale(67) }}>
                        <ArticleSocialBar
                            getArticles={this.getData.bind(this)}
                            data={{ likes: article.likes, commentCount: article.comments.length, articleId: article.articleId }}
                        />
                    </View >
                </RkCard>
            </TouchableOpacity>
        )
    }

    navigate(route) {
        const { navigate } = this.props.navigation;
        switch (route) {
            case 'btn_upload_article': navigate('ArticleUpload', { 'refresh': () => this.getData() });
                break;
        }
    }

    renderNoArticles() {
        return (
            <View style={styles.centerLoading}>
                <Icon name="newspaper-o" size={50} style={{ color: '#fff' }} />
                <RkText style={{ color: '#fff' }}>No articles to show !</RkText>
                <RkText style={{ color: '#fff' }}>Please add your articles.</RkText>
                <RkButton
                    style={{ flexDirection: 'row', backgroundColor: '#ECC951', marginTop: scale(10) }}
                    onPress={() => this.navigate('btn_upload_article')}
                >
                    <Text style={{ color: '#191e1f' }}>Add Article</Text>
                </RkButton>
            </View>
        )
    }



    render() {
        const {
            articles,
            articlesLoading,
            refreshing,
            showReloadPage,
            mediaPath,
            photoModalVisible,
        } = this.state;

        if (showReloadPage) {
            return (
                <RkButton
                    rkType='clear'
                    onPress={() => this.getData()}
                    style={styles.centerLoading}
                >
                    <View>
                        <Icon name="wifi" size={50} style={{ marginLeft: scale(30) }} />
                        <RkText >Can't Connect !</RkText>
                        <View style={{ flexDirection: 'row', marginLeft: scale(19) }}>
                            <Icon name="refresh" size={15} style={{ lineHeight: scale(20), marginRight: scale(3) }} />
                            <Text>Tap to Retry</Text>
                        </View>
                    </View>
                </RkButton>
            )
        }

        return (
            <View style={styles.imgBack} >

                {
                    !articlesLoading ?
                        articles.length === 1 ?
                            this.renderNoArticles()
                            :
                            <FlatList
                                data={articles}
                                renderItem={this._renderItem.bind(this)}
                                keyExtractor={this._keyExtractor}
                                style={styles.container}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => this.onRefresh()}
                                    />
                                } />
                        :
                        <View style={styles.centerLoading}>
                            <ActivityIndicator size={50} color='#ECC951' />
                        </View>
                }

                {
                    articles.length === 1 ?
                        null :
                        <FloatingAction
                            actions={[]}
                            color='#ECC951'
                            distanceToEdge={15}
                            floatingIcon={<Icon name='plus' size={17} color='#191e1f' />}
                            showBackground={false}
                            onPressMain={
                                () => this.navigate('btn_upload_article')
                            }
                        />
                }


                <PhotoView
                    visible={photoModalVisible}
                    data={[{ source: { uri: mediaPath } }]}
                    hideStatusBar={false}
                    hideCloseButton={true}
                    hideShareButton={true}
                    initial={0}
                    onDismiss={e => {
                        // don't forgot set state back.
                        this.setState({ photoModalVisible: false });
                    }}
                />
            </View>
        )
    }
}

let styles = StyleSheet.create(
    {
        centerLoading: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        imgBack: {
            flex: 1,
            width: null,
            height: null,
        },
        card: {
            marginVertical: 8,
            backgroundColor: '#191e1f'
        },
        headerColor: {
            color: '#fff'
        },
        container: {
            marginVertical: 8,
            marginHorizontal: 8
        },
    }
);
