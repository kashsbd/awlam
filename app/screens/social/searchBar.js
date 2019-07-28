import React, { PureComponent } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

class SearchBar extends PureComponent {
    constructor(props) {
        super(props);
    }

    _onPress = () => {
        const { onPress } = this.props;
        onPress && onPress();
    }

    render() {
        return (
            <TouchableOpacity
                style={styles.root}
                onPress={this._onPress}
            >
                <View style={styles.content}>
                    <Text style={styles.txtStyle}>Search</Text>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create(
    {
        root: {
            width: '100%'
        },
        content: {
            borderWidth: 1,
            borderColor: '#960614',
            padding: 12
        },
        txtStyle: {
            color: '#d1caca',
            alignSelf: 'flex-start'
        }
    }
)

export { SearchBar }