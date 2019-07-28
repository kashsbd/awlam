import React, { Component } from 'react';
import {
    View,
} from 'react-native';
import {
    RkButton,
    RkText
} from 'react-native-ui-kitten';

import Icon from 'react-native-vector-icons/FontAwesome';

import { Color } from '../utils/color';

export class Menu extends Component {
    
    constructor(props) {
        super(props);
    }

    _onClick = () => {
        const { onClick } = this.props;
        onClick && onClick();
    }

    render() {
        const { iconName, menuName, style } = this.props;

        return (
            <RkButton onPress={this._onClick} rkType="clear" style={style} >
                <View>
                    <Icon name={iconName} size={30} style={{ textAlign: 'center', color: Color.fontColor }} />
                    <RkText rkType="small" style={{ color: Color.fontColor }}>{menuName}</RkText>
                </View>
            </RkButton>
        )
    }
}

