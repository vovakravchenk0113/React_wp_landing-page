var _ = require('lodash')
var Util = require('./util')
var moment = require('moment')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const assert = require('assert')
const EmailValidator = require('email-validator')
const passwordValidator = require('password-validator')
const nodemailer = require('nodemailer')
const passwordHash = require('password-hash')

const dbUrl = 'mongodb://localhost:27017'
const dbName = 'stasht'

emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cashgarman@googlemail.com',
        pass: 'Klaxon22'
    }
});

var db = null
MongoClient.connect(dbUrl, function(err, client)
{
    assert.equal(null, err)
    console.log("Connected successfully to server")

    db = client.db(dbName)
});

function fetchPosts(state)
{
    // return state.user.name + ' is trying to fetch their posts'
    // Request all the 
    return []
}

const stateFetchers = {
    // 'heartbeat': state => 'tick',
    // 'test': state => 'test passed',
    'posts': state => fetchPosts(state)
}

function broadcastState(state, subject)
{
    Util.sendToClients(state.clients, subject, stateFetchers[subject](state))
}

function sendState(client, state, subject)
{
    if(subject in stateFetchers)
        Util.sendToClient(client, subject, stateFetchers[subject](state))
    // else
    //     Util.sendToClient(client, 'client_error', subject + ' is an unhandled subject')
}

module.exports =
{
    'heartbeat': context =>
    {
        console.log('received heartbeat')
        sendState(context.client, context.state, 'heartbeat')
    },
    'client-log': context =>
    {
        // if(context.data.includes("ERROR"))
        console.log(context.client.ip, ':', context.data)
    },
    'signup': context => 
    {
        // Get the signup inputs
        const { fullName, email, hashedPassword } = context.data
        console.log(context.data)

        // Revalidate the signup inputs
        var failed = false
        if(fullName == '')
            failed = true
        if(!EmailValidator.validate(email))
            failed = true

        if(failed)
        {
            Util.sendToClient(context.client, 'signup', {success: false, reason: 'Something went wrong, try again later'})
        }
        else
        {
            // Check if their is already an existing user with this email address
            const users = db.collection('users')
            users.findOne({email})
                .then(user =>
                {
                    if(user)
                    {
                        console.log('Account with email', email, 'already exists')
                        Util.sendToClient(context.client, 'signup', {success: false, reason: 'An account with that email already exists'})
                    }
                    else
                    {
                        // Create a confirmation code for the user
                        const confirmationCode = Util.guid()

                        // Otherwise, create an account for the user
                        user = {
                            name: fullName,
                            email,
                            hashedPassword,
                            onboarded: false,
                            confirmed: false,
                            confirmationCode,
                            tags: []
                        }
                        users.insert(user)

                        // Send them a signup confirmation email
                        var mailOptions = {
                            from: 'cashgarman@googlemail.com',
                            to: email,
                            subject: 'Stasht Account Confirmation',
                            text: 'Confirm your account:\nhttp://dev.stasht.biz/#/confirm/' + confirmationCode
                          };
                          
                        emailTransporter.sendMail(mailOptions, function(error, info)
                        {
                            if (error)
                            {
                                // Util.sendToClient(context.client, 'signup', {success: false, reason: 'Something went wrong, try again later'})
                                Util.sendToClient(context.client, 'signup', {success: false, reason: error})
                                console.log(error);
                            }
                            else
                            {
                                console.log('Email sent: ' + info.response);

                                // Send them to the email confirmation screen
                                Util.sendToClient(context.client, 'signup', {success: true, redirect: '/confirmation'})
                            }
                        });
                    }
                })
        }
    },
    'confirm': context =>
    {
        console.log('Trying to confirm', context.client.ip, 'with confirmation code', context.data.code)

        const users = db.collection('users')
        users.findOne({confirmationCode: context.data.code})
            .then(user => 
                {
                    if(user)
                    {
                        console.log('Found user', user.name, 'with a matching confirmation code')
                        
                        // Check if the user is already confirmed
                        if(user.confirmed)
                        {
                            // Let them know
                            Util.sendToClient(context.client, 'confirm', {success: false, reason: 'This account has already been confirmed'})
                        }
                        else
                        {
                             // Confirm the user
                            users.update({_id: user._id}, {$set: {confirmed: true}})

                            // Send them a welcome email
                            var mailOptions = {
                                from: 'cashgarman@googlemail.com',
                                to: user.email,
                                subject: 'Welcome to Stasht',
                                text: 'Welcome to Stasht ' + user.name + '!'
                            };
                            
                            emailTransporter.sendMail(mailOptions, function(error, info)
                            {
                                if (error)
                                    console.log(error);
                                else
                                    console.log('Email sent: ' + info.response);
                            });
                            
                            // Send them to onboarding
                            Util.sendToClient(context.client, 'confirm', {success: true, redirect: '/welcome'})
                        }
                       
                    }
                    else
                    {
                        console.log('Couldn\'t find a user with a matching confirmation code')
                        Util.sendToClient(context.client, 'confirm', {success: false, reason: 'Could not find an account with a matching confirmation code'})
                    }
                })
    },
    'login': context =>
    {
        console.log('type:', context.data.type)
        console.log('userID', context.data.userID)
        console.log('name', context.data.name)
        console.log('email', context.data.email)
        const users = db.collection('users')

        // If the login was from Facebook
        if(context.data.type == 'facebook')
        {
            // Look for a matching user
            users.findOne({facebookID: context.data.userID})
                .then(user => 
                {
                    var redirect = '/posts'

                    // Check if an account doesn't exist for this user
                    if(!user)
                    {
                        // Create an account for this user, as it's their first login
                        console.log('Creating a new account for ' + context.data.name)
                        user = {
                            facebookID: context.data.userID,
                            name: context.data.name,
                            email: context.data.email,
                            hashedPassword: null,
                            onboarded: false,
                            confirmed: true,
                            tags: []
                        }
                        users.insert(user)

                        // Send them a welcome email
                        var mailOptions = {
                            from: 'cashgarman@googlemail.com',
                            to: context.data.email,
                            subject: 'Welcome to Stasht',
                            text: 'Welcome to Stasht ' + context.data.name + '!'
                        };

                        console.log(mailOptions)
                        
                        emailTransporter.sendMail(mailOptions, function(error, info)
                        {
                            if (error)
                                console.log(error);
                            else
                                console.log('Email sent: ' + info.response);
                        });
                        
                        // Send the user to the onboarding page
                        redirect = '/posts'
                    }

                    // Flag them as logged in with their geo data
                    // Store the user's session start time
                    // Increment the user's session count
                    // Send the user to their posts page

                    // Redirect the user
                    console.log('Redirecting ' + user.name + ' to ' + redirect)
                    Util.sendToClient(context.client, 'login', redirect)
                })
        }
    },
    'signin': context =>
    {
        console.log(context.data)
        const users = db.collection('users')
        users.findOne({email: context.data.email})
            .then(user =>
            {
                if(passwordHash.verify(context.data.password, user.hashedPassword))
                {
                    if(!user.confirmed)
                        Util.sendToClient(context.client, 'signin', {success: false, reason: 'Account is not validated'})
                    else if(!user.onboarded)
                        Util.sendToClient(context.client, 'signin', {success: true, redirect: '/welcome'})
                    else
                        Util.sendToClient(context.client, 'signin', {success: true, redirect: '/posts'})
                }
                else
                    Util.sendToClient(context.client, 'signin', {success: false, reason: 'Invalid email or password'})
            })        
    },
    'logout': context =>
    {
        // Flag the user as logged out
        // Calculate the users's total session time
        // Calculate the users's average session time
        // Update the user's average session time
        // Update the user's lifetime session time
    },
    'subscribe': context =>
    {
        const subjects = context.data
        context.client.subscriptions = _.union(context.client.subscriptions, subjects)
        subjects.forEach(s => sendState(context.client, context.state, s))
        Util.sendToClient(context.client, 'subscribe', subjects)
    },
    'onboarded': context =>
    {
        const users = db.collection('users')
        users.findOne({_id: context.client})
            .then(user => 
            {

            })

    },
    'posts': context => 
    {
        const posts = db.collection('posts')
        console.log(context.data)
        // posts.find({$or: _.map(context.data, id => {return {id: id}})})
        posts.find({$or: _.map(context.data, id => {return {id: id}})})
            .toArray((err, userPosts) => {
                console.log(userPosts)
                Util.sendToClient(context.client, 'posts', userPosts)
            })
    },
    'tags': context =>
    {
        const users = db.collection('users')
        users.findOne({facebookID: context.data.userID})
            .then(user => 
            {
                if(!user)
                {
                    console.log('Could not find user to find tags for')
                    Util.sendToClient(context.client, 'error', 'Cannot find user to find tags')
                }
                else
                {
                    console.log('Getting tags for', user.name)
                    Util.sendToClient(context.client, 'tags', user.tags)
                }
            })
    },
    'add-tag': context =>
    {
        console.log(context.data)
        
        const users = db.collection('users')
        users.findOne({facebookID: context.data.userID})
            .then(user => 
            {
                if(!user)
                {
                    console.log('Could not find user to add a tag to')
                    Util.sendToClient(context.client, 'error', 'Cannot find user to find tags')
                }
                else
                {
                    const newTag = {_id: new ObjectID(), title: context.data.tag}
                    console.log(_.find(user.tags, t => t.title == context.data.tag))
                    if(_.find(user.tags, t => t.title == context.data.tag))
                    {
                        console.log('Tag', context.data.tag, 'already exists')
                        Util.sendToClient(context.client, 'add-tag', 'Tag already exists')
                    }
                    else
                    {
                        const currentTags = _.union(user.tags, [newTag])
                        users.update({facebookID: context.data.userID}, {$set: {tags: currentTags}});
                        console.log('New tags for', user.name, ':', currentTags)
                        Util.sendToClient(context.client, 'add-tag', 'Added new tag')
                    }
                    
                    const posts = db.collection('posts')
                    const source = context.data.post.source
                    const id = context.data.post.id
                    const tag = context.data.tag

                    // If the post doesn't already exist in the user's posts
                    posts.findOne({id: id})
                        .then(post => {
                            if(!post)
                            {
                                // Add it
                                console.log('Adding a new post to the DB')
                                post = {
                                    source: source,
                                    id: id,
                                    tags: [],
                                    category: null,
                                    removed: false,
                                }
                                posts.insert(post)
                            }

                            // Tag the post
                            console.log('Setting tag', newTag, 'to existing post', id)
                            // TODO: Could add support here for multiple tags if required by the design
                            post.tags = [tag]
                            posts.update({id: id}, {$set: {tags: post.tags}})
                            Util.sendToClient(context.client, 'posts', [post])
                        })
                }
            })
    },
    'add-category': context =>
    {
        console.log(context.data)
        
        const users = db.collection('users')
        users.findOne({facebookID: context.data.userID})
            .then(user => 
            {
                if(!user)
                {
                    console.log('Could not find user to add a category to')
                    Util.sendToClient(context.client, 'error', 'Cannot find user to find tags')
                }
                else
                {
                    const posts = db.collection('posts')
                    const source = context.data.post.source
                    const id = context.data.post.id
                    const category = context.data.category

                    // If the post doesn't already exist in the user's posts
                    posts.findOne({id: id})
                        .then(post => {
                            if(!post)
                            {
                                // Add it
                                console.log('Adding a new post to the DB')
                                post = {
                                    source: source,
                                    id: id,
                                    tags: [],
                                    category: null,
                                    removed: false,
                                }
                                posts.insert(post)
                            }

                            // Categorize the post
                            console.log('Adding category', category, 'to existing post', id)
                            post.category = category
                            posts.update({id: id}, {$set: {category: category}})
                            Util.sendToClient(context.client, 'posts', [post])
                        })
                }
            })
    },
    'delete-post': context =>
    {
        console.log(context.data)

        const users = db.collection('users')
        users.findOne({facebookID: context.data.userID})
            .then(user => 
            {
                if(!user)
                {
                    console.log('Could not find user remove a post from')
                    Util.sendToClient(context.client, 'error', 'Cannot find user to remove post from')
                }
                else
                {
                    const posts = db.collection('posts')
                    const post = context.data.post
                    const source = post.source
                    const id = post.id

                    // If the post doesn't already exist in the user's posts
                    posts.findOne({id: id})
                        .then(post => {
                            if(!post)
                            {
                                // Remove it from their stream
                                console.log('Adding a newly removed post to the DB')
                                post = {
                                    source: source,
                                    id: id,
                                    tags: [],
                                    category: null,
                                    removed: true,
                                }
                                posts.insert(post)
                            }

                            // Remove the post
                            post.removed = true
                            posts.update({id: id}, {$set: {removed: true}})
                            posts.find({}).toArray((e, results) => Util.sendToClient(context.client, 'delete-post', results))
                        })
                        .catch(error=> {
                            console.log(error)
                        });
                }
            })
    },
};