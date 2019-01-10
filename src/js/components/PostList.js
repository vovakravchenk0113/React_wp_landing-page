import React, { Component } from 'react';
import Post from './Post'

export default class PostList extends Component
{
    constructor(props)
    {
        super(props)

        this.state = {posts: props.posts}
    }
    
    componentWillReceiveProps(nextProps)
    {
        this.setState({posts: nextProps.posts});
    }

    render()
    {
        const posts = this.state.posts
        return _.filter(posts, p => !p.removed).map(p => (
            <Post key={p.id}
                user={this.props.user}
                post={p}
            />
        ))
    }
}