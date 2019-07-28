import React from 'react';
import {
    Text,
    StyleSheet,
} from 'react-native';

export class ParseText extends React.Component {

    render() {
        const { rawText } = this.props;

        const regex = /\[(@[^:]+):([^\]]+)\]/g;
        let m;

        while ((m = regex.exec(rawText)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                console.log(`Found match, group ${groupIndex}: ${match}`);
            });
        }
        
        return (
            <Text />
        )
    }
}

const styles = StyleSheet.create(
    {
        root: {
            flex: 1
        }
    }
)