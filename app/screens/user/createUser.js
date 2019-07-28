import React, { PureComponent } from 'react';
import md5 from 'react-native-md5';
import {
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal
} from 'react-native';

import { RkButton } from 'react-native-ui-kitten';

import Icons from 'react-native-vector-icons/Entypo';
import FIcons from 'react-native-vector-icons/Feather';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import ImageCropPicker from 'react-native-image-crop-picker';
import PhotoView from "@merryjs/photo-viewer";
import BottomSheet from 'react-native-js-bottom-sheet';
import * as Progress from 'react-native-progress';

import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { userUrl } from '../../utils/globle';
import { Color } from '../../utils/color';
import { scale } from '../../utils/scale';
import futch from '../../utils/futch';

export class CreateUser extends PureComponent {

    static navigationOptions = ({ navigation }) => ({
        title: 'Create User',
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
                <FAIcon name='bars' size={20} color={Color.fontColor} />
            </RkButton>
        )
    });

    constructor(props) {
        super(props);
        this.state = {
            renderImage: false,
            modalVisible: false,
            modalImagePath: [],
            images: [],
            showActivityIndicator: false,
            progress: 0,
            mediaPickerVisible: false,
            name: '',
            email: '',
            password: '',
            conform_password: '',
            user_type: 'Normal'
        }
    }

    _setName = (text) => this.setState({ name: text });

    _setEmail = (text) => this.setState({ email: text });

    _setPassword = (text) => this.setState({ password: text });

    _setConformPassword = (text) => this.setState({ conform_password: text });

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

    uploadData = async () => {

        const {
            images,
            name,
            email,
            password,
            conform_password,
            user_type
        } = this.state;

        const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

        if (name.trim().length === 0) {
            alert('Please enter name.');
        } else if (email.trim().length === 0) {
            alert('Please enter email.');
        } else if (reg.test(email) === false) {
            alert('Please enter valid email.');
        } else if (password.trim().length === 0) {
            alert('Please enter password.');
        } else if (conform_password.trim().length === 0) {
            alert('Please enter conform password.');
        } else if (password.trim() !== conform_password.trim()) {
            alert('Password and ConformPassword must be equal.');
        } else {

            let data = new FormData();
            data.append("userId", LoggedUserCredentials.getUserId());
            data.append("name", name);
            data.append("email", email);
            data.append("password", md5.hex_md5(password));
            data.append("role", user_type.toUpperCase());

            if (images && images.length > 0) {
                data.append('propic', {
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
                let res = await futch(userUrl, config, this._onProgress);
                this.setState({ showActivityIndicator: false });

                if (res.status === 201) {
                    alert('User is created.')
                    this.setState({ name: '', password: '', conform_password: '', email: '', images: [] });
                } else if (res.status === 409) {
                    alert('Email already exists.Please try different email.');
                    this.setState({ email: '' });
                } else if (res.status === 500) {
                    alert('Something went wrong on server.Please try later.');
                    this.props.navigation.goBack();
                }

            } catch (error) {
                this.setState({ showActivityIndicator: false });
                alert('Something went wrong.');
                this.props.navigation.goBack();
            }
        }
    }

    _onAdminBtnPressed = () => { this.setState({ user_type: 'Admin' }); this._closeUserTypeBottomSheet() }

    _onNormalBtnPressed = () => { this.setState({ user_type: 'Normal' }); this._closeUserTypeBottomSheet() }

    _onGovBtnPressed = () => { this.setState({ user_type: 'Government' }); this._closeUserTypeBottomSheet() }

    _onCeleBtnPressed = () => { this.setState({ user_type: 'Celebrity' }); this._closeUserTypeBottomSheet() }

    _setUserTypeRef = (ref) => this.user_type_ref = ref;

    _openUserTypeBottomSheed = () => this.user_type_ref.open();

    _closeUserTypeBottomSheet() {
        this.user_type_ref.close();
    }

    render() {

        const {
            name,
            email,
            password,
            conform_password,
            user_type,
            showActivityIndicator,
            modalVisible,
            modalImagePath
        } = this.state;

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
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>User Type</Text>
                            <TouchableOpacity onPress={this._openUserTypeBottomSheed} style={styles.postTypeBtn}>
                                <Text style={{ color: 'grey', padding: scale(7) }}>{user_type}</Text>
                                <FIcons name='arrow-down' style={{ color: Color.backgroundColor, fontSize: scale(18), paddingTop: scale(5) }} />
                            </TouchableOpacity>
                        </View>

                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>User Name</Text>
                            <TextInput
                                placeholder="Name"
                                placeholderTextColor="grey"
                                underlineColorAndroid="transparent"
                                value={name}
                                onChangeText={this._setName}
                                style={styles.nameTextInputStyle} />
                        </View>

                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Email</Text>
                            <TextInput
                                placeholder="Email"
                                placeholderTextColor="grey"
                                underlineColorAndroid="transparent"
                                value={email}
                                onChangeText={this._setEmail}
                                style={styles.nameTextInputStyle} />
                        </View>

                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Password</Text>
                            <TextInput
                                placeholder="Password"
                                secureTextEntry
                                placeholderTextColor="grey"
                                underlineColorAndroid="transparent"
                                value={password}
                                onChangeText={this._setPassword}
                                style={styles.nameTextInputStyle} />
                        </View>

                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Conform Password</Text>
                            <TextInput
                                placeholder="Conform Password"
                                secureTextEntry
                                placeholderTextColor="grey"
                                underlineColorAndroid="transparent"
                                value={conform_password}
                                onChangeText={this._setConformPassword}
                                style={styles.nameTextInputStyle} />
                        </View>

                    </View>

                    <TouchableOpacity onPress={this.uploadData} style={styles.btnStyle}>
                        <Text style={{ color: Color.backgroundColor, padding: scale(7) }}>Upload</Text>
                    </TouchableOpacity>
                </ScrollView>

                <PhotoView
                    visible={modalVisible}
                    data={[{ source: { uri: modalImagePath.path } }]}
                    hideStatusBar={false}
                    hideCloseButton={true}
                    hideShareButton={true}
                    initial={0}
                    onDismiss={this._closePhotoViewModal}
                />

                <Modal animationType="none"
                    visible={showActivityIndicator}
                    onRequestClose={this._closeProgressModal}>
                    {this.renderProgressView()}
                </Modal>

                <BottomSheet
                    ref={this._setUserTypeRef}
                    itemDivider={4}
                    backButtonEnabled
                    coverScreen={false}
                    title="User Type"
                    options={[
                        {
                            title: 'Normal',
                            icon: <FIcons name="globe" color={Color.backgroundColor} size={24} />,
                            onPress: this._onNormalBtnPressed
                        },
                        {
                            title: 'Admin',
                            icon: <FIcons name="award" color={Color.backgroundColor} size={24} />,
                            onPress: this._onAdminBtnPressed
                        },
                        {
                            title: 'Government',
                            icon: <FIcons name="star" color={Color.backgroundColor} size={24} />,
                            onPress: this._onGovBtnPressed
                        },
                        {
                            title: 'Celebrity',
                            icon: <FIcons name="heart" color={Color.backgroundColor} size={24} />,
                            onPress: this._onCeleBtnPressed
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
    nameTextInputStyle: {
        fontSize: scale(15),
        borderColor: Color.backgroundColor,
        borderWidth: 0.5,
        marginHorizontal: 13,
        marginTop: 3,
        marginBottom: 8,
        height: 40
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
        borderWidth: 1,
        borderColor: Color.backgroundColor,
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
    },
    locationBtn: {
        borderWidth: 0.5,
        borderColor: Color.backgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 13,
    },
})

