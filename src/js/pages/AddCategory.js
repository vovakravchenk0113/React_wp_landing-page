import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
    Container,
    Card,
    Feed,
    Image,
    Segment,
    Dimmer,
    Loader,
    Grid,
    Icon,
    Header,
    Button,
    Dropdown,
    Search,
    List,
} from 'semantic-ui-react'
import _ from 'lodash'
import { sendMessage } from '../api'
import TagSearchBar from '../components/TagSearchBar'
import AddTagInput from '../components/AddTagInput'
import { subscribeTo } from '../api'
import { withRouter } from 'react-router'

@observer
class AddCategory extends Component
{
    categories = [
        {id: 0, name: 'Business', icon: '../../images/icons/Business.png'},
        {id: 2, name: 'Entertainment', icon: '../../images/icons/Entertainment.png'},
        {id: 3, name: 'Family', icon: '../../images/icons/Family.png'},
        {id: 4, name: 'Food', icon: '../../images/icons/Food.png'},
        {id: 5, name: 'Fun', icon: '../../images/icons/Fun.png'},
        {id: 6, name: 'Opinions', icon: '../../images/icons/Opinions.png'},
        {id: 7, name: 'Sports', icon: '../../images/icons/Sports.png'},
        {id: 8, name: 'Travel', icon: '../../images/icons/Travel.png'},
        {id: 9, name: 'Wellness', icon: '../../images/icons/Wellness.png'},
    ]

    constructor(props)
    {
        super(props)

        this.state = {
            onAddCategory: this.props.location.state ? this.props.location.state.onAddCategory : null,
        }
    }

    componentDidMount()
    {
        subscribeTo({
            'add-category': foo => {},   // TODO: Can this be be null?
        })
    }

    onCategoryClick(e)
    {
        this.state.onAddCategory(e.target.innerHTML)
    }

    exit()
    {
        history.back()
    }

    render()
    {
        return (
            <Grid>
                <Grid.Row className='add-category-header' verticalAlign='middle' >
                    <Grid.Column textAlign='center' width={2}>
                        <a onClick={this.exit.bind(this)}>
                            <Icon className='clickable' inverted name='close' size='big'/>
                        </a>
                    </Grid.Column>
                    <Grid.Column textAlign='center' verticalAlign='middle' width={14}>
                        <Header className='menu-header-text'>Choose a Category</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <List divided verticalAlign='middle' className='full-width category-list'>
                        {this.categories.map(c => (
                            <List.Item key={c.id}>
                                <Image avatar src={c.icon}/>
                                <List.Content>
                                    <List.Header as='a' className='category-list-item' onClick={this.onCategoryClick.bind(this)}>{c.name}</List.Header>
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                </Grid.Row>
            </Grid>
        )
    }
}

export default withRouter(AddCategory)
