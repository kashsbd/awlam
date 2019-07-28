import React, { Component } from 'react';
import {
    View,
    Modal,
    StyleSheet
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import MapView, { Marker } from 'react-native-maps';

import {
    RkText,
    RkButton
} from 'react-native-ui-kitten';

import { Color } from '../utils/color';
import { scale } from '../utils/scale';

export class MapModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
        }
    }

    open = () => this.setState({ isModalVisible: true });

    close = () => this.setState({ isModalVisible: false });

    render() {
        const { isModalVisible } = this.state;
        const { location } = this.props;

        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible={isModalVisible}
                onRequestClose={this.close}
            >
                <View style={styles.root}>
                    <View style={styles.headerBar}>
                        <RkButton
                            rkType='clear'
                            style={{ width: 40 }}
                            onPress={this.close}>
                            <Icon name='arrow-left' color='#fff' size={17} />
                        </RkButton>
                        <RkText style={{ paddingTop: scale(8), marginLeft: scale(15), color: '#fff' }}>Map View</RkText>
                    </View>
                    <MapView
                        style={styles.map}
                        region={{
                            latitude: parseFloat(location.lat),
                            longitude: parseFloat(location.lon),
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: parseFloat(location.lat),
                                longitude: parseFloat(location.lon)
                            }}
                        />
                    </MapView>
                    <View />
                </View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create(
    {
        root: {
            flex: 1,
        },
        headerBar: {
            flexDirection: 'row',
            minHeight: 55,
            padding: 5,
            backgroundColor: Color.backgroundColor
        },
        map: {
            flex: 1
        }
    }
);
