import React, { PureComponent } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    ActivityIndicator
} from 'react-native';

import {
    RkText,
    RkButton
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';

import { Color } from '../../utils/color';
import { scale } from '../../utils/scale';

export class EditProfileModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            loading: true,
        }
    }

    close = () => this.setState({ modalVisible: false });

    open = () => {
        this.setState({ modalVisible: true });
    }

    renderLoading() {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size={30} color={Color.backgroundColor} />
            </View>
        )
    }

    render() {
        const { modalVisible, loading } = this.state;

        return (
            <Modal
                animationType="fade"
                transparent={false}
                visible={modalVisible}
                onRequestClose={this.close}
            >
                <View style={styles.mainContainer}>
                    <View style={styles.headerBar}>
                        <RkButton
                            rkType='clear'
                            style={{ width: 40 }}
                            onPress={this.close}>
                            <Icon name='arrow-left' color='#fff' size={17} />
                        </RkButton>
                        <RkText style={{ paddingTop: scale(8), marginLeft: scale(15), color: '#fff' }}>Edit Profile</RkText>
                    </View>
                    {
                        loading ?
                            this.renderLoading()
                            :
                            <View />
                    }
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create(
    {
        mainContainer: {
            flex: 1
        },
        headerBar: {
            flexDirection: 'row',
            minHeight: 55,
            padding: 5,
            backgroundColor: Color.backgroundColor
        },
        centerContent: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
        }
    }
);