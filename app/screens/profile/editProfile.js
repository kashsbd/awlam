import React, { Component } from 'react';
import Image from 'react-native-image-progress';
import {
    View,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import {
    RkCard,
    RkText,
    RkButton,
} from 'react-native-ui-kitten';

import ImagePicker from 'react-native-image-crop-picker';
import CountryPicker from 'react-native-country-picker-modal';
import { baseUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { scale } from '../../utils/scale';
import { Color } from '../../utils/color';

export class EditProfile extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: 'Edit Profile',
        headerTitleStyle: {
            color: Color.fontColor
        },
        headerTintColor: Color.fontColor,
        headerStyle: {
            backgroundColor: Color.backgroundColor
        }
    })

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            image: null,
            cca2: 'MM',
            callingCode: '95',
            country: 'Myanmar',
            firstName: '',
            lastName: '',
            description: '',
            city: '',
            phNo: '',
            job: '',
            disUpdateBtn: false,
            ownerInfo: this.props.navigation.state.params.ownerInfo,
        }
    }

    async pickImage() {
        let images = null
        try {
            images = await ImagePicker.openPicker({ multiple: false });
            this.setState({ image: images });
        } catch (e) {
            console.log(e);
        }
    }

    componentDidMount() {
        let { ownerInfo } = this.state

        this.setState({
            firstName: ownerInfo.firstName,
            lastName: ownerInfo.lastName,
            description: ownerInfo.description,
            city: ownerInfo.city,
            phNo: ownerInfo.phNo,
            job: ownerInfo.job
        })
    }

    renderImage() {
        let { image } = this.state
        if (image === null) {
            return (
                <Image
                    indicatorProps={{ color: '#ECC951' }}
                    style={styles.imgStyle}
                    source={{ uri: baseUrl + "/" + LoggedUserCredentials.getOwnerId() }}
                />
            )
        } else {
            return <Image style={styles.imgStyle} source={{ uri: image.path }} />
        }
    }
    render() {
        let {
            loading,
            firstName,
            lastName,
            description,
            city,
            phNo,
            job,
            disUpdateBtn
        } = this.state

        return (
            <ScrollView keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false}>
                <View style={[styles.infoView, { marginTop: scale(20) }]}>
                    <RkCard rkCardContent style={{ flexDirection: 'row', }}>
                        <TouchableOpacity onPress={() => this.pickImage()}>
                            <View style={{ paddingRight: scale(10) }}>
                                {this.renderImage()}
                            </View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'column', flex: 1, }}>
                            <View style={[styles.nameContainer]}>
                                <RkText style={styles.unitTxt}>First Name</RkText>
                                <TextInput style={styles.commonInput}
                                    placeholderTextColor='black'
                                    placeholder='First Name'
                                    value={firstName}
                                    autoFocus={true}
                                    onChangeText={(input) => { this.setState({ firstName: input }) }}
                                    underlineColorAndroid='transparent' />
                            </View>
                            <View style={{ backgroundColor: '#ffffff', borderWidth: scale(1) }}></View>
                            <View style={styles.nameContainer}>
                                <RkText style={styles.unitTxt}>Last Name</RkText>
                                <TextInput style={styles.commonInput}
                                    placeholderTextColor='#ffffff'
                                    placeholder='Last Name'
                                    value={lastName}
                                    onChangeText={(input) => this.setState({ lastName: input })}
                                    underlineColorAndroid='transparent' />
                            </View>
                        </View>
                    </RkCard>
                </View>
                <View style={styles.infoView}>
                    <RkCard rkCardContent >
                        <TextInput placeholder="About you"
                            multiline={true}
                            placeholderTextColor='black'
                            numberOfLines={4}
                            underlineColorAndroid='transparent'
                            value={description}
                            onChangeText={(input) => { this.setState({ description: input }) }}
                            style={{ textAlignVertical: 'top', color: 'red' }}
                        />
                        <View style={{ backgroundColor: 'black', borderWidth: 1 }}></View>
                        <View style={{ flexDirection: 'row', flex: 1, marginVertical: scale(15) }}>
                            <RkText style={styles.commonTxt}>Country</RkText>
                            <View style={{ flexDirection: 'row', flex: 2, marginLeft: scale(13), alignSelf: 'center' }}>
                                <CountryPicker
                                    ref={(btnRef) => this._btn = btnRef}
                                    onChange={value => {
                                        this.setState({ cca2: value.cca2, callingCode: value.callingCode, country: value.name })
                                    }}
                                    cca2={this.state.cca2}
                                    filterable
                                />
                                <TouchableOpacity
                                    onPress={() => this._btn.openModal()}
                                >
                                    <RkText style={{ marginLeft: scale(20), alignSelf: 'center', color: '#ffffff', fontSize: scale(15) }}>{this.state.country}</RkText>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ backgroundColor: '#ffffff', borderWidth: scale(1), borderColor: '#ECC951' }}></View>
                        <View style={{ flexDirection: 'row', marginVertical: scale(5) }}>
                            <RkText style={styles.commonTxt}>City</RkText>
                            <TextInput style={styles.commonInput}
                                placeholderTextColor='#ffffff'
                                placeholder='City'
                                value={city}
                                onChangeText={(input) => { this.setState({ city: input }) }}
                                underlineColorAndroid='transparent' />
                        </View>
                        <View style={{ backgroundColor: '#ffffff', borderWidth: scale(1), borderColor: '#ECC951' }}></View>
                        <View style={{ flexDirection: 'row', marginVertical: scale(5) }}>
                            <RkText style={styles.commonTxt}>Phone no:</RkText>
                            <TextInput style={styles.commonInput}
                                placeholderTextColor='#ffffff'
                                keyboardType="phone-pad"
                                value={phNo}
                                placeholder={"09123456789"}
                                onChangeText={(input) => this.setState({ phNo: input })}
                                underlineColorAndroid='transparent' />
                        </View>
                        <View style={{ backgroundColor: '#ffffff', borderWidth: scale(1), borderColor: '#ECC951' }}></View>
                        <View style={{ flexDirection: 'row' }}>
                            <RkText style={styles.commonTxt}>Job</RkText>
                            <TextInput style={styles.commonInput}
                                placeholderTextColor='#ffffff'
                                placeholder='Job'
                                value={job}
                                onChangeText={(input) => this.setState({ job: input })}
                                underlineColorAndroid='transparent' />
                        </View>

                    </RkCard>
                </View>

                <View style={styles.updateView}>
                    <RkButton disabled={disUpdateBtn} rkType='stretch' style={styles.updateBtn} onPress={() => this.updateOwnerProfile()}>
                        {
                            loading ? <ActivityIndicator size="small" color='#FFEB3B'></ActivityIndicator>
                                : <RkText style={styles.txtupdate}>Update</RkText>
                        }

                    </RkButton>
                </View>
            </ScrollView >
        )
    }

    async updateOwnerProfile() {
        let {
            image,
            firstName,
            lastName,
            description,
            country,
            city,
            phNo,
            job,
        } = this.state;

        this.setState({ loading: true, disUpdateBtn: true });

        let path, config;
        let editData = new FormData();
        let editInfo = {
            "firstName": firstName,
            "lastName": lastName,
            "description": description,
            "country": country,
            "city": city,
            "phNo": phNo,
            "job": job
        }

        editData.append("editInfo", JSON.stringify(editInfo));
        editData.append("ownerId", LoggedUserCredentials.getOwnerId())

        if (image === null) {
            path = baseUrl;

            config = {
                headers: {
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
                },
                method: 'POST',
                body: editData
            }

        } else {
            path = baseUrl;

            editData.append("editedProPic", {
                uri: image.path,
                type: image.mime,
                name: "editedPhoto" + '.' + image.mime.split('/')[1]
            })

            config = {
                headers: {
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken(),
                    'Content-Type': 'multipart/mixed',
                },
                method: 'POST',
                body: editData
            }
        }

        let res = await fetch(path, config);
        let resJson = await res.json();

        if (resJson === "OK") {
            this.props.navigation.state.params.refreshOwnerProfile(LoggedUserCredentials.getOwnerId());
            LoggedUserCredentials.setOwnerName(firstName + ' ' + lastName);
            this.setState({ loading: false, disUpdateBtn: false });
            this.props.navigation.navigate("MainProfile");
        } else {
            this.setState({ loading: false, disUpdateBtn: false });
        }
    }
}

const styles = StyleSheet.create({
    imgBack: {
        flex: 1,
        width: null,
        height: null
    },
    infoView: {
        marginVertical: scale(10),
        marginHorizontal: scale(10),
        borderWidth: scale(2),
        borderColor: '#ECC951'
    },
    nameContainer: {
        flexDirection: 'row',
        flex: 1
    },
    imgStyle: {
        width: scale(90),
        height: scale(90),
        borderRadius: scale(150),
        borderColor: '#ECC951',
        overflow: 'hidden',
        borderWidth: scale(1.5)
    },
    unitTxt: {
        alignSelf: 'center',
        flex: 1.5,
        color: '#ffffff',
        fontSize: scale(13)
    },
    commonTxt: {
        alignSelf: 'center',
        flex: 1,
        color: '#ffffff',
        fontSize: scale(15)
    },
    commonInput: {
        alignSelf: 'center',
        flex: 2,
        marginLeft: scale(10),
        color: '#ffffff',
        fontSize: scale(13)
    },
    updateView: {
        marginHorizontal: scale(10),
        marginBottom: scale(15),
        marginTop: scale(10)
    },
    updateBtn: {
        backgroundColor: 'rgba(25, 30, 31,0.5)',
        borderWidth: scale(2),
        borderColor: '#ECC951',
        height: scale(55),
    },
    txtupdate: {
        color: '#ECC951',
        fontSize: scale(20)
    }
})
