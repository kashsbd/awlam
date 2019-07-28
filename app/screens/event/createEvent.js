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
import DatePicker from 'react-native-datepicker';
import RNGooglePlaces from 'react-native-google-places';
const _ = require('lodash');

import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';
import { eventUrl } from '../../utils/globle';
import futch from '../../utils/futch';
import { Color } from '../../utils/color';
import { scale } from '../../utils/scale';
import { formatted_date, tConv24 } from '../../utils/commonService';

let MAX_DATE = '2030-12-30';

export class CreateEvent extends Component {

    static navigationOptions = ({ navigation }) => ({
        title: 'Create Event',
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
            showActivityIndicator: false,
            progress: 0,
            mediaPickerVisible: false,
            //date of event
            start_date: formatted_date(),
            end_date: '',
            //time of event
            start_time: '',
            end_time: '',
            description: '',
            name: '',
            //selected location
            selectedPlace: null
        }

        this.start_time = '';
        this.end_time = '';
    }

    _setDescription = (text) => this.setState({ description: text });

    _setEventName = (name) => this.setState({ name });

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
            description,
            selectedPlace,
            name,
            start_date,
            start_time,
            end_date,
            end_time,
        } = this.state;

        if (name.trim().length === 0) {
            alert('Please enter event name.');
        } else if (start_time.trim().length === 0) {
            alert('Please select start time.');
        } else if (end_date.trim().length === 0) {
            alert('Please select end date.');
        } else if (end_time.trim().length === 0) {
            alert('Please select end time.');
        } else if (start_time.trim() === end_time.trim()) {
            alert("Event start time and end time can't be equal.");
        } else {

            let data = new FormData();
            data.append("userId", LoggedUserCredentials.getUserId());
            data.append("event_name", name);
            data.append("start_date", start_date);
            data.append("start_time", this.start_time);
            data.append("end_date", end_date);
            data.append("end_time", this.end_time);
            data.append("description", description);

            if (selectedPlace) {
                data.append("locationData", JSON.stringify(selectedPlace));
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
                let res = await futch(eventUrl, config, this._onProgress);
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

    openSearchModal = async () => {
        const place = await RNGooglePlaces.openPlacePickerModal();
        this.setState({ selectedPlace: place });
    }

    render() {

        const {
            name,
            start_date,
            start_time,
            end_date,
            end_time,
            selectedPlace
        } = this.state;

        // const selected_user = _.map(permitted_users, 'name');

        // let users = 'Invite Friends';
        // if (selected_user.length > 0) {
        //     users = parse_user(selected_user);
        // }

        //location data
        let locationName = 'Location';
        if (selectedPlace) {
            locationName = selectedPlace.name;
        }

        //format time
        const temp_start = tConv24(start_time);
        const temp_end = tConv24(end_time);

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
                                    <Text style={{ color: Color.backgroundColor, fontSize: scale(15), fontWeight: 'bold' }}>Pick Cover Photo</Text>
                                </TouchableOpacity>
                        }
                    </ScrollView>

                    <View style={styles.bottomStyle}>
                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Event Name</Text>
                            <TextInput
                                placeholder="Name"
                                placeholderTextColor="grey"
                                underlineColorAndroid="transparent"
                                value={name}
                                onChangeText={this._setEventName}
                                style={styles.nameTextInputStyle} />
                        </View>

                        {/* <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Event Type</Text>
                            <TouchableOpacity onPress={this._openPostTypeBottomSheed} style={styles.postTypeBtn}>
                                <Text style={{ color: 'grey', padding: scale(7) }}>{this.state.postType}</Text>
                                <FIcons name='arrow-down' style={{ color: Color.backgroundColor, fontSize: scale(18), paddingTop: scale(5) }} />
                            </TouchableOpacity>
                        </View> */}

                        {/* {
                            postType === 'Private' &&
                            <View style={{ marginTop: 10 }} >
                                <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginBottom: 8 }}>Invite Friends</Text>
                                <TouchableOpacity
                                    onPress={this.openPeopleModal}
                                    style={styles.peopleBtn}
                                >
                                    <Text style={{ color: 'grey', padding: scale(7) }}>{users}</Text>
                                </TouchableOpacity>
                            </View>
                        } */}

                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <View style={{ width: '50%' }}>
                                <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Start Date</Text>
                                <DatePicker
                                    style={{ width: '85%', marginLeft: 13 }}
                                    date={start_date}
                                    mode="date"
                                    placeholder="Select date"
                                    format="YYYY-MM-DD"
                                    minDate={formatted_date()}
                                    maxDate={MAX_DATE}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: {
                                            width: 0,
                                            height: 0
                                        },
                                        dateInput: {
                                            color: 'grey',
                                            borderWidth: 0.5,
                                            borderColor: Color.backgroundColor
                                        }
                                    }}
                                    onDateChange={(date) => { this.setState({ start_date: date }) }}
                                />
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={{ color: Color.backgroundColor, marginVertical: 8 }}>Start Time</Text>
                                <View style={{ flexDirection: 'row', paddingRight: 10 }}>
                                    <DatePicker
                                        style={{ width: '88%' }}
                                        date={temp_start.time}
                                        mode="time"
                                        is24Hour={true}
                                        placeholder="Select start time"
                                        minDate={formatted_date()}
                                        maxDate={MAX_DATE}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: {
                                                width: 0,
                                                height: 0
                                            },
                                            dateInput: {
                                                borderWidth: 0.5,
                                                borderColor: Color.backgroundColor
                                            }
                                        }}
                                        onDateChange={(time) => { this.setState({ start_time: time }); this.start_time = time }}
                                    />
                                    <Text style={{ alignSelf: 'center', paddingRight: 5 }}>{temp_start.format}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <View style={{ width: '50%' }}>
                                <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>End Date</Text>
                                <DatePicker
                                    style={{ width: '85%', marginLeft: 13 }}
                                    date={end_date}
                                    mode="date"
                                    placeholder="Select end date"
                                    format="YYYY-MM-DD"
                                    minDate={formatted_date()}
                                    maxDate={MAX_DATE}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: {
                                            width: 0,
                                            height: 0
                                        },
                                        dateInput: {
                                            borderWidth: 0.5,
                                            borderColor: Color.backgroundColor
                                        }
                                    }}
                                    onDateChange={(date) => { this.setState({ end_date: date }) }}
                                />
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={{ color: Color.backgroundColor, marginVertical: 8 }}>End Time</Text>
                                <View style={{ flexDirection: 'row', paddingRight: 10 }}>
                                    <DatePicker
                                        style={{ width: '88%' }}
                                        date={temp_end.time}
                                        mode="time"
                                        is24Hour={true}
                                        placeholder="Select end time"
                                        minDate={formatted_date()}
                                        maxDate={MAX_DATE}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: {
                                                width: 0,
                                                height: 0
                                            },
                                            dateInput: {
                                                color: 'grey',
                                                borderWidth: 0.5,
                                                borderColor: Color.backgroundColor
                                            }
                                        }}
                                        onDateChange={(time) => { this.setState({ end_time: time }); this.end_time = time; }}
                                    />
                                    <Text style={{ alignSelf: 'center' }}>{temp_end.format}</Text>
                                </View>
                            </View>
                        </View>

                        <View >
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: 12, marginVertical: 8 }}>Event Location</Text>
                            <TouchableOpacity onPress={this.openSearchModal} style={styles.locationBtn}>
                                <Text style={{ color: 'grey', padding: scale(7) }}>{locationName}</Text>
                                <FIcons name='map-pin' style={{ color: Color.backgroundColor, fontSize: scale(18), paddingTop: scale(5) }} />
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text style={{ color: Color.backgroundColor, marginHorizontal: scale(10), marginVertical: 8 }}>Description for the event</Text>
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

                {/* <BottomSheet
                    ref={this._setPostTypeRef}
                    itemDivider={3}
                    backButtonEnabled
                    coverScreen={false}
                    title="Event Type"
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
                /> */}

                {/* <PermittedPeopleModal
                    ref={this._setPeopleRef}
                    selected_user={permitted_users}
                    onComplete={this._onComplete}
                    {...this.props}
                /> */}
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
    },
    locationBtn: {
        borderWidth: 0.5,
        borderColor: Color.backgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 13,
    },
})

