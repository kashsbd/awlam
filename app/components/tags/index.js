import React from "react";
import PropTypes from "prop-types";
import { View, TextInput } from "react-native";

import Tag from "./tag";
import styles from './styles';

class Tags extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            tags: props.initialTags,
            text: props.initialText
        };
    }

    componentWillReceiveProps(props) {
        const { initialTags = [], initialText = " " } = props;

        this.setState({
            tags: initialTags,
            text: initialText
        });
    }

    onChangeText = text => {
        if (text.length === 0) {
            // `onKeyPress` isn't currently supported on Android; I've placed an extra
            //  space character at the start of `TextInput` which is used to determine if the
            //  user is erasing.
            this.setState(
                {
                    tags: this.state.tags.slice(0, -1),
                    text: this.state.tags.slice(-1)[0] || " "
                },
                () =>
                    this.props.onChangeTags && this.props.onChangeTags(this.state.tags)
            );
        } else if (
            text.length > 1 &&
            (text.slice(-1) === " " || text.slice(-1) === ",") &&
            !(this.state.tags.indexOf(text.slice(0, -1).trim()) > -1)
        ) {
            this.setState(
                {
                    tags: [...this.state.tags, text.slice(0, -1).trim()],
                    text: " "
                },
                () =>
                    this.props.onChangeTags && this.props.onChangeTags(this.state.tags)
            );
        } else {
            this.setState({ text });
        }
    };

    render() {
        const {
            containerStyle,
            style,
            tagContainerStyle,
            tagTextStyle,
            deleteOnTagPress,
            onTagPress,
            readonly,
            maxNumberOfTags,
            inputStyle
        } = this.props;

        return (
            <View style={[styles.container, containerStyle, style]}>
                {this.state.tags.map((tag, i) => (
                    tag !== '' && <Tag
                        key={i}
                        label={tag}
                        onPress={e => {
                            if (deleteOnTagPress) {
                                this.setState(
                                    {
                                        tags: [
                                            ...this.state.tags.slice(0, i),
                                            ...this.state.tags.slice(i + 1)
                                        ]
                                    },
                                    () => {
                                        this.props.onChangeTags &&
                                            this.props.onChangeTags(this.state.tags);
                                        onTagPress && onTagPress(i, tag, e, true);
                                    }
                                );
                            } else {
                                onTagPress && onTagPress(i, tag, e, false);
                            }
                        }}
                        readonly={readonly}
                        tagContainerStyle={tagContainerStyle}
                        tagTextStyle={tagTextStyle}
                    />
                ))}

                {!readonly &&
                    maxNumberOfTags > this.state.tags.length && (
                        <View style={[styles.textInputContainer]}>
                            <TextInput
                                placeholder='Hash Tag'
                                placeholderTextColor='grey'
                                value={this.state.text}
                                style={[styles.textInput, inputStyle]}
                                onChangeText={this.onChangeText}
                                underlineColorAndroid="transparent"
                            />
                        </View>
                    )}
            </View>
        );
    }
}

Tags.defaultProps = {
    initialTags: [],
    initialText: "",
    readonly: false,
    deleteOnTagPress: false,
    maxNumberOfTags: Number.POSITIVE_INFINITY
};

Tags.propTypes = {
    initialText: PropTypes.string,
    initialTags: PropTypes.arrayOf(PropTypes.string),
    onChangeTags: PropTypes.func,
    containerStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    tagContainerStyle: PropTypes.object,
    tagTextStyle: PropTypes.object,
    readonly: PropTypes.bool,
    maxNumberOfTags: PropTypes.number,
    deleteOnTagPress: PropTypes.bool
};

export { Tags };

