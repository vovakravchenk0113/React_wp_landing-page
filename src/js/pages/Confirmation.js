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

export default withRouter(class Confirmation extends Component
{
    render()
    {
        return (
            <Grid className='confirmation-background' verticalAlign='middle'>
                <Grid.Row textAlign='center' verticalAlign='middle'>
                    <Grid.Column textAlign='center' width={16}>
                        <Header className='confirmation-message' textAlign='center'>(Check for email confirmation message)</Header>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
})