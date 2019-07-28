import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal
} from 'react-native';

import ImageCropPicker from 'react-native-image-crop-picker';
import PhotoView from "@merryjs/photo-viewer";
import Icons from 'react-native-vector-icons/Entypo';
import FIcons from 'react-native-vector-icons/Feather';
import * as Progress from 'react-native-progress';
import BottomSheet from 'react-native-js-bottom-sheet';

import { postUrl } from '../../utils/globle';
import futch from '../../utils/futch';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { scale } from '../../utils/scale';
import { Tags } from '../../components';
import { Color } from '../../utils/color';

export class PostUpload extends Component {

    static navigationOptions = () => ({
        title: 'Post Upload',
        headerTitleStyle: {
            color: Color.fontColor
        },
        headerTintColor: Color.fontColor,
        headerStyle: {
            backgroundColor: Color.backgroundColor
        }
    });

    constructor(props) {
        super(props);
        this.state = {
            renderImage: false,
            modalVisible: false,
            modalImagePath: [],
            images: [],
            description: '',
            postType: 'Public',
            showActivityIndicator: false,
            progress: 0,
            tag: [],
            mediaPickerVisible: false,
            isVideo: false
        }
    }

    _setTags = (tags) => this.setState({ tag: tags });

    _setDescription = (text) => this.setState({ description: text });

    _closePhotoViewModal = () => this.setState({ modalVisible: false });

    _closeProgressModal = () => this.setState({ showActivityIndicator: false });

    _closeMediaPickerModal = () => this.setState({ mediaPickerVisible: false });

    _openMediaPickerModal = () => this.setState({ mediaPickerVisible: true });

    renderMediaPicker() {
        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={this.pickImage}
                    style={{ flexDirection: 'row', marginHorizontal: 10 }}>
                    <Icons name='folder-images' style={{ color: Color.backgroundColor, fontSize: 22, margin: 10 }} />
                    <Text style={{ fontSize: 18, color: 'black', margin: 10 }}>Image</Text>
                </TouchableOpacity>
                <View style={{ borderColor: Color.backgroundColor, borderTopWidth: 1, margin: 10 }} />
                <TouchableOpacity onPress={this.pickVideo}
                    style={{ flexDirection: 'row', marginHorizontal: 10 }}>
                    <Icons name='video-camera' style={{ color: Color.backgroundColor, margin: 10, fontSize: 22 }} />
                    <Text style={{ fontSize: 18, color: 'black', margin: 10 }}>Video</Text>
                </TouchableOpacity>
            </View>
        )
    }

    //pick image only
    pickImage = async () => {
        this.setState({ isVideo: false });
        let images = [];
        images = await ImageCropPicker.openPicker({ multiple: true, mediaType: "photo", compressImageQuality: 0.3 });
        let newImgs = this.state.images.concat(images);
        this.setState({ images: newImgs, renderImage: true, mediaPickerVisible: false });
    }

    //pick video only
    pickVideo = async () => {
        this.setState({ isVideo: true });
        let images = [];
        images = await ImageCropPicker.openPicker({ multiple: false, mediaType: "video" });
        let newImgs = this.state.images.concat(images);
        this.setState({ images: newImgs, renderImage: true, mediaPickerVisible: false });
    }

    //toggle between image and video
    toggleImageOrVedio = () => {
        const { isVideo } = this.state;
        if (isVideo) {
            this.pickVideo();
        } else {
            this.pickImage();
        }
    }

    renderImages() {
        const { images } = this.state;
        let imgs = [];
        if (images) {
            for (let img of images) {
                imgs.push(
                    <View key={img.path} style={styles.scrollImg}>
                        <TouchableOpacity onPress={() => this.setState({ modalVisible: true, modalImagePath: img })}>
                            <Image key={img.path} source={{ uri: img.path }} style={styles.eachImgStyle} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this.removePhoto(img)} style={styles.removeLogo}>
                            <FIcons name='delete' style={{ color: 'red', fontSize: 30 }} />
                        </TouchableOpacity>
                    </View>
                );
            }
            if (images[0].mime.startsWith('image/')) {
                imgs.push(
                    <TouchableOpacity onPress={this.toggleImageOrVedio} style={styles.addMoreStyle} key={98}>
                        <Icons name='plus' style={{ color: Color.backgroundColor, fontSize: 48 }} />
                    </TouchableOpacity>
                )
            }
            return imgs;
        }

        return null;
    }

    removePhoto(image) {
        const { images } = this.state;
        const index = images.indexOf(image);
        if (index > -1) {
            images.splice(index, 1);
        }
        if (images.length == 0 || null) {
            this.setState({ renderImage: false })
        }
        this.setState({ images: images });
    }

    _onProgress = (event) => {
        const progress = event.loaded / event.total;
        this.setState({ progress: progress })
    }

    uploadData = async () => {
        const {
            images,
            tag,
            description,
            postType
        } = this.state;

        if (description.trim().length === 0 && images.length === 0) {
            alert('Please select image or write description.');
        } else {
            let data = new FormData();
            data.append('userId', LoggedUserCredentials.getUserId());
            data.append('postType', postType);

            //for hash tag
            if (tag && tag.length > 0) {
                const hash = tag.toString();
                data.append('hashtag', hash);
            }

            //for status
            //check if it is empty string or has white spaces 
            if (description !== '' && description.trim().length !== 0) {
                const status_obj = {
                    type: 'TEXT',
                    data: { mediaName: null, msg: description.trim() }
                };
                data.append('status', JSON.stringify(status_obj));
            }

            //for images and videos
            if (images && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    data.append('postImage', {
                        uri: images[i].path,
                        type: images[i].mime,
                        name: 'media' + i + '.' + images[i].mime.split('/')[1]
                    });
                }
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
                },
                method: 'POST',
                body: data
            }

            this.setState({ showActivityIndicator: true });

            try {
                let res = await futch(postUrl, config, this._onProgress);
                this.setState({ showActivityIndicator: false });
                if (res.status === 201) {
                    const str_to_obj = JSON.parse(res.responseText);
                    this.props.navigation.state.params.updatePost(str_to_obj);
                }
                this.props.navigation.goBack();
            } catch (error) {
                this.setState({ showActivityIndicator: false });
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
                            size={scale(70)}
                            showsText={true}
                        />
                        <Text>Uploading...</Text>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                        style={{ width: scale(160), height: scale(120) }}
                        source={require('../../assets/animations/piggy.gif')}
                    />
                    <Text>Processing...</Text>
                </View>
            );
        }
    }

    _setPostTypeRef = (ref) => this.post_type_ref = ref;

    _onPublicBtnPressed = () => { this.setState({ postType: 'Public' }); this._closePostTypeBottomSheet() };

    _onOnlyMeBtnPressed = () => { this.setState({ postType: 'Only Me' }); this._closePostTypeBottomSheet() };

    _onFollowerBtnPressed = () => { this.setState({ postType: 'Follower' }); this._closePostTypeBottomSheet() };

    _openPostTypeBottomSheed = () => this.post_type_ref.open();

    _closePostTypeBottomSheet() {
        this.post_type_ref.close();
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >

                    <ScrollView
                        style={styles.imgContainerStyle}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}>
                        {
                            this.state.renderImage ?
                                this.renderImages()
                                :
                                <TouchableOpacity onPress={this._openMediaPickerModal} style={styles.imgLogo}>
                                    <Icons name='folder-images' style={{ color: Color.backgroundColor, fontSize: scale(35) }} />
                                    <Text style={{ color: Color.backgroundColor, fontSize: scale(15), fontWeight: 'bold' }}>Pick Photo</Text>
                                </TouchableOpacity>
                        }
                    </ScrollView>

                    <View style={styles.bottomStyle}>
                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Who can see your post ?</Text>
                            <TouchableOpacity onPress={this._openPostTypeBottomSheed} style={styles.postTypeBtn}>
                                <Text style={{ color: Color.backgroundColor, padding: scale(7) }}>{this.state.postType}</Text>
                                <FIcons name='arrow-down' style={{ color: Color.backgroundColor, fontSize: scale(18), paddingTop: scale(5) }} />
                            </TouchableOpacity>
                        </View>
                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>HashTag</Text>
                            <Tags
                                initialTags={this.state.tag}
                                inputStyle={{ marginHorizontal: 10, borderWidth: 0.5, borderColor: Color.backgroundColor }}
                                tagContainerStyle={{}}
                                onChangeTags={this._setTags}
                            />
                        </View>
                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: scale(10), marginVertical: 8 }}>Description for this post</Text>
                            <TextInput
                                placeholder="Description"
                                placeholderTextColor="grey"
                                underlineColorAndroid="transparent"
                                multiline={true}
                                numberOfLines={3}
                                value={this.state.description}
                                onChangeText={this._setDescription}
                                style={styles.descriptionTextInputStyle} />
                        </View>
                    </View>

                    <TouchableOpacity onPress={this.uploadData} style={styles.btnStyle}>
                        <Text style={{ color: '#fff', padding: scale(7) }}>Upload</Text>
                    </TouchableOpacity>
                </ScrollView>

                <PhotoView
                    visible={this.state.modalVisible}
                    data={[{ source: { uri: this.state.modalImagePath.path } }]}
                    hideStatusBar={false}
                    hideCloseButton={true}
                    hideShareButton={true}
                    initial={0}
                    onDismiss={this._closePhotoViewModal}
                />

                <Modal animationType="none"
                    visible={this.state.showActivityIndicator}
                    onRequestClose={this._closeProgressModal}>
                    {this.renderProgressView()}
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.mediaPickerVisible}
                    onRequestClose={this._closeMediaPickerModal}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {this.renderMediaPicker()}
                    </View>
                </Modal>

                <BottomSheet
                    ref={this._setPostTypeRef}
                    itemDivider={3}
                    backButtonEnabled
                    coverScreen={false}
                    title="Who can see your post ?"
                    options={[
                        {
                            title: 'Public',
                            icon: <FIcons name="globe" color={Color.backgroundColor} size={24} />,
                            onPress: this._onPublicBtnPressed
                        },
                        {
                            title: 'Only Me',
                            icon: <FIcons name="lock" color={Color.backgroundColor} size={24} />,
                            onPress: this._onOnlyMeBtnPressed
                        },
                        {
                            title: 'Follower',
                            icon: <FIcons name="users" color={Color.backgroundColor} size={24} />,
                            onPress: this._onFollowerBtnPressed
                        }
                    ]}
                    isOpen={false}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    imgContainerStyle: {
        minHeight: scale(250),
        borderColor: Color.backgroundColor,
    },
    eachImgStyle: {
        width: scale(250),
        height: scale(250),
        resizeMode: 'cover',
        borderWidth: 0.5,
        marginTop: 7,
        borderColor: Color.backgroundColor
    },
    addMoreStyle: {
        width: scale(60),
        height: scale(60),
        borderWidth: scale(2),
        borderColor: Color.backgroundColor,
        borderRadius: scale(30),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: scale(30),
        marginVertical: scale(100)
    },
    descriptionTextInputStyle: {
        fontSize: scale(15),
        borderColor: Color.backgroundColor,
        borderWidth: 0.5,
        marginHorizontal: 13,
        marginTop: 3,
        marginBottom: 10,
        textAlignVertical: 'top'
    },
    removeLogo: {
        position: 'absolute',
        right: 1,
        top: 4,
        zIndex: 2,
    },
    imgLogo: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderColor: Color.backgroundColor,
        borderWidth: 0.5,
        width: scale(250),
        height: scale(220)
    },
    bottomStyle: {
        borderColor: Color.backgroundColor,
        borderWidth: 1,
        marginTop: 10,
        marginHorizontal: 7
    },
    scrollImg: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 20,
        marginRight: 5
    },
    btnStyle: {
        backgroundColor: Color.backgroundColor,
        marginVertical: 20,
        marginHorizontal: 7,
        height: scale(47),
        alignItems: 'center',
        justifyContent: 'center'
    },
    postTypeBtn: {
        borderWidth: 0.5,
        borderColor: Color.backgroundColor,
        width: scale(100),
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 13,
    },
    card: {
        borderWidth: 1,
        borderColor: Color.backgroundColor,
        borderRadius: 10,
        margin: 10,
        padding: 10
    }
})
