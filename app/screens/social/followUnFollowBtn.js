import React, { PureComponent } from 'react';
import { scale } from '../../utils/scale';
import { View, Text } from 'react-native'
import { RkButton, RkText } from 'react-native-ui-kitten';
import { unfolloOwnerUrl, followOwnerUrl } from '../../utils/globle';
import LoggedUserCredentials from '../../utils/modal/LoggedUserCredentials';

export class FollowUnFollowBtn extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            status: this.props.status
        }
    }

    followToggle = () => {
        const { likerId } = this.props;
        const { status } = this.state;

        let path = '';
        if (status === 'Unfollow') {
            this.setState({ status: "Follow" })
            path = unfolloOwnerUrl
        } else if (status === 'Follow') {
            this.setState({ status: "Unfollow" });
            path = followOwnerUrl
        }

        let data = new FormData();
        data.append("followerId", LoggedUserCredentials.getUserId());
        data.append("followedId", likerId);

        const config = {
            headers: {
                'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
            },
            method: 'POST',
            body: data
        }
        fetch(path, config)
            .then(res => { res.json(); console.log(res) })
            .then(resJon => console.log(resJon))
            .catch(err => console.log(err))
    }

    render() {
        let { status } = this.state;
        return (
            <View style={{ alignSelf: 'center' }}>
                <RkButton onPress={this.followToggle} style={{ height: 25, width: 100, borderRadius: 10, marginRight: 10, backgroundColor: '#ECC951' }} >
                    <RkText style={{ fontSize: 15 }}>{status}</RkText>
                </RkButton>
            </View>
        )
    }
}