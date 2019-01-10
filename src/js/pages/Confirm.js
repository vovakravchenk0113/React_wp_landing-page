import React, { Component } from 'react'
import axios from 'axios'
import {
    Container,
    Image,
    Loader,
    Grid,
    Header,
} from 'semantic-ui-react'
import { withRouter } from 'react-router'
import { sendMessage, subscribeTo } from '../api';

export default withRouter(class Confirm extends Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            finished: false,
            error: null
        }

        subscribeTo({
            'confirm': null
        })
    }

    componentWillMount()
    {
        const { history } = this.props

        const confirmationCode = this.props.location.pathname.replace('/confirm/', '')
        console.log(confirmationCode)

        sendMessage('confirm', {code: confirmationCode}, response =>
        {
            console.log(response)
            this.setState({finished: true})
            
            if(!response.success)
                this.setState({error: response.reason})
            else
                history.push({pathname: response.redirect})
        })
    }

    render()
    {
        return (
            <div>
                {!this.state.finished && (
                    <Loader active size='massive' inline='centered' />
                )}
                {this.state.error && <Header>{this.state.error}</Header>}
            </div>
        )
    }
})