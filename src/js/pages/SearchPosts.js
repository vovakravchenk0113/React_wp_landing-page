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
    Tab,
} from 'semantic-ui-react'
import _ from 'lodash'
import { sendMessage } from '../api'
import PostSearchBar from '../components/PostSearchBar'
import { subscribeTo } from '../api'
import { withRouter } from 'react-router'

@observer
class SearchPosts extends Component
{
    // panes = [
    //     { menuItem: 'Tab 1', render: () => <Tab.Pane attached={false}>Tab 1 Content</Tab.Pane> },
    //     { menuItem: 'Tab 2', render: () => <Tab.Pane attached={false}>Tab 2 Content</Tab.Pane> },
    //     { menuItem: 'Tab 3', render: () => <Tab.Pane attached={false}>Tab 3 Content</Tab.Pane> },
    // ]

    categories = [
        {id: 0, name: 'Everything'},
        {id: 0, name: 'Business'},
        {id: 2, name: 'Entertainment'},
        {id: 3, name: 'Family'},
        {id: 4, name: 'Food'},
        {id: 5, name: 'Fun'},
        {id: 6, name: 'Opinions'},
        {id: 7, name: 'Sports'},
        {id: 8, name: 'Travel'},
        {id: 9, name: 'Wellness'},
    ]

    constructor(props)
    {
        super(props)

        this.panes = _.map(this.categories, c => 
        {
            return {menuItem: c.name, render: () => (
                <Header>{c.name}</Header>
            )}
        })

        this.state = {
            tags: []
        }
    }

    componentDidMount()
    {
        subscribeTo({
            'tags': tags => this.setState({tags}),
        })
    }

    onPostSearchChange(tags)
    {
        this.setState({tags})
    }

    onSearchPosts(name)
    {
        if(!name || name == '')
            return

        this.state.onSearchPosts(name)
    }

    onResultClick(e)
    {
        this.state.onSearchPosts(e.target.innerHTML)
    }

    exit()
    {
        history.back()
    }

    render()
    {
        // console.log(this.props.location.state.post)
        // if(!this.state.user || !this.state.posts)
        //     return (
        //         <Segment>
        //             <Dimmer active inverted>
        //                 <Loader inverted>Loading</Loader>
        //             </Dimmer>
        //         </Segment>)
        // else
        const tags = this.state.tags
        return (
            <div>
                <div className='search-posts-header'>
                    <Grid >
                        <Grid.Row textAlign='center' verticalAlign='middle' >
                            <Grid.Column textAlign='center' width={2}>
                                <a onClick={this.exit.bind(this)}>
                                    <Icon className='clickable' inverted name='close' size='big'/>
                                </a>
                            </Grid.Column>
                            <Grid.Column textAlign='center' verticalAlign='middle' width={12}>
                                <Header className='menu-header-text'>Search Posts</Header>
                            </Grid.Column>
                            <Grid.Column width={2}/>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <PostSearchBar
                                    onPostSearchChange={this.onPostSearchChange.bind(this)}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column textAlign='center' verticalAlign='middle' width={16}>
                                <Tab className='search-posts-category-tabs' menu={{ secondary: true, pointing: true }} panes={this.panes} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
                <div>
                    <Header className='full-width grey-background'>
                        <Header ><span className='your-tags-header'>Your Tags</span></Header>
                    </Header>
                    <List divided verticalAlign='middle' className='full-width'>
                        {tags.map(t => (
                            <List.Item key={t._id}>
                                <List.Content>
                                    <List.Header as='a' className='tag-list-item' onClick={this.onResultClick.bind(this)}>{t.title}</List.Header>
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                </div>
            </div>
        )
    }
}

export default withRouter(SearchPosts)
