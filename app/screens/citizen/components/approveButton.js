import React, { Component } from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    Text
} from 'react-native';

import { Color } from '../../../utils/color';
import { scale, scaleVertical } from '../../../utils/scale';
import LoggedUserCredentials from '../../../utils/modal/LoggedUserCredentials';
import { citizenUrl } from '../../../utils/globle';

export class ApproveButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isApproved: props.isApproved
        }
    }

    approvePost = async () => {
        const { isApproved } = this.state;
        if (!isApproved) {
            const form_data = {
                adminId: LoggedUserCredentials.getUserId()
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + LoggedUserCredentials.getAccessToken()
                },
                body: JSON.stringify(form_data),
                method: 'POST'
            }

            const url = citizenUrl + '/' + this.props.postId + '/approve';

            try {
                const result = await fetch(url, config);
                this.setState({ isApproved: true });
            } catch (error) {
                this.setState({ isApproved: false });
                alert('Something went wrong.Please try later.');
            }
        }
    }

    render() {
        const { isApproved } = this.state;
        const text = isApproved ? 'Approved' : 'Approve';

        if (!isApproved) {
            return (
                <TouchableOpacity
                    style={styles.btnStyle}
                    onPress={this.approvePost}
                    disabled={isApproved}
                >
                    <Text style={styles.txtStyle} >
                        {text}
                    </Text>
                </TouchableOpacity>
            );
        }
        
        return null;
    }
}

const styles = StyleSheet.create(
    {
        btnStyle: {
            borderWidth: 1,
            borderColor: Color.backgroundColor,
            width: scale(85),
            height: scale(30),
            borderRadius: 7
        },
        txtStyle: {
            color: Color.backgroundColor,
            textAlign: 'center',
            paddingTop: scaleVertical(3)
        }
    }
);