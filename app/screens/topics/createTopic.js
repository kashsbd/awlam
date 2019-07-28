import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Text,
    TextInput,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Image
} from 'react-native';

import Icons from 'react-native-vector-icons/Entypo';
import FIcons from 'react-native-vector-icons/Feather';
import ImageCropPicker from 'react-native-image-crop-picker';
import PhotoView from "@merryjs/photo-viewer";
import * as Progress from 'react-native-progress';
import BottomSheet from 'react-native-js-bottom-sheet';
const _ = require('lodash');

import {
    PermittedPeopleModal
} from './components';

import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { topicUrl } from '../../utils/globle';
import futch from '../../utils/futch';
import { Color } from '../../utils/color';
import { scale } from '../../utils/scale';
import { parse_user } from '../../utils/commonService';

export class CreateTopic extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: 'Create Topic Post',
        headerTintColor: Color.fontColor,
        headerTitleStyle: {
            color: Color.fontColor
        },
        headerStyle: {
            backgroundColor: Color.backgroundColor,
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
            permitted_users: [],
            postType: 'Public',
            showActivityIndicator: false,
            progress: 0,
            mediaPickerVisible: false
        }
    }

    _setDescription = (text) => this.setState({ description: text });

    _closePhotoViewModal = () => this.setState({ modalVisible: false });

    _closeProgressModal = () => this.setState({ showActivityIndicator: false });

    //pick image only
    pickImage = async () => {
        let images = [];
        images = await ImageCropPicker.openPicker({ multiple: false, mediaType: "photo", compressImageQuality: 0.3 });
        let newImgs = this.state.images.concat(images);
        this.setState({ images: newImgs, renderImage: true });
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

    _onAysBtnPressed = () => { this.setState({ postType: 'Private' }); this._closePostTypeBottomSheet() };

    _openPostTypeBottomSheed = () => this.post_type_ref.open();

    _closePostTypeBottomSheet() {
        this.post_type_ref.close();
    }

    openPeopleModal = () => {
        this.people_ref.open();
    }

    _exitPage = () => this.props.navigation.goBack();

    uploadData = async () => {

        const {
            permitted_users,
            images,
            postType,
            description
        } = this.state;

        if (postType === 'Public' && description.trim().length === 0 && images.length === 0) {
            alert('Please select image or write description.');
        } else if (postType === 'Private' && permitted_users.length === 0) {
            alert('Please invite some friends.');
        } else if (postType === 'Private' && description.trim().length === 0 && images.length === 0) {
            alert('Please select image or write description.');
        } else {
            let data = new FormData();
            data.append("userId", LoggedUserCredentials.getUserId());
            data.append("postType", postType);

            if (description !== '' && description.trim().length !== 0) {
                data.append("description", description);
            }

            if (postType === 'Private' && permitted_users.length > 0) {
                data.append("permitted_users_str", JSON.stringify(permitted_users));
            }

            if (images && images.length > 0) {
                data.append('media', {
                    uri: images[0].path,
                    type: images[0].mime,
                    name: 'media' + '.' + images[0].mime.split('/')[1]
                });
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
                let res = await futch(topicUrl, config, this._onProgress);
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

    _setPeopleRef = ref => this.people_ref = ref;

    _onComplete = selected_user => {
        this.setState({ permitted_users: selected_user });
    }

    render() {
        const { permitted_users, postType } = this.state;

        const selected_user = _.map(permitted_users, 'name');

        let users = 'Invite Friends';
        if (selected_user.length > 0) {
            users = parse_user(selected_user);
        }

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
                                <TouchableOpacity onPress={this.pickImage} style={styles.imgLogo}>
                                    <Icons name='folder-images' style={{ color: Color.backgroundColor, fontSize: scale(35) }} />
                                    <Text style={{ color: Color.backgroundColor, fontSize: scale(15), fontWeight: 'bold' }}>Pick Photo</Text>
                                </TouchableOpacity>
                        }
                    </ScrollView>

                    <View style={styles.bottomStyle}>
                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Topic Type</Text>
                            <TouchableOpacity onPress={this._openPostTypeBottomSheed} style={styles.postTypeBtn}>
                                <Text style={{ color: 'grey', padding: scale(7) }}>{this.state.postType}</Text>
                                <FIcons name='arrow-down' style={{ color: Color.backgroundColor, fontSize: scale(18), paddingTop: scale(5) }} />
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: scale(10), marginVertical: 8 }}>Description for this topic</Text>
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
                        {
                            postType === 'Private' &&
                            <View style={{ marginBottom: 10 }} >
                                <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginBottom: 8 }}>Invite Friends</Text>
                                <TouchableOpacity
                                    onPress={this.openPeopleModal}
                                    style={styles.peopleBtn}
                                >
                                    <Text style={{ color: 'grey', padding: scale(7) }}>{users}</Text>
                                </TouchableOpacity>
                            </View>
                        }
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

                <BottomSheet
                    ref={this._setPostTypeRef}
                    itemDivider={3}
                    backButtonEnabled
                    coverScreen={false}
                    title="Topic Type"
                    options={[
                        {
                            title: 'Public',
                            icon: <FIcons name="globe" color={Color.backgroundColor} size={24} />,
                            onPress: this._onPublicBtnPressed
                        },
                        {
                            title: 'Private',
                            icon: <FIcons name="lock" color={Color.backgroundColor} size={24} />,
                            onPress: this._onAysBtnPressed
                        }
                    ]}
                    isOpen={false}
                />

                <PermittedPeopleModal
                    ref={this._setPeopleRef}
                    selected_user={permitted_users}
                    onComplete={this._onComplete}
                    {...this.props}
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
        marginBottom: 8,
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
        width: scale(130),
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 13,
    },
    peopleBtn: {
        borderWidth: 0.5,
        borderColor: Color.backgroundColor,
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

