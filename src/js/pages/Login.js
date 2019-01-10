import React, { Component } from 'react'
// import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { FacebookLogin } from 'react-facebook-login-component';
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
import passwordValidator from 'password-validator'
import passwordHash from 'password-hash'

class Login extends Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            fullName: '',
            email: '',
            password: '',
            password2: '',
            errors: {},
        }

        // Create a schema
        this.passwordRules = new passwordValidator();
        
        // Add properties to it
        this.passwordRules
            .is().min(8)        // Minimum length 8
            .is().max(100)      // Maximum length 100
            .has().uppercase()  // Must have uppercase letters
            .has().lowercase()  // Must have lowercase letters
            .has().digits()     // Must have digits

        subscribeTo({
            'signup': null,
            'signin': null,
        })
    }

    handleSignupFormChange = (e, { name, value }) => this.setState({ [name]: value })

    responseFacebook(response)
    {
        console.log(response)
        const { history } = this.props
        const userID = response.id
        const name = response.name
        const email = response.email
        const profilePicture = response.picture.data.url
        localStorage.setItem('facebook_user_id', userID)

        const appId = '1868693490060003'
        // TODO: Move this request onto the server side
        const appSecret = '1ad2ed8f6c0f74f70c101511a81a709f'

        console.log(axios.get(`https://graph.facebook.com/oauth/access_token?             
            client_id=${appId}&
            client_secret=${appSecret}&
            grant_type=fb_exchange_token&
            fb_exchange_token=${response.accessToken}`)
        .then(response => {
                sendMessage('login', {
                type: 'facebook',
                userID: userID,
                name: name,
                email: email,
            }, redirect => {
                history.push({pathname: redirect, state: {profilePicture}})
            })
            localStorage.setItem('facebook_access_token', response.data.access_token)
        }))
    }

    handleSignupSubmit()
    {
        const { history } = this.props

        const fullName = this.state.fullName
        const email = this.state.email
        const password = this.state.password
        const password2 = this.state.password2

        var errors = {}

        // Validate the form inputs
        if(fullName == '')
            errors['fullName'] = 'Please enter a valid full name'
        if(!EmailValidator.validate(email))
            errors['email'] = 'Please enter a valid email'
        if(!this.passwordRules.validate(password))
            errors['password'] = 'Password must be at least 8 characters long, contain an uppercase letter and at least 1 numeric digit'
        if(password !== password2)
            errors['password2'] = 'Passwords must match'
        

        if(_.isEmpty(errors))
        {
            this.setState({errors: {}})
            
            const hashedPassword = passwordHash.generate(password)
            console.log(hashedPassword)
            sendMessage('signup', {fullName, email, hashedPassword}, response =>
            {
                console.log(response)
                if(!response.success)
                    this.setState({signupFailed: response.reason})
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

    onSigninClick()
    {
        const { history } = this.props
        history.push({pathname: '/signin'})
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
                                <FacebookLogin socialId="1868693490060003"
                                    language="en_US"
                                    scope="public_profile,email"
                                    responseHandler={this.responseFacebook.bind(this)}
                                    xfbml={true}
                                    fields="id,name,email,picture"
                                    version="v2.5"
                                    className="facebook-button"
                                    buttonText=''
                                    children={<div><Icon className='facebook-button-icon' inverted name='facebook f' size='large'/><span className='facebook-button-text'>Sign-up with Facebook</span></div>}/>
                                {/* <FacebookLogin
                                    appId="1868693490060003"
                                    autoLoad={true}
                                    callback={this.responseFacebook.bind(this)}
                                    fields="name,email,picture"
                                    scope='user_posts'
                                    reauthenticate={true}
                                    isMobile={true}
                                    render={renderProps => (
                                        <Button fluid icon className='facebook-button' onClick={renderProps.onClick}>
                                            <Icon className='facebook-button-icon' inverted name='facebook f' size='large'/>
                                            <span className='facebook-button-text'>Sign-up with Facebook</span>
                                        </Button>
                                    )}
                                /> */}
                                <Divider horizontal inverted className='login-divider'><span className='login-divider-text'>or sign-up with</span></Divider>
                                <Form className='login-form'>
                                    {this.state.signupFailed && <Header color='red' size='huge'>{this.state.signupFailed}</Header>}
                                    {this.state.errors['fullName'] && <Header color='red' size='huge'>{this.state.errors['fullName']}</Header>}
                                    <Segment className='login-form-input'>
                                        <Input transparent name='fullName' placeholder='full name' onChange={this.handleSignupFormChange}/>
                                    </Segment>
                                    {this.state.errors['email'] && <Header color='red' size='huge'>{this.state.errors['email']}</Header>}
                                    <Segment className='login-form-input'>
                                        <Input transparent name='email' placeholder='email' onChange={this.handleSignupFormChange}/>
                                    </Segment>
                                    {this.state.errors['password'] && <Header color='red' size='huge'>{this.state.errors['password']}</Header>}
                                    <Segment className='login-form-input'>
                                        <Input type='password' transparent name='password' placeholder='password' onChange={this.handleSignupFormChange}/>
                                    </Segment>
                                    {this.state.errors['password2'] && <Header color='red' size='huge'>{this.state.errors['password2']}</Header>}
                                    <Segment className='login-form-input'>
                                        <Input type='password' transparent name='password2' placeholder='confirm password' onChange={this.handleSignupFormChange}/>
                                    </Segment>
                                    <Button fluid className='sign-up-button' onClick={this.handleSignupSubmit.bind(this)}>
                                        <span className='sign-up-button-text'>sign-up</span>
                                    </Button>
                                </Form>
                                <div className='signin-container'>
                                    <Header className='signin-text'>Already a member</Header>
                                    <Header as='a' className='signin-link' onClick={this.onSigninClick.bind(this)}> sign-in here!</Header>
                                </div>
                            </Grid.Column>
                            <Grid.Column width={2}/>
                        </Grid.Row>
                    </Grid>
                </Container>
            </div>
        )
    }
}

const LoginWithRouter = withRouter(Login)
export default LoginWithRouter