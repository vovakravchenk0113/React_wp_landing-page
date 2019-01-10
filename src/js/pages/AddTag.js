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
import TagSearchBar from '../components/TagSearchBar'
import AddTagInput from '../components/AddTagInput'
import { subscribeTo } from '../api'
import { withRouter } from 'react-router'

@observer
class AddTag extends Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            tags: [],
            // post: this.props.location.state ? this.props.location.state.post : null,
            onAddTag: this.props.location.state ? this.props.location.state.onAddTag : null,
        }
    }

    componentDidMount()
    {
        subscribeTo({
            'tags': tags => this.setState({tags}),
            'add-tag': foo => {},   // TODO: Can this be be null?
        })
    }

    onTagSearchChange(tags)
    {
        this.setState({tags})
    }

    onAddTag(name)
    {
        if(!name || name == '')
            return

        this.state.onAddTag(name)
    }

    onTagClick(e)
    {
        this.state.onAddTag(e.target.innerHTML)
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
            <Grid>
                <Grid.Row className='add-tag-header' verticalAlign='middle' >
                    <Grid.Column textAlign='center' width={2}>
                        <a onClick={this.exit.bind(this)}>
                            <Icon className='clickable' inverted name='close' size='big'/>
                        </a>
                    </Grid.Column>
                    <Grid.Column textAlign='center' verticalAlign='middle' width={14}>
                        <Header className='menu-header-text'>Add Tag</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row style={{marginTop: 50}}>
                    <Grid.Column width={16}>
                        <TagSearchBar
                            onTagSearchChange={this.onTagSearchChange.bind(this)}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row className='full-width grey-background'>
                    <Header ><span className='your-tags-header'>Your Tags</span></Header>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <AddTagInput
                            onAddTag={this.onAddTag.bind(this)}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <List divided verticalAlign='middle' className='full-width'>
                        {tags.map(t => (
                            <List.Item key={t._id}>
                                <List.Content>
                                    <List.Header as='a' className='tag-list-item' onClick={this.onTagClick.bind(this)}>{t.title}</List.Header>
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                </Grid.Row>
            </Grid>
        )
    }
}

export default withRouter(AddTag)
