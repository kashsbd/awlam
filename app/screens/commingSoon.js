import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RkText, RkButton } from 'react-native-ui-kitten';
import { FontAwesome } from '../assets/icons';

export class CommingSoon extends React.Component {
    constructor(props) {
        super(props);
    }

    static navigationOptions = ({ navigation }) => ({
        title: 'Comming Soon',
        headerStyle: {
            backgroundColor: '#191e1f',
        },
        headerTitleStyle: {
            color: '#ECC951'
        },
        headerLeft: (
            <RkButton
                rkType='clear'
                contentStyle={{ color: '#ECC951' }}
                style={{ width: 40, marginLeft: 8 }}
                onPress={() => { navigation.openDrawer() }}>
                <RkText rkType='awesome'>{FontAwesome.bars}</RkText>
            </RkButton>
        )
    });

    componentDidMount() {
    }

    render() {
        return (
            <View style={styles.centerItem} >
                <RkText style={{ color: '#fff' }}>Comming Soon</RkText>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    centerItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#191e1f'
    }
})
