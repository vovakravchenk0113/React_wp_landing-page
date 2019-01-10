import React, { Component } from 'react';
import Comment from './Comment'

export default class CommentList extends Component
{
    render()
    {
        const { comments, userStore } = this.props
        return (
            <ul>
                {comments.map(c => <Comment key={c.id} comment={c} userStore={userStore}/>)}
            </ul>)
    }
}