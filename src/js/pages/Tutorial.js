import React, { Component } from 'react'
import axios from 'axios'
import {
    Container,
    Image,
    Loader,
    Grid,
    Header,
    Button,
    Icon,
} from 'semantic-ui-react'
import { withRouter } from 'react-router'
import { sendMessage } from '../api';

export default withRouter(class Tutorial extends Component
{
    constructor(props)
    {
        super(props)

        this.state = 
        {
            email: props.email,
            page: 0,
            content: [
                <div><Header>Page 1</Header><Header>of the Tutorial</Header></div>,
                <div><Header>Page 2</Header><Header>of the Tutorial</Header></div>,
                <div><Header>Page 3</Header><Header>of the Tutorial</Header></div>,
                <div><Header>Page 4</Header><Header>of the Tutorial</Header></div>,
            ]
        }
    }

    onSkipTutorial()
    {
        const { history } = this.props
        history.push({pathname: '/posts'})
    }

    onPrev()
    {
        console.log('prev')
        if(this.state.page > 0)
            this.setState({page: this.state.page - 1})
    }

    onNext()
    {
        console.log('next')
        if(this.state.page < 3)
            this.setState({page: this.state.page + 1})
        if(this.state.page == 3)
            sendMessage('signup', {onboarded: true}, redirect =>
            {
                console.log('Conpleted onboarding')
                history.push({pathname: redirect})
            })
    }

    render()
    {
        return (
            <div>
                <Grid className='tutorial-background' verticalAlign='middle'>
                    <Grid.Row textAlign='center' verticalAlign='middle'>
                        <Grid.Column width={1}/>
                        <Grid.Column textAlign='center' width={1}>
                            <Icon className='clickable' fitted inverted size='massive' name='chevron left' onClick={this.onPrev.bind(this)}/>
                        </Grid.Column>
                        <Grid.Column textAlign='center' width={12}>
                            {/* <Transition.Group animation={animation} duration={duration}>
                                {visible && <Image centered size='small' src='/assets/images/leaves/4.png' />}
                            </Transition.Group> */}
                            <Header inverted size='huge' className='confirmation-message'>{this.state.content[this.state.page]}</Header>
                        </Grid.Column>
                        <Grid.Column textAlign='center' width={1}>
                            <Icon className='clickable' fitted inverted size='massive' name='chevron right' onClick={this.onNext.bind(this)}/>
                        </Grid.Column>
                        <Grid.Column width={1}/>
                    </Grid.Row>
                </Grid>
                {/* <Button onClick={this.onSkipTutorial.bind(this)}>Skip Tutorial</Button> */}
            </div>
        )
    }
})