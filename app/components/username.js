import React, { PureComponent } from 'react';
import {
    Text,
    StyleSheet
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { Color } from '../utils/color';

export function Username({ name, role }) {

    let icon_name = undefined;

    switch (role) {
        case 'ADMIN':
            icon_name = 'award';
            break;
        case 'GOVERNMENT':
            icon_name = 'star';
            break;
        case 'CELEBRITY':
            icon_name = 'heart';
            break;
    }

    return (
        <Text>
            <Text>{name + ' '}</Text>
            {
                icon_name ?
                    <Icon name={icon_name} color={Color.backgroundColor} size={15} style={{ marginTop: 10 }} />
                    :
                    ''
            }
        </Text>
    )
}

const styles = StyleSheet.create(
    {
        root: {
            flex: 1
        }
    }
)
