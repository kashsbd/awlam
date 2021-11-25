import React, { Component } from 'react';
import md5 from 'react-native-md5';
import { scale } from '../../utils/scale';

import {
    Image,
    ScrollView,
    View,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    AsyncStorage
} from 'react-native';

import {
    RkTextInput,
    RkButton,
    RkText,
} from 'react-native-ui-kitten';

import OneSignal from 'react-native-onesignal';
import Icon from "react-native-vector-icons/Ionicons";
import FIcons from 'react-native-vector-icons/Feather';
import ImageCropPicker from 'react-native-image-crop-picker';

import { signupUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { Color } from '../../utils/color';

export class SignUp extends Component {
    static navigationOptions = () => ({
        header: null
    })

    constructor(props) {
        super(props)
        this.state = {
            socialData: props.navigation.state.params ? props.navigation.state.params : "",
            signupName: '',
            signupEmail: '',
            signupPassword: '',
            signupComfirmPassword: '',
            loading: false,
            disNextBtn: false,
            errorText: '',
            signupNameErr: false,
            signupEmailErr: false,
            signupPasswordErr: false,
            signupComfirmPasswordErr: false,
            signupErr: false,
            disSignInBtn: false,
            image: null
        }
    }

    componentDidMount() {
        let { socialData } = this.state
        if (socialData !== "") {
            if (socialData.fbData) {
                this.setState({ signupEmail: socialData.fbData.email })
            } else if (socialData.googleData) {
                this.setState({ signupEmail: socialData.googleData.user.email })
            }
        }
    }

    componentWillUnmount() {
        ImageCropPicker.clean()
            .then(() => console.log('removed all tmp images from tmp directory'))
            .catch(e => console.log("can't remove images"));
    }

    //pick image only
    pickImage() {
        ImageCropPicker.openPicker({ mediaType: "photo", cropping: true })
            .then(image => this.setState({ image }))
            .catch(err => this.setState({ image: null }));
    }

    removeProPic = () => {
        this.setState({ image: null });
        ImageCropPicker.clean()
            .then(() => console.log('removed all tmp images from tmp directory'))
            .catch(e => console.log("can't remove images"));
    }

    renderProPic() {
        const { image } = this.state;

        if (image) {
            return (
                <View style={styles.imgLogo}>
                    <TouchableOpacity onPress={() => this.setState({ modalVisible: true })}>
                        <Image source={{ uri: image.path }} style={styles.eachImgStyle} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={this.removeProPic} style={styles.removeLogo}>
                        <FIcons name='delete' style={{ color: 'red', fontSize: 30 }} />
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <TouchableOpacity onPress={() => this.pickImage()} style={styles.imgLogo}>
                <Icon name='ios-image' style={{ color: Color.backgroundColor, fontSize: scale(35) }} />
                <Text style={{ color: Color.backgroundColor, fontSize: scale(15), fontWeight: 'bold' }}>Pick Photo</Text>
            </TouchableOpacity>
        )
    }

    render() {
        let {
            loading,
            signupName,
            signupEmail,
            signupPassword,
            signupComfirmPassword,
            signupNameErr,
            signupEmailErr,
            signupPasswordErr,
            signupComfirmPasswordErr,
            signupErr,
            errorText,
            disNextBtn,
            disSignInBtn,
            socialData
        } = this.state;

        return (
            <ScrollView
                keyboardShouldPersistTaps='always'
                showsVerticalScrollIndicator={false}
                style={styles.scrollViewStyle}
            >
                <View style={{ alignItems: 'center', marginVertical: scale(15) }}>
                    {this.renderProPic()}
                </View>

                <View style={{ marginHorizontal: scale(15) }}>

                    {signupNameErr ? <RkText style={{ color: Color.backgroundColor, fontSize: scale(14), }}>{errorText}</RkText> : null}

                    <RkTextInput
                        inputStyle={{ color: 'black', fontSize: scale(14) }}
                        placeholder='Name'
                        editable={socialData === "" ? true : false}
                        style={styles.txtInput}
                        label={<Icon style={styles.iconStyle} name='ios-person' />}
                        onChangeText={(name) => { this.setState({ signupName: name, signupNameErr: false, errorText: '' }) }}
                        value={signupName} />

                    {signupEmailErr ? <RkText style={{ color: Color.backgroundColor, fontSize: scale(14), }}>{errorText}</RkText> : null}

                    <RkTextInput
                        inputStyle={{ color: 'black', fontSize: scale(14) }}
                        placeholder='Email'
                        editable={socialData === "" ? true : false}
                        style={styles.txtInput}
                        label={<Icon style={styles.iconStyle} name='ios-at' />}
                        onChangeText={(email) => { this.setState({ signupEmail: email, signupEmailErr: false, errorText: '' }) }}
                        value={signupEmail} />

                    {signupPasswordErr ? <RkText style={{ color: Color.backgroundColor, fontSize: scale(14), }}>{errorText}</RkText> : null}

                    <RkTextInput
                        inputStyle={{ color: 'black', fontSize: scale(14) }}
                        secureTextEntry={true}
                        placeholder='Password'
                        style={styles.txtInput}
                        label={<Icon style={styles.iconStyle} name='ios-lock' />}
                        onChangeText={(password) => { this.setState({ signupPassword: password, signupPasswordErr: false, errorText: '', signupErr: false }) }}
                        value={signupPassword} />

                    {signupComfirmPasswordErr ? <RkText style={{ color: Color.backgroundColor, fontSize: scale(14), }}>{errorText}</RkText> : null}

                    <RkTextInput inputStyle={{ color: 'black', fontSize: scale(14) }}
                        secureTextEntry={true}
                        placeholder='Confirm Password'
                        style={styles.txtInput}
                        label={<Icon style={styles.iconStyle} name='ios-lock' />}
                        onChangeText={(comfpassword) => { this.setState({ signupComfirmPassword: comfpassword, errorText: '', signupComfirmPasswordErr: false, signupErr: false }) }}
                        value={signupComfirmPassword} />

                    <RkButton disabled={disNextBtn} rkType='stretch' style={styles.btnNext} onPress={this.onSignUpPress.bind(this)}>
                        {
                            loading ?
                                <ActivityIndicator size="small" color={Color.backgroundColor} />
                                : <RkText style={styles.txtNext}>Sign Up</RkText>
                        }
                    </RkButton>

                    {
                        signupErr ?
                            <View style={{ alignItems: 'flex-end', marginTop: scale(8) }}>
                                <RkText style={{ color: Color.backgroundColor, fontSize: scale(15), justifyContent: 'flex-end' }}>{errorText}</RkText>
                            </View> :
                            null
                    }

                    <View style={styles.footer}>
                        <View style={styles.textRow}>
                            <RkText rkType='primary3' style={{ color: "black" }}>Already have an account?</RkText>
                            <RkButton disabled={disSignInBtn} rkType='clear' onPress={() => { this.props.navigation.navigate("SignIn") }}>
                                <RkText disabled={disSignInBtn} rkType='header6' style={{ color: "black" }}> Sign in now </RkText>
                            </RkButton>
                        </View>
                    </View>
                </View>

            </ScrollView>
        )
    }

    onSignUpPress() {
        const {
            signupName,
            signupEmail,
            signupPassword,
            signupComfirmPassword,
            socialData
        } = this.state;

        let errorText = '';
        const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

        if (signupName.trim().length === 0) {
            errorText = "Please enter name !";
            this.setState({ signupNameErr: true, errorText: errorText });
        } else if (signupEmail === '') {
            errorText = "Please enter email !";
            this.setState({ signupEmailErr: true, errorText: errorText });
        } else if (reg.test(signupEmail) === false) {
            errorText = "Please enter valid email !";
            this.setState({ signupEmailErr: true, errorText: errorText });
        } else if (signupPassword === '') {
            errorText = "Please enter password !"
            this.setState({ signupPasswordErr: true, errorText: errorText });
        } else if (signupComfirmPassword === '') {
            errorText = "Please enter comfirm password !"
            this.setState({ signupComfirmPasswordErr: true, errorText: errorText })
        } else if (signupPassword !== signupComfirmPassword) {
            errorText = "Password do not match !"
            this.setState({ signupErr: true, errorText: errorText });
        } else {
            OneSignal.getPermissionSubscriptionState(this.onIdGet);
        }
    }

    onIdGet = (status) => {
        const { signupEmail, signupName, image, signupPassword } = this.state;
        this.tryToSignUp(signupName, signupEmail, signupPassword, status.userId, image);
    }

    async tryToSignUp(signupName, signupEmail, password, playerId, image) {
        this.setState({ loading: true, disNextBtn: true, disSignInBtn: true });

        const signupData = new FormData();
        signupData.append("name", signupName);
        signupData.append("email", signupEmail);
        signupData.append("password", md5.hex_md5(password));
        signupData.append("playerId", playerId);
        signupData.append("role", 'NORMAL');

        if (image) {
            signupData.append("propic", {
                uri: image.path,
                type: image.mime,
                name: 'propic' + '.' + image.mime.split('/')[1]
            });
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            method: 'POST',
            body: signupData
        };

        try {
            const res = await fetch(signupUrl, config);
            const status = res.status;
            switch (status) {
                case 409: {
                    const errorText = 'This email already exists.Try another !';
                    this.setState({ loading: false, disNextBtn: false, disSignInBtn: false, errorText, signupErr: true });
                    break;
                }
                case 500: {
                    console.log(res);
                    const errorText = 'Something went wrong.Please try later';
                    this.setState({ loading: false, disNextBtn: false, disSignInBtn: false, errorText, signupErr: true });
                    break;
                }
                case 201: {
                    const resJson = await res.json();
                    const accessTokenArray = ['accessToken', resJson.token];
                    const userIdArray = ['userId', resJson.userId];
                    const roleArray = ['role', resJson.role];
                    const userNameArray = ['userName', signupName];
                    const playerIdArray = ['playerId', playerId];
                    //store data in cache
                    LoggedUserCredentials.setLoggedUserData(resJson.token, signupName, resJson.userId, playerId, resJson.role);

                    try {
                        await AsyncStorage.multiSet([accessTokenArray, userIdArray, userNameArray, playerIdArray, roleArray]);
                        this.props.navigation.navigate("App");
                        this.setState({ loading: false, disNextBtn: false, disSignInBtn: false, signupErr: false });
                    } catch (e) {
                        console.log("cannot store data");
                    }
                    break;
                }
            }
        } catch (err) {
            console.log(err);
            const errorText = 'Please connect to internet !';
            this.setState({ loading: false, disNextBtn: false, disSignInBtn: false, errorText, signupErr: true });
        }
    }
}

let styles = StyleSheet.create({
    scrollViewStyle: {
        backgroundColor: '#fff'
    },
    imgLogo: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderColor: Color.backgroundColor,
        borderWidth: 0.5,
        width: scale(200),
        height: scale(200)
    },
    eachImgStyle: {
        width: scale(200),
        height: scale(200),
        resizeMode: 'cover',
        borderWidth: 0.5,
        marginTop: 7,
        borderColor: Color.backgroundColor
    },
    txtInput: {
        borderWidth: 1,
        borderColor: Color.backgroundColor,
        borderBottomColor: Color.backgroundColor,
        height: scale(50)
    },
    iconStyle: {
        fontSize: scale(25),
        marginLeft: scale(25),
        color: Color.backgroundColor
    },
    btnNext: {
        height: scale(55),
        backgroundColor: '#fff',
        borderWidth: scale(1),
        borderColor: Color.backgroundColor,
        marginTop: scale(10),
        borderRadius: 0
    },
    txtNext: {
        color: Color.backgroundColor,
        fontWeight: 'bold',
        fontSize: scale(19),
    },
    footer: {
        justifyContent: 'flex-end',
        flex: 1,
        marginVertical: scale(10)
    },
    textRow: {
        justifyContent: 'center',
        flexDirection: 'row',
    },
    removeLogo: {
        position: 'absolute',
        right: 1,
        top: 4,
        zIndex: 2,
    },
})

