import React, { Component } from 'react';
import moment from 'moment'
import { Feed, Image } from 'semantic-ui-react'
import graph from 'fb-react-sdk';

export default class Comment extends Component
{
    render()
    {
        const { comment, userStore } = this.props

        return (
            <li><i>{moment(comment.created_time).fromNow()}</i><br/>{comment.from.name}: {comment.message}</li>
        )
    }
}