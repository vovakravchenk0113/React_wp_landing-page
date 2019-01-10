import _ from 'lodash'
import React, { Component } from 'react'
import { Search, Grid, Header } from 'semantic-ui-react'
import { sendMessage } from '../api'

export default class PostSearchBar extends Component
{
    constructor(props)
    {
        super(props)

        this.state = {
            tags: []
        }
    }

    componentWillMount()
    {
        this.resetComponent()
        this.populateAllTags()
    }

    populateAllTags()
    {
        sendMessage('tags', {userID: localStorage.getItem('facebook_user_id')},
            tags => {
                this.setState({
                    isLoading: false,
                    tags
                })
        })
    }

    resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

    handleResultSelect = (e, { result }) => console.log('Selected tag from search', result.title)

    handleSearchChange = (e, { value }) => {
        this.setState({ isLoading: true, value })

        setTimeout(() => {
            if (this.state.value.length < 1) return this.populateAllTags()
            const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
            const isMatch = result => re.test(result.title)

            const results = _.filter(this.state.tags, isMatch)
            this.props.onPostSearchChange(results)
            this.setState({
                isLoading: false,
                results,
            })
        }, 50)
    }

    render() {
        const { isLoading, value, results } = this.state

        return (
            <Search
                input={{ className: 'search-posts-search-box', fluid: true, placeholder: 'Search'}}
                open={false}
                loading={isLoading}
                onResultSelect={this.handleResultSelect}
                onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
                results={results}
                value={value}
                icon=''
                defaultValue='Search'
                loading={false}
            />
        )
    }
}