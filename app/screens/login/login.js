import React from 'react';

import {
    View,
    Image,
    ScrollView,
    ActivityIndicator,
    AsyncStorage,
    StyleSheet
} from 'react-native';

import Icon from "react-native-vector-icons/Ionicons";
import Ficon from 'react-native-vector-icons/Zocial';
import md5 from "react-native-md5";

// import {
//     AccessToken,
//     LoginManager,
//     GraphRequest,
//     GraphRequestManager
// } from 'react-native-fbsdk';

// import { GoogleSignin } from 'react-native-google-signin';

import {
    RkButton,
    RkText,
    RkTextInput
} from 'react-native-ui-kitten';

import { scale, scaleVertical } from '../../utils/scale';
import { Color } from '../../utils/color';
import { loginUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import OneSignal from 'react-native-onesignal';

export class Login extends React.PureComponent {
    static navigationOptions = () => ({
        header: null
    });

    constructor() {
        super()
        this.state = {
            inputedEmail: '',
            inputedPassword: '',
            loading: false,

            disLoginBtn: false,
            disSignupBtn: false,
            disTwitterBtn: false,
            disGoogleBtn: false,
            disFbBtn: false,

            inputedEmailError: false,
            inputedPasswordError: false,
            loginError: false,
            errorText: '',
            playerId: null,
            isMounted: false
        }

        this.loginWithFb = this.loginWithFb.bind(this);
        this.loginWithGoogle = this.loginWithGoogle.bind(this);
    }

    //logoimage
    _renderImage(image) {
        image = (<Image style={styles.image}
            source={require('../../assets/images/login-screen.jpg')} />);
        return image;
    }

    render() {
        let {
            inputedEmail,
            inputedPassword,
            loading,
            inputedEmailError,
            inputedPasswordError,
            errorText,
            loginError,
            disLoginBtn,
            disSignupBtn
        } = this.state

        let image = this._renderImage();

        return (
            <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false} style={styles.scrollViewStyle}>

                <View style={{ alignItems: 'center' }}>
                    {image}
                </View>

                <View style={styles.container}>
                    <View style={styles.buttons}>
                        <RkButton style={styles.button} rkType='social' onPress={this.loginWithGoogle}>
                            <RkText rkType='awesome hero'><Icon name='logo-google' style={styles.circleIcon} /></RkText>
                        </RkButton>
                        <RkButton style={styles.button} rkType='social' onPress={this.loginWithFb}>
                            <RkText rkType='awesome hero'><Ficon name='facebook' style={styles.circleIcon} /></RkText>
                        </RkButton>
                    </View>

                    {inputedEmailError ? <RkText style={{ color: Color.backgroundColor, fontSize: scale(15), }}>{errorText}</RkText> : null}

                    <RkTextInput
                        inputStyle={{ color: 'black', fontSize: scale(14) }}
                        style={styles.txtInput}
                        label={<Icon style={styles.iconStyle} name='ios-at' />}
                        onChangeText={(email) => this.setState({ inputedEmail: email, errorText: '', inputedEmailError: false })}
                        value={inputedEmail}
                        placeholder='Email' />

                    {inputedPasswordError ? <RkText style={{ color: Color.backgroundColor, fontSize: scale(15), }}>{errorText}</RkText> : null}

                    <RkTextInput
                        inputStyle={{ color: 'black', fontSize: scale(14) }}
                        style={styles.txtInput}
                        label={<Icon style={styles.iconStyle} name='ios-lock' />}
                        placeholder='Password'
                        onChangeText={(password) => this.setState({ inputedPassword: password, errorText: '', inputedPasswordError: false })}
                        value={inputedPassword}
                        secureTextEntry={true} />

                    <RkButton
                        rkType='stretch'
                        disabled={disLoginBtn}
                        style={styles.loginBtn}
                        onPress={this.loginPress}>
                        {loading ? <ActivityIndicator size="small" color={Color.backgroundColor} ></ActivityIndicator> :
                            <RkText style={styles.loginTxt}>Login</RkText>
                        }
                    </RkButton>

                    {
                        loginError ?
                            <View style={{ alignItems: 'flex-end' }}>
                                <RkText style={{ color: Color.backgroundColor, fontSize: scale(15), marginTop: scale(10) }}>
                                    {errorText}
                                </RkText>
                            </View>
                            :
                            null
                    }

                    <View style={styles.footer}>
                        <View style={styles.textRow}>
                            <RkText rkType='primary3' style={{ paddingRight: scale(5), color: 'black' }}>Don’t have an account?</RkText>
                            <RkButton onPress={this.signUpPress} rkType='clear' disabled={disSignupBtn}>
                                <RkText rkType='header6' style={{ color: 'black' }} >
                                    Sign up now
                                </RkText>
                            </RkButton>
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }

    loginPress = () => {
        let { inputedEmail, inputedPassword } = this.state;

        let errorText = '';
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (inputedEmail === '') {
            errorText = "Please enter your email !"
            this.setState({ inputedEmailError: true, inputedPasswordError: false, loginError: false, errorText: errorText })
        } else if (reg.test(inputedEmail) === false) {
            errorText = "Please enter valid email !"
            this.setState({ inputedEmailError: true, inputedPasswordError: false, loginError: false, errorText: errorText })
        } else if (inputedPassword == '') {
            errorText = "Please enter password"
            this.setState({ inputedPasswordError: true, inputedEmailError: false, loginError: false, errorText: errorText });
        } else {
            OneSignal.getPermissionSubscriptionState(this.onIdGet);
        }
    }


    onIdGet = (status) => {
        const { inputedEmail, inputedPassword } = this.state;
        this.tryToLogin(inputedEmail, inputedPassword, status.userId);
    }

    async tryToLogin(email, password, playerId) {

        this.setState({
            loading: true,
            disTwitterBtn: true,
            disGoogleBtn: true,
            disFbBtn: true,
            disLoginBtn: true,
            disSignupBtn: true
        });

        const form_body = { email, password: md5.hex_md5(password), playerId };

        let config = {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(form_body)
        };

        //const refreshTokenArray = ['refreshToken', res.headers.map.refreshtoken];

        try {
            const res = await fetch(loginUrl, config);
            const status = res.status;
            switch (status) {
                case 401: {
                    const errorText = "Login fail.Try again !"
                    this.setState({ loading: false, loginError: true, errorText: errorText, disLoginBtn: false, disSignupBtn: false });
                    break;
                }
                case 500: {
                    const errorText = "Login fail.Try again !"
                    this.setState({ loading: false, loginError: true, errorText: errorText, disLoginBtn: false, disSignupBtn: false });
                    break;
                }
                case 200: {
                    const resJson = await res.json();
                    const accessTokenArray = ['accessToken', resJson.token];
                    const userIdArray = ['userId', resJson.userId];
                    const roleArray = ['role', resJson.role];
                    const userNameArray = ['userName', resJson.userName];
                    const playerIdArray = ['playerId', playerId];
                    //store data in cache
                    LoggedUserCredentials.setLoggedUserData(resJson.token, resJson.userName, resJson.userId, playerId, resJson.role);

                    try {
                        await AsyncStorage.multiSet([accessTokenArray, userIdArray, userNameArray, playerIdArray, roleArray]);
                        this.props.navigation.navigate("App");
                        this.setState({ loading: false, disLoginBtn: false, disSignupBtn: false });
                    } catch (e) {
                        console.log("cannot store data");
                    }
                    break;
                }
            }
        } catch (err) {
            const errorText = "Please connect to internet  !";
            this.setState({ loading: false, loginError: true, errorText: errorText, disLoginBtn: false, disSignupBtn: false });
        }
    }

    _responseInfoCallback = (error, result) => {
        if (error) {
            console.log(error);
            alert("Oops Something Went Wrong!")
        } else {
            console.log(result);
            const { navigate } = this.props.navigation;
            navigate("SignUp", { fbData: result });

        }
    }

    async loginWithFb() {

        // try {
        //     const result = await LoginManager.logInWithReadPermissions(['public_profile', 'email']);

        //     if (result.isCancelled) {
        //         console.log('User Canceled Request');
        //     } else {
        //         // get the access token
        //         const data = await AccessToken.getCurrentAccessToken();

        //         if (!data) {
        //             console.log('Error fetching data');
        //         }

        //         const infoRequest = new GraphRequest(
        //             '/me',
        //             {
        //                 accessToken: data.accessToken,
        //                 parameters: {
        //                     fields: {
        //                         string: 'email,first_name,last_name,picture'
        //                     }
        //                 }
        //             },
        //             this._responseInfoCallback,
        //         );

        //         new GraphRequestManager().addRequest(infoRequest).start();
        //     }

        // } catch (e) {
        //     console.error(e);
        // }
    }

    async loginWithGoogle() {
        // try {
        //     await GoogleSignin.configure({
        //         //iosClientId: '732876700165-qo7tuigs9v4mol3qtqbtvcvngle8nbae.apps.googleusercontent.com',
        //         webClientId: '423373763829-96fvfn6p3qc5jlirt5tk7r3an1nie10t.apps.googleusercontent.com',
        //         offlineAccess: false
        //     });

        //     const data = await GoogleSignin.signIn();
        //     this.props.navigation.navigate("SignUp", { googleData: data });
        // } catch (e) {
        //     console.error(e);
        // }
    }

    signUpPress = () => {
        this.setState({
            inputedEmail: '',
            inputedEmailError: false,
            inputedPassword: '',
            inputedPasswordError: false,
            loading: false,
            disLoginBtn: false,
            disSignupBtn: false,
            errorText: ''
        })

        const { navigate } = this.props.navigation;
        navigate("SignUp")
    }
}

let styles = StyleSheet.create({
    scrollViewStyle: {
        backgroundColor: '#fff'
    },
    txtInput: {
        borderWidth: 1,
        borderBottomWidth: 1,
        borderColor: Color.backgroundColor,
        borderBottomColor: Color.backgroundColor
    },
    iconStyle: {
        fontSize: scale(25),
        marginLeft: scale(25),
        color: Color.backgroundColor
    },
    circleIcon: {
        fontSize: scale(25),
        color: Color.backgroundColor
    },
    image: {
        resizeMode: 'contain',
        marginBottom: scaleVertical(10),
        width: '100%',
        height: scale(200)
    },
    container: {
        paddingHorizontal: scale(17),
        paddingBottom: scaleVertical(22)
    },
    footer: {
        justifyContent: 'flex-end',
        flex: 1,
        marginTop: scale(15)
    },
    loginBtn: {
        height: scale(55),
        borderWidth: 1,
        borderRadius: 0,
        borderColor: Color.backgroundColor,
        marginTop: scale(10),
        backgroundColor: '#fff'
    },
    loginTxt: {
        color: Color.backgroundColor,
        fontWeight: 'bold',
        fontSize: scale(18),
    },
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scaleVertical(24),
    },
    button: {
        marginHorizontal: scale(14)
    },
    textRow: {
        justifyContent: 'center',
        flexDirection: 'row',
    }
});

