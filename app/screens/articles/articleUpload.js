import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Modal,
    ActivityIndicator
} from 'react-native';

import PhotoView from "@merryjs/photo-viewer";
import ImagePicker from 'react-native-image-crop-picker';
import Icons from 'react-native-vector-icons/Entypo';
import FIcons from 'react-native-vector-icons/Feather';
import * as Progress from 'react-native-progress';

const { height } = Dimensions.get('window');
import { articleUrl } from '../../utils/globle';
import futch from '../../utils/futch';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

export class ArticleUpload extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: 'Article Upload',
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
            pickerData: '',
            images: null,
            renderImage: false,
            avatarImgBorder: false,
            modalVisible: false,
            modalImagePath: '',
            headerText: '',
            descriptionText: '',
            showActivityIndicator: false,
            progress: 0
        }
    }

    async pickImageOrVedio() {
        const img = await ImagePicker.openPicker({ height: 300, width: 300 });
        this.setState({ images: img, renderImage: true });

    }

    renderImages() {
        const { images } = this.state;
        if (images) {
            return (
                <View key={images.path} style={styles.scrollImg}>
                    <TouchableOpacity onPress={() => this.setState({ modalVisible: true, modalImagePath: images.path })}>
                        <Image key={images.path} source={{ uri: images.path }} style={{ width: 300, height: 300, resizeMode: 'contain', borderWidth: 2, borderColor: '#FFEB3B' }} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.setState({ images: null, renderImage: false })} style={styles.removeLogo}>
                        <FIcons name='delete' style={{ color: '#FFEB3B', fontSize: 30 }} />
                    </TouchableOpacity>
                </View>
            )
        }
        return null;
    }

    _onProgress(event) {
        const progress = event.loaded / event.total;
        this.setState({ progress: progress });
    }

    validateInputs() {
        const { images, headerText } = this.state;
        if (images === null) {
            alert('Please select article image.');
            return false;
        } else if (headerText === '') {
            alert('Please enter your article title.')
            return false;
        } else return true;
    }

    async uploadArtical() {
        const { images, headerText, descriptionText } = this.state;
        if (this.validateInputs()) {
            let data = new FormData();
            data.append('ownerId', LoggedUserCredentials.getOwnerId());
            data.append('title', headerText);
            data.append('description', descriptionText || "");

            if (images) {
                data.append('media', {
                    uri: images.path,
                    type: images.mime,
                    name: 'article.' + images.mime.split('/')[1]
                });
            } else {
                data.append('media', null);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/mixed',
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
                },
                method: 'POST',
                body: data
            }

            this.setState({ showActivityIndicator: true });

            try {
                let res = await futch(articleUrl, config, (event) => this._onProgress(event));
                this.setState({ showActivityIndicator: false });
                this.props.navigation.state.params.refresh();
                this.props.navigation.navigate("ArticleList");
            } catch (err) {
                console.log(err);
                this.setState({ showActivityIndicator: false });
                alert("Sorry can not upload the article");
            }
        }
    }

    renderProgressView() {
        const { progress } = this.state;
        if (progress < 1) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View>
                        <Progress.Circle
                            progress={progress}
                            size={70}
                            showsText={true}
                        />
                        <Text>Uploading...</Text>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size={70} />
                    <Text>Processing...</Text>
                </View>
            )
        }
    }

    render() {
        const { modalImagePath, modalVisible, showActivityIndicator } = this.state;
        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.topStyle}>
                    {
                        this.state.renderImage ?
                            this.renderImages()
                            :
                            <TouchableOpacity onPress={() => this.pickImageOrVedio()} style={styles.imgLogo}>
                                <Icons name='folder-images' style={{ color: '#FFEB3B', fontSize: 70 }} />
                                <Text style={{ color: '#FFEB3B', fontSize: 18, fontWeight: 'bold' }}>Pick Photo</Text>
                            </TouchableOpacity>
                    }
                </View>

                <View style={styles.bottomStyle}>
                    <View style={styles.desCommonHeader}>
                        <TextInput
                            placeholder="Title for Artical"
                            placeholderTextColor="#fff"
                            underlineColorAndroid="#242124"
                            multiline={true}
                            value={this.state.headerText}
                            onChangeText={(text) => this.setState({ headerText: text })}
                            style={{ fontSize: 16, marginTop: 5, paddingHorizontal: 10, color: '#fff' }} />
                    </View>
                    <View style={styles.desCommon}>
                        <TextInput
                            placeholder="Description for Artical"
                            placeholderTextColor="#fff"
                            underlineColorAndroid="#242124"
                            multiline={true}
                            value={this.state.descriptionText}
                            onChangeText={(text) => this.setState({ descriptionText: text })}
                            style={{ fontSize: 16, marginTop: 5, paddingHorizontal: 10, color: '#fff' }} />
                    </View>
                    <TouchableOpacity onPress={() => this.uploadArtical()} style={styles.btnStyle}>
                        <Text style={{ color: '#fff', padding: 7 }}>UPLOAD</Text>
                    </TouchableOpacity>
                </View>

                <Modal animationType="slide"
                    visible={showActivityIndicator}
                    onRequestClose={() => this.setState({ showActivityIndicator: false })}>
                    {this.renderProgressView()}
                </Modal>

                <PhotoView
                    visible={modalVisible}
                    data={[{ source: { uri: modalImagePath } }]}
                    hideStatusBar={false}
                    hideCloseButton={true}
                    hideShareButton={true}
                    initial={0}
                    onDismiss={e => {
                        // don't forgot set state back.
                        this.setState({ modalVisible: false });
                    }}
                />

            </ScrollView>
        )
    }
}


const styles = StyleSheet.create({
    imgBack: {
        flex: 1,
        width: null,
        height: null
    },
    topStyle: {
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
    desCommon: {
        backgroundColor: 'rgba(25, 30, 31,0.5)',
        marginVertical: 5,
        minHeight: 150,
        borderWidth: 1,
        borderColor: '#FFEB3B'
    },
    desCommonHeader: {
        backgroundColor: 'rgba(25, 30, 31,0.5)',
        marginVertical: 2,
        minHeight: 75,
        borderWidth: 1,
        borderColor: '#FFEB3B'
    },
    scrollImg: {
        marginVertical: 15,
    },
    bottomStyle: {
        backgroundColor: 'rgba(25, 30, 31,0.5)',
        marginHorizontal: 13,
        marginBottom: 10
    },
    imgLogo: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeLogo: {
        position: 'absolute',
        right: 1,
        top: 1,
        zIndex: 2,
    },
    btnStyle: {
        backgroundColor: 'rgba(25, 30, 31,0.5)',
        borderWidth: 1,
        borderColor: '#FFEB3B',
        borderRadius: 0,
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalImageStyle: {
        width: 160,
        height: 160,
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 4,
        marginTop: (height / 3),
        alignSelf: 'center'
    }
})