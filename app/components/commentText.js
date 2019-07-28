import React from 'react';
import {
    Text
} from 'react-native';

import { MentionText } from './mention';

const _ = require('lodash');

const CommentText = ({ message, mentions }) => {

    let _message = message;
    let _mentions = mentions;
    let parts = _message.split(/(\s+)/);

    for (let i = 0, length = parts.length; i < length; i++) {
        const each_word = parts[i].trim();

        if (each_word.length > 0 && each_word !== '@' && each_word.startsWith('@')) {
            const index = _.findIndex(_mentions, { name: each_word });
            if (index !== -1) {
                parts[i] = (<MentionText key={i} name={each_word} />);
            }
        }
    }

    return (
        <Text >{parts}</Text>
    );
}

export { CommentText };