import React, { Component } from 'react';
import { observer } from 'mobx-react';
import graph from 'fb-react-sdk';
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
    Divider,
    Sticky,
} from 'semantic-ui-react'
import PostList from '../components/PostList'
import _ from 'lodash'
import { subscribeTo, sendMessage } from '../api'
import { withRouter } from 'react-router'
import FacebookLoading from '../components/FacebookLoading';

@observer
class Posts extends Component
{
    constructor()
    {
        super()

        this.state = {
            userId: null,
            user: null,
            posts: [],
            paging: {}
        }
    }

    updatePosts(posts)
    {
        // if(posts.length == 0)
        // {
        //     console.log('no posts?')
        //     return;
        // }

        const existingPosts = this.state.posts
        posts.forEach(p => {
            // Get the post
            const post =  _.find(existingPosts, existingPost => existingPost.id == p.id)

            // Add any tags to the posts
            post.tags = p.tags

            // Add the category to the post
            post.category = p.category

            // Flag the post as removed if it is
            post.removed = p.removed
        })

        // Rerender the posts lists
        this.setState({posts: existingPosts})
    }

    componentWillMount()
    {
        const userId = localStorage.getItem('facebook_user_id')
        const accessToken = localStorage.getItem('facebook_access_token')
        graph.setAccessToken(accessToken)
        
        subscribeTo({
            'posts': posts => null,
            'delete-post': posts => console.log(posts)
        })

        // Get the user's Facebook details
        graph.get(`/me?fields=picture,name`, (err, user) =>
        {
            // Get the user's Facebook posts
            graph.get(`${userId}/posts?fields=id,caption,description,message,name,full_picture,link,status_type,privacy,message_tags,created_time,place`,
                (err, posts) =>
                {
                    this.setState({user, posts: posts.data, paging: posts.paging})

                    // TODO: Handle other sources of posts
                    _.each(posts.data, p => {p.source = 'facebook'})
                    
                    subscribeTo({
                        'posts': posts => this.updatePosts(posts),
                        'delete-post': posts => this.updatePosts(posts),
                    }, () => {
                        // Get any information from the server about the user's posts
                        sendMessage('posts', _.map(posts.data, 'id'), postsInDB =>
                        {
                            console.log('postsInDB', postsInDB)
                            // this.setState({user, paging: posts.paging})
                            this.updatePosts(postsInDB)
                        })
                    })
                })
        })
    }

    onSearchPostsClick()
    {
        this.props.history.push({
            pathname: "/search-posts",
            // state: {post: this.post, onAddTag: this.onAddTag.bind(this)}
          })
    }

    onOlderPostsClick()
    {
        console.log(this.state.paging.next)
        graph.get(this.state.paging.next, (err, posts) => {
            this.setState({paging: posts.paging})
            _.each(posts.data, p => {
            p.source = 'facebook'
            // p.tags = [{id: Math.random(), label: 'Vancouver, CA'}]
        })
            // Display the posts
            this.setState({posts: _.concat(this.state.posts, posts.data)})

            // // Get any information from the server about the user's posts
            sendMessage('posts', _.map(posts.data, 'id'), knownPosts => this.updatePosts(knownPosts))
        })
    }

    render()
    {
        if(!this.state.user || !this.state.posts)
            return <FacebookLoading/>
        else
            return (
                <div className='posts-background zero-padding'>
                    <div className='posts-topbar'>
                        <Grid centered>
                            <Grid.Row centered className='posts-header'>
                                <Grid.Column textAlign='center' width={2}>
                                    <Icon link onClick={this.onSearchPostsClick.bind(this)} className='header-icon' inverted size='huge' name='search'/>
                                </Grid.Column>
                                <Grid.Column textAlign='center' width={2}>
                                    <Icon className='header-icon' inverted size='huge' name='book'/>
                                </Grid.Column>
                                <Grid.Column textAlign='center' width={8}>
                                    <Header className='posts-my-posts-title' inverted>My Posts</Header>
                                </Grid.Column>
                                <Grid.Column textAlign='center' width={2}>
                                    <Icon className='header-icon' inverted size='huge' name='bell outline'/>
                                </Grid.Column>
                                <Grid.Column textAlign='center' width={2}>
                                    <Icon className='header-icon' inverted size='huge' name='user outline'/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>
                    <Container fluid className='posts-header-container'>
                        <Grid centered className='full-width'>
                            <Grid.Row centered className='full-width'>
                                <Grid.Column width={1}/>
                                <Grid.Column textAlign='left' width={4}>
                                    <Button className='posts-header-buttons' size='big' color='teal'>24 Stasht</Button>
                                </Grid.Column>
                                <Grid.Column className='centered' width={6}>
                                    <Image centered className='profile-picture' size='small' circular src={this.state.profilePicture}/>
                                </Grid.Column>
                                <Grid.Column textAlign='right' width={4}>
                                    <Button className='posts-header-buttons' size='big' color='purple'>12 Stories</Button>
                                </Grid.Column>
                                <Grid.Column width={1}/>
                            </Grid.Row>
                        </Grid>
                    </Container>
                    <br/>
                    <Container fluid>
                        <PostList user={this.state.user} posts={this.state.posts}/>
                        <Button fluid size='big' onClick={this.onOlderPostsClick.bind(this)}>Older Posts</Button> 
                    </Container>
                </div>
            )
    }
}

const PostsWithRouter = withRouter(Posts)
export default PostsWithRouter
