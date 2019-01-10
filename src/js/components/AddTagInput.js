import React, { Component } from 'react'
import { Input, } from 'semantic-ui-react'

export default class AddTagInput extends Component
{
    constructor(props)
    {
        super(props)
        this.newTag = ''
    }

    onInputKeyDown(e)
    {
        if(e.keyCode == 13)
            this.props.onAddTag(this.newTag)
        else
            this.newTag = e.target.value + e.key
    }

    onAddTagClick()
    {
        this.props.onAddTag(this.newTag)
    }

    render() {
        return (
            <div>
                <Input fluid placeholder='Add Tag...'
                action={
                    {
                        color: 'teal',
                        labelPosition: 'right',
                        icon: 'plus',
                        content: 'Add',
                        onClick: this.onAddTagClick.bind(this),
                    }}
                onKeyDown={this.onInputKeyDown.bind(this)}/>
            </div>
        )
    }
}