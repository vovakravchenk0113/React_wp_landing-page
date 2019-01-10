import React, { Component } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { withRouter } from 'react-router'
import axios from 'axios'
import {
    Container,
    Grid,
    Divider,
    Input,
    Form,
    Button,
    Segment,
	Image,
    Icon,
    Responsive,
    Header,
    Link,
} from 'semantic-ui-react'
import { sendMessage, subscribeTo } from '../api'
import EmailValidator from 'email-validator'
import passwordHash from 'password-hash'

class Signin extends Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            errors: {},
            signinFailed: ''            
        }
    }

    handleSigninFormChange = (e, { name, value }) => this.setState({ [name]: value })

    handleSigninSubmit()
    {
        const { history } = this.props

        const email = this.state.email
        const password = this.state.password

        var errors = {}

        // Validate the form inputs
        if(!EmailValidator.validate(email))
            errors['email'] = 'Please enter a valid email'
        if(password == '')
            errors['password'] = 'Please enter a password'

        if(_.isEmpty(errors))
        {
            this.setState({errors: {}})
            
            // TODO: Make sure HTTPS is in place AND find an alternative to sending plaintext passwords
            sendMessage('signin', {email, password}, response =>
            {
                console.log(response)
                if(!response.success)
                    this.setState({signinFailed: response.reason})
                else
                    history.push({pathname: response.redirect})
            })
        }
        else
        {
            console.log(errors)
            this.setState({errors})
        }
    }

    render()
    {
        return (
            <div className='login-background'>
                <Container fluid>
                    <Grid className='fill-screen' centered>
                        <Grid.Row>
                            <Grid.Column width={2}/>
                            <Grid.Column width={12} verticalAlign='middle' textAlign='center'>
                                <Image centered className='login-logo' src={require('../../images/login_logo.png')}/>
                                <Form className='login-form'>
                                    {this.state.signinFailed && <Header color='red' size='huge'>{this.state.signinFailed}</Header>}
                                    {this.state.errors['email'] && <Header color='red' size='huge'>{this.state.errors['email']}</Header>}
                                    <Segment className='login-form-input'>
                                        <Input transparent name='email' placeholder='email' onChange={this.handleSigninFormChange}/>
                                    </Segment>
                                    {this.state.errors['password'] && <Header color='red' size='huge'>{this.state.errors['password']}</Header>}
                                    <Segment className='login-form-input'>
                                        <Input type='password' transparent name='password' placeholder='password' onChange={this.handleSigninFormChange}/>
                                    </Segment>
                                    <Button fluid className='sign-up-button' onClick={this.handleSigninSubmit.bind(this)}>
                                        <span className='sign-up-button-text'>sign-in</span>
                                    </Button>
                                </Form>
                            </Grid.Column>
                            <Grid.Column width={2}/>
                        </Grid.Row>
                    </Grid>
                </Container>
            </div>
        )
    }
}

const SigninWithRouter = withRouter(Signin)
export default SigninWithRouter