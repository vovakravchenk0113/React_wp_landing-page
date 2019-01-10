import React, { Component } from 'react';
import moment from 'moment'
import {
    Feed,
    Image,
    Divider,
    Grid,
    Icon,
    Label,
    Dropdown,
    Modal,
    Header,
    Button,
} from 'semantic-ui-react'
import graph from 'fb-react-sdk';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import CommentList from './CommentList'
import _ from 'lodash'
import { sendMessage } from '../api';
import { withRouter } from 'react-router'

class PostItem
{
    @observable likes = 0
    @observable comments = []
}

@observer
class Post extends Component
{
    categoryIcons = {
        'Business': '../../images/icons/Business.png',
        'Entertainment': '../../images/icons/Entertainment.png',
        'Family': '../../images/icons/Family.png',
        'Food': '../../images/icons/Food.png',
        'Fun': '../../images/icons/Fun.png',
        'Opinions': '../../images/icons/Opinions.png',
        'Sports': '../../images/icons/Sports.png',
        'Travel': '../../images/icons/Travel.png',
        'Wellness': '../../images/icons/Wellness.png',
    }

    sourceIcons = {
        'facebook': require('../../images/icons/Facebook.png'),
    }

    unknownCategoryIcon = '../../images/icons/Unknown.png'

    constructor(props)
    {
        super(props)

        this.state = {post: props.post}
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({post: nextProps.post});
    }

    componentWillMount()
    {
        this.post = new PostItem
        const post = this.state.post

        const accessToken = localStorage.getItem('facebook_access_token')
        graph.setAccessToken(accessToken);

        this.post.id = post.id
        graph.get(`${post.id}/likes`, (err, res) => {
            this.post.likes = res.data.length
        });
        graph.get(`${post.id}/comments`, (err, res) => {
            this.post.comments = res.data
        });
    }

    onAddTagClick()
    {
        this.props.history.push({
            pathname: "/add-tag",
            state: {post: this.post, onAddTag: this.onAddTag.bind(this)}
          })
    }

    onAddTag(name)
    {
        console.log('Adding tag', name)
        sendMessage('add-tag', {post: this.state.post, tag: name, userID: localStorage.getItem('facebook_user_id')}, (response) => {
            history.back()
        })
    }

    onCategoryClick()
    {
        this.props.history.push({
            pathname: "/add-category",
            state: {post: this.post, onAddCategory: this.onAddCategory.bind(this)}
          })
    }

    onAddCategory(name)
    {
        console.log('Adding category', name)
        sendMessage('add-category', {post: this.state.post, category: name, userID: localStorage.getItem('facebook_user_id')}, (response) => {
            console.log('reached')
            history.back()
        })
    }

    getCategoryIcon()
    {
        const post = this.state.post
        return post.category in this.categoryIcons ? this.categoryIcons[post.category] : this.unknownCategoryIcon
    }

    getSourceIconPath(source)
    {
        switch(source)
        {
            case 'facebook': return this.sourceIcons['facebook']
        }
    }

    onEditTags()
    {
        this.onAddTagClick()
    }

    onDeletePostClick()
    {
        // Show a confirmation dialog
        this.setState({showDeleteModal: true})
    }

    closeDeleteModal = () => {
        this.setState({ showDeleteModal: false })
    }

    deletePost()
    {
        sendMessage('delete-post', {
                post: this.state.post,
                source: 'facebook',
                userID: localStorage.getItem('facebook_user_id')
            },
            response => {
                    this.closeDeleteModal()
                }
            )
    }

    render()
    {
        const post = this.state.post
        const user = this.props.user

        const modifyTrigger = (
            <Icon size='huge' name='ellipsis horizontal' color='purple'/>
        )

        const options = [
            { key: 'edit-tag', icon: 'edit' },
            { key: 'delete-post', icon: 'delete' },
          ]

        return (
            <div className='post-container'>
                <Grid>
                    <Grid.Row className='post-header-row' width={16}>
                        <Grid.Column className='post-left-margin' width={2}>
                            <Image fluid circular src={user.picture.data.url}/>
                        </Grid.Column>
                        <Grid.Column width={10}>
                            <Grid>
                                <Grid.Row className='post-info-row'>
                                <h3 className='post-profile-name-text'>{user.name}</h3>
                                </Grid.Row>
                                <Grid.Row className='post-info-row'>
                                    <Image className='post-icon category-post-button' src={this.getCategoryIcon.bind(this)()} onClick={this.onCategoryClick.bind(this)}/>
                                    <Image className='post-icon' src={this.sourceIcons[post.source]}/>
                                    <Label className='round-border-label' as='a'>
                                        <Icon className='post-calender-icon' name='calendar outline'/>
                                        {moment(post.created_time).format('ll')}
                                    </Label>
                                    <Label className='post-time' as='a'>
                                        <Icon name='clock'/>at {moment(post.created_time).format('LT')}
                                    </Label>
                                </Grid.Row>
                            </Grid>
                        </Grid.Column>
                        <Grid.Column width={1} textAlign='right'>
                            <Icon floated='right' size='huge' name='target' color='purple'/>
                        </Grid.Column>
                        <Grid.Column width={1} textAlign='right'>
                            <Dropdown pointing={false} trigger={modifyTrigger} direction='left' icon=''>
                                <Dropdown.Menu>
                                    <Dropdown.Item icon='edit' className='post-dropdown' onClick={this.onEditTags.bind(this)}/>
                                    <Modal size='large' open={this.state.showDeleteModal} trigger={<Dropdown.Item icon='delete' className='post-dropdown'  onClick={this.onDeletePostClick.bind(this)}/>} basic size='small'>
                                        <Header size='huge' icon='delete' content='Remove Post from Stasht?' />
                                        <Modal.Actions>
                                            <Button size='massive' basic color='red' inverted onClick={this.closeDeleteModal.bind(this)}>
                                                <Icon name='remove' /> No
                                            </Button>
                                            <Button size='massive' color='green' inverted onClick={this.deletePost.bind(this)}>
                                                <Icon name='checkmark' /> Yes
                                            </Button>
                                        </Modal.Actions>
                                    </Modal>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column className='post-left-margin post-right-margin'width={16}>
                            <p className='post-text'>{post.message}</p>
                            {post.link && <p><a className='post-text' href={post.link}>{post.link}</a></p>}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column className='post-left-margin' floated='left' width={4}>
                            <Label className='round-border-label' as='a'>
                                - Vancouver, BC
                            </Label>
                        </Grid.Column>
                            {(!post.tags || post.tags.length == 0) &&
                                <Grid.Column className='post-right-margin' floated='right' width={9}>
                                    <Label className='add-tag-button' as='a' onClick={this.onAddTagClick.bind(this)}>
                                        <Icon name='plus' color='red'/>
                                    </Label>
                                </Grid.Column>
                            }
                            {post.tags && 
                                <Grid.Column className='post-right-margin' width={9}>
                                    {_.map(post.tags, t =>
                                    {
                                        console.log(t)
                                        return (
                                            <Label key={t} className='post-tag' as='a'>
                                                {t}
                                            </Label>
                                        )
                                    })
                                    }
                                </Grid.Column>
                            }
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            {post.full_picture ? <p><Image className='post-image' src={post.full_picture}/></p> : ''}\
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className='post-buttom-buttons'>
                        <Grid.Column className='post-left-margin' floated='left' width={7}>
                            <Label className='round-border-label teal-border' as='a'>
                                <Image spaced='right' src={require('../../images/icons/stasht.png')}/>
                                0
                            </Label>
                        </Grid.Column>
                        <Grid.Column className='post-right-margin' floated='right' width={7} textAlign='right'>
                            <Label className='round-border-label purple-border' as='a'>
                            <Image spaced='right' src={require('../../images/icons/book.png')}/>
                                0
                            </Label>
                        </Grid.Column>
                    </Grid.Row>
                    <div className='post-divider'></div>
                </Grid>
            </div>
        )
    }
}

const PostWithRouter = withRouter(Post)
export default PostWithRouter