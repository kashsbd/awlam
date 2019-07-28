import React from 'react';
import {
    Text,
    StyleSheet
} from 'react-native';
import { Color } from '../../utils/color';

export const MentionText = ({ name }) => {

    return (
        <Text style={styles.txtStyle}>{name}</Text>
    )

}

const styles = StyleSheet.create(
    {
        txtStyle: {
            fontFamily: 'bold',
            color: Color.backgroundColor
        }
    }
)