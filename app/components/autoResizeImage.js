import React, { Component } from 'react'
import { Image } from 'react-native'
import FastImage from 'react-native-fast-image'

export class AutoResizeImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: 0,
            width: 0,
            progress: undefined
        }
    }

    onLoad = e => {
        const { nativeEvent: { width, height } } = e;
        this.setState({ width, height });
        if (this.props.onLoad) this.props.onLoad(e);
    }

    onProgress = e => {
        this.setState({
            progress: Math.round(100 * (e.nativeEvent.loaded / e.nativeEvent.total))
        })
    }

    getHeight = () => {
        if (!this.state.height) return 300;

        const ratio = this.state.height / this.state.width;
        const height = this.props.width * ratio;
        return height;
    }

    render() {
        const height = this.getHeight();

        return (
            <FastImage
                {...this.props}
                onLoad={this.onLoad}
                style={[{ width: this.props.width, height }, this.props.style]}
            />
        )
    }
}
