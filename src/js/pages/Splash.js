import React, { Component } from 'react'
import axios from 'axios'
import {
    Container,
    Image,
    Loader,
    Grid,
} from 'semantic-ui-react'
import { withRouter } from 'react-router'
import { sendMessage, subscribeTo } from '../api'

export default withRouter(class Splash extends Component
{
    componentWillMount()
    {
        const { history } = this.props

        setTimeout(() => {
            history.push({pathname: '/login'})
        }, 2000)
    }

    render()
    {
        return (
            <div className='splash-background'>
                <Image centered verticalAlign='middle' className="splash-logo" src={require('../../images/splash_logo.png')}/>
                {/* <Loader className='splash-spinner' inverted size='massive' active inline='centered' /> */}
            </div>
        )
    }
})