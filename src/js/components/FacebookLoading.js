import React, { Component } from 'react'
import axios from 'axios'
import {
    Container,
    Image,
    Icon,
    Loader,
    Grid,
    Header,
} from 'semantic-ui-react'
import { withRouter } from 'react-router'

export default withRouter(class FacebookLoading extends Component
{
    render()
    {
        return (
            <div className='loading-background'>
                <Grid centered className='fill-screen' verticalAlign='middle'>
                    <Grid.Row>
                        <Grid.Column textAlign='center'>
                            <Header textAlign='center' className='loading-header-text'>Let’s find</Header>
                            <Header textAlign='center' className='loading-header-text'>some posts</Header>
                            <Header textAlign='center' className='loading-header-text'>to Stasht</Header>
                            <Image spaced='left' spaced='right' src={require('../../images/facebook_logo.png')} className='loading-facebook-logo'/>
                            <Header textAlign='center' className='loading-subheader-text'>Syncing your posts...</Header>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
})