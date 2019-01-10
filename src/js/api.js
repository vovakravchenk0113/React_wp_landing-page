import openSocket from 'socket.io-client'

const socket = openSocket('dev.stasht.biz:8000')
const callbacks = {}

function sendMessage(subject, data=null, callback=null)
{
    socket.emit(subject, data)

    if(callback)
    {
        console.log('Creating a callback for ' + subject)
        callbacks[subject] = callback
    }
}

function subscribeTo(subjects, callback=null)
{
    for(var subject in subjects)
    {
        // Closure
        const s = subject
        const callback = subjects[s]

        socket.on(s, data => {
            if(s in callbacks)
            {
                // console.log('Found a callback for ' + s)
                // console.log(data)
                callbacks[s](data)
                delete callbacks[s]
            }
            if(callback)
                callback(data)
        })
        console.log('Subscribing to ' + subject)
    }
    socket.on('client_error', message => console.log(message))
    socket.on('subscribe', response =>
    {
        if(callback)
            callback()
    })
    socket.emit('subscribe', Object.keys(subjects))
}

export {
    sendMessage,
    subscribeTo,
}