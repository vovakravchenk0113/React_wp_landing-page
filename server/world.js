var network, world, player;

var NodeType = Object.freeze({
    Location: 'Location',
    Player: 'Player',
    Item: 'Item',
    Action: 'Action',
})

var LinkType = Object.freeze({
    Exit: 'Exit',
    Interaction: 'Interaction',
    Contains: 'Contains',
    Contained: 'Contained',
})

const worldData = [
    {
        type: NodeType.Player,
        identifier: 'player',
        data: {
            identifiedLabel: 'Player',
            identifiedImage: './icons/person.png',
            identifiedDescription: 'This is you.',
            initialLocation: 'clearing'
        }
    },
    {
        type: NodeType.Location,
        identifier: 'clearing',
        data: {
            identifiedLabel: 'Clearing',
            identifiedImage: './icons/clearing.png',
            identifiedDescription: 'A clearing in a forest.',
            relationships: [
                {
                    type: LinkType.Exit,
                    target: 'old_house'
                },
                {
                    type: LinkType.Exit,
                    target: 'dark_forest'
                }
            ],
            actions: []
        }                
    },
    {
        type: NodeType.Location,
        identifier: 'old_house',
        data: {
            identifiedLabel: 'Old House',
            identifiedImage: './icons/old_house.png',
            identifiedDescription: 'An old creepy house.',
            relationships: [
                {
                    type: LinkType.Exit,
                    target: 'creepy_Livingroom'
                },
                {
                    type: LinkType.Contains,
                    target: 'empty_lantern'
                }
            ],
            actions: []
        }                
    },
    {
        type: NodeType.Location,
        identifier: 'creepy_Livingroom',
        data: {
            identifiedLabel: 'Creepy Livingroom',
            identifiedImage: './icons/living_room.png',
            identifiedDescription: 'Everything is dusty, you have a bad feeling about this.',
            relationships: [
                {
                    type: LinkType.Contains,
                    target: 'oil_can'
                }
            ],
            actions: []
        }                
    },
    {
        type: NodeType.Location,
        identifier: 'dark_forest',
        data: {
            identifiedLabel: 'Dark Forest',
            identifiedImage: './icons/forest.png',
            identifiedDescription: 'A very creepy old forest, probably haunted.',
            relationships: [],
            actions: []
        }                
    },
    {
        type: NodeType.Item,
        identifier: 'empty_lantern',
        data: {
            identifiedLabel: 'Empty Lantern',
            identifiedImage: './icons/lantern.png',
            identifiedDescription: 'An old dusty lantern, it seems to be empty.',
            actions: [
                {
                    identifier: 'look_at_lantern',
                    label: 'Look At',
                    image: './icons/eye.png',
                    events: [
                        {
                            type: 'LookAt',
                            target: 'empty_lantern',
                            once: true
                        },
                        {
                            type: 'AddAction',
                            target: 'empty_lantern',
                            action: {
                                identifier: 'pick_up_lantern',
                                label: 'Pick Up',
                                image: './icons/hand.png',
                                events: [
                                    {
                                        type: 'PickupItem',
                                        source: 'empty_lantern',
                                        target: 'player',
                                        once: true
                                    },
                                    {
                                        type: 'AddAction',
                                        target: 'empty_lantern',
                                        action: {
                                            identifier: 'fill_lantern',
                                            label: 'Fill Lantern',
                                            image: './icons/pour.png',
                                            conditions: [
                                                { type: 'PlayerHasItem', item: 'oil_can' }
                                            ],
                                            events: [
                                                {
                                                    type: 'ChangeItemTitle',
                                                    target: 'empty_lantern',
                                                    title: 'Full Lantern'
                                                },
                                                {
                                                    type: 'RemoveNode',
                                                    target: 'oil_can'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }                
    },
    {
        type: NodeType.Item,
        identifier: 'oil_can',
        data: {
            identifiedLabel: 'Oil Can',
            identifiedImage: './icons/oil_can.png',
            identifiedDescription: 'A can of oil, smells flammable.',
            actions: [
                {
                    identifier: 'look_at_oil_can',
                    label: 'Look At',
                    image: './icons/eye.png',
                    events: [
                        {
                            type: 'LookAt',
                            target: 'oil_can',
                            once: true
                        },
                        {
                            type: 'AddAction',
                            target: 'oil_can',
                            action: {
                                identifier: 'pick_up_oil_can',
                                label: 'Pick Up',
                                image: './icons/hand.png',
                                events: [
                                    {
                                        type: 'PickupItem',
                                        source: 'oil_can',
                                        target: 'player',
                                        once: true
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }                
    }
]

function handleEvent(event)
{
    switch(event.type)
    {
        case 'LookAround':
        {
            console.log(`Looking around ${event.target}`)
            world.getEntityByIndentifier(event.target).identify()
            world.getEntityByIndentifier(event.target).revealLinks()

            if(event.once)
                return true
        }
        case 'LookAt':
        {
            console.log(`Looking at ${event.target}`)
            world.getEntityByIndentifier(event.target).identify()
            world.getEntityByIndentifier(event.target).revealLinks()

            if(event.once)
                return true
            break
        }
        case 'RevealLinks':
        {
            console.log(`Revealing links to ${event.target}`)
            world.getEntityByIndentifier(event.target).revealLinks()

            if(event.once)
                return true
            break
        }
        case 'AddAction':
        {
            console.log(`Adding actions to ${event.target}`)
            world.getEntityByIndentifier(event.target).addAction(event.action)

            if(event.once)
                return true
            break
        }
        case 'PickupItem':
        {
            console.log(`Transfering ${event.source} to ${event.target}`)
            var source = world.getEntityByIndentifier(event.source)
            var target = world.getEntityByIndentifier(event.target)
            source.transfer(target, true)

            if(event.once)
                return true
            break
        }
        case 'Goto':
        {
            console.log(`Going from ${player.container.identifier} to ${event.target}`)
            var target = world.getEntityByIndentifier(event.target)
            player.goto(target)

            if(event.once)
                return true
            break
        }
        default:
        {
            console.log(`Unknown event type ${event.type}`)
            return true
        }
    }
}

class Node
{
    constructor(type, identifier, data)
    {
        // if(!world.getEntityByIndentifier(identifier))
        //     return

        // this.id = globalNodeId++
        this.type = type
        this.identifier = identifier
        this.data = data
        this.links = Sugar.Array()

        world.addEntity(this)

        if(type == NodeType.Action || data.revealed)
            this.reveal()
        
        if(type == NodeType.Action || data.identified)
            this.identify()
    }

    reveal()
    {
        if(this.revealed)
            return

        graph.nodes.add({id: this.identifier, label: null, shape: 'image',
            image: this.type == 'Location' ? './icons/door.png' : unknownImage})
        this.revealed = true
    }

    identify()
    {
        this.reveal()

        graph.nodes.update({
            id: this.identifier,
            label: this.data.identifiedLabel,
            image: this.data.identifiedImage,
            title: this.data.identifiedDescription
        })
    }

    revealLinks()
    {
        this.reveal()

        this.links.forEach(l => 
        {
            const node = l.node
            node.reveal()

            try
            {
                // console.log(`Creating graph link from ${this.identifier} to ${node.identifier}`)
                
                // Create the link in the graph
                graph.edges.add({
                    id: l.id,
                    from: this.identifier,
                    to: node.identifier,
                    // arrows: directional,
                    color: linkColors[l.type],
                    width: linkWidths[l.type]})
            }
            catch(error)
            {
                // console.log(`${this.identifier} is already linked to ${node.identifier}`)
            }
        })
    }

    remove()
    {
        this.links.forEach(l => {
            l.node.unlinkFrom(this)
        })
        graph.nodes.remove({id: this.identifier})
        world.removeEntity(this)
    }

    linkTo(type, node, revealLinks=false, directional=null)
    {
        const id = globalLinkId++
        this.links.push({id, type, node})
        node.links.push({id, type, node: this})
        console.log(`Linking ${this.identifier} to ${node.identifier}`)
        if(revealLinks)
            this.revealLinks()
    }

    unlinkFrom(node)
    {
        if(!node)
        {
            console.log(`Tried to unlink ${this.label} from a non-existant node`)
            return
        }

        this.links.remove(l => {
            // console.log(`Considering link to ${l.node.identifier} against ${this.identifier}`)
            if(l.node.identifier == node.identifier)
            {
                console.log(`Unlinking ${l.node.identifier} from ${this.identifier}`)
                graph.edges.remove({id: l.id})
                return true
            }
            return false
        });
        node.links.remove(l => l.node.identifier === this.identifier);
    }

    setLabel(label)
    {
        this.label = label
        graph.nodes.update({
            id: this.identifier,
            label: label
        })
    }

    setTitle(label)
    {
        this.label = label
        graph.nodes.update({
            id: this.identifier,
            label: label
        })

        console.log(graph.nodes.get(this.identifier))
    }

    setImage(image)
    {
        this.image = image
        graph.nodes.update({
            id: this.identifier,
            shape: 'image',
            image
        })
    }

    addAction(action)
    {
        for(var i in this.data.actions)
            if(this.data.actions[i].identifier == action.identifier)
                return

        console.log(`Adding ${action.identifier} action to ${this.identifier}`)
        this.data.actions.push(action)
    }

    revealAction(a)
    {
        const that = this
        var allConditionsMet = true
        if(a.conditions)
            a.conditions.forEach(c => {
                if(!that.checkContition(c))
                {
                    allConditionsMet = false
                }
            })

        if(!allConditionsMet)
        {
            console.log(`Conditions were not met for action ${a.type} on ${this.indentifier}`)
            return
        }

        var action = new Action(a.identifier, a.label, a.image, a.events, this)
        action.linkTo(LinkType.Interaction, this, true)
    }

    checkContition(condition)
    {
        var success = false
        console.log(condition)
        switch(condition.type)
        {
            case 'PlayerLocation':
            {
                const target = world.getEntityByIndentifier(condition.target)
                console.log(`Checking if the player is at ${target.identifier}`)
                if(player.container == target)
                    success = true
                break
            }
            case 'PlayerHasItem':
            {
                return player.hasItem(condition.item)
                break
            }
            default:
            {
                console.log(`Unknown condition type ${condition.type}`)
                break
            }
        }

        return condition.invert ? !success : success
    }

    onClick()
    {
        // asdf
        // Refactor the action system to include default actions
        // which are removed after they are performed, leaving any remaining actions
        // available to be performed on the node. Prepopulate default actions for
        // locations and items with Goto and LookAt respectively
            
        if(this.executeActionsOnClick &&
            this.data.actions &&
            this.data.actions.length &&
            this.data.actions.events &&
            this.data.actions.events.length &&
            this.data.actions.events[0].type == getDefaultEventType(this.type))
        {
            if(this.data.actions)
                this.data.actions.forEach(a => a.events.forEach(e => handleEvent(e)))
            return
        }

        // Show any actions the node has
        console.log(this.data.actions)
        if(this.data.actions)
            this.data.actions.forEach(a => this.revealAction(a))
    }

    onUnselect()
    {
    }

    placeIn(node, revealLink=false)
    {
        this.linkTo(LinkType.Contains, node, revealLink)
        this.container = node
    }

    transfer(node, revealLink=false)
    {
        if(this.container)
            this.unlinkFrom(this.container)
        this.placeIn(node, revealLink)
    }
}

class Action extends Node
{
    constructor(identifier, label, image, events, parent, dismissAction=true)
    {
        console.log(`Adding action ${identifier} to ${parent.identifier}`)

        super(NodeType.Action, identifier, {identifiedLabel: label,
            identifiedImage: image,
            identifiedDescription: label})
        this.events = events
        this.parent = parent
        this.dismissAction = dismissAction

        this.identify()
    }

    onClick()
    {
        console.log(`Triggering action ${this.identifier}`)
        
        var removeAction = false
        this.events.forEach(e => {
            if(this.handleEvent(e))
                removeAction = true
        })

        if(removeAction)
            this.removeAction()

        if(this.dismissAction)
            this.remove()
    }

    handleEvent(event)
    {
        handleEvent(event)
    }

    removeAction()
    {
        this.remove()
        for(var i in this.parent.data.actions)
        {
            const action = this.parent.data.actions[i]
            if(action.identifier == this.identifier)
            {
                console.log(`Removing one-time-only action ${this.identifier} from ${this.parent.identifier}`)
                delete this.parent.data.actions[i]
                return
            }
        }
    }
}

class Location extends Node
{
    constructor(identifier, data)
    {
        super(NodeType.Location, identifier, data)
    }

    explore()
    {
        this.setLabel(this.identifiedLabel)
        this.setImage(this.identifiedImage)
        this.setTitle(this.identifiedDescription)
    }
}

class Item extends Node
{
    constructor(identifier, data)
    {
        super(NodeType.Item, identifier, data)
    }
}

class Player extends Node
{
    constructor(identifier, data)
    {
        super(NodeType.Player, identifier, data)
        this.identify()
    }

    goto(location)
    {
        this.transfer(location)

        location.identify()
        location.revealLinks()
    }

    hasItem(identifier)
    {
        console.log(player)
        return this.links.sum(l => l.node.identifier == identifier) > 0
    }
}

class World extends Component
{
    constructor(worldData)
    {
        this.entities = {}
    }

    componentDidMount()
    {
        world = new World()
        world.loadWorldData(worldData)

        // world.revealAll()

        const player = world.getEntityByIndentifier('player')
        const initialLocation = world.getEntityByIndentifier(player.data.initialLocation)
        player.goto(initialLocation)

        // create a network
        var container = document.getElementById('network');
        var data = {
            nodes: graph.nodes,
            edges: graph.edges
        };
        var options = {};
        network = new vis.Network(container, data, options);
        
        network.on("click", function (params)
        {
            if(params.nodes.length > 0)
            {
                if(selectedNode)
                    selectedNode.onUnselect()
                
                selectedNode = world.getEntityByIndentifier(params.nodes[0])
                selectedNode.onClick()
            }
            else
            {
                if(selectedNode)
                    selectedNode.onUnselect()

                selectedNode = null
            }

            document.getElementById('selected_node').innerHTML = selectedNode ? selectedNode.identifier : 'None'
        });
    }

    loadWorldData(worldData)
    {
        // Create all the entities
        worldData.forEach(n => {
            switch(n.type)
            {
                case 'Player':
                {
                    player = new Player(n.identifier, n.data)
                    break
                }
                case 'Location':
                {
                    const location = new Location(n.identifier, n.data)
                    location.executeActionsOnClick = true

                    break
                }
                case 'Item':
                {
                    var item = new Item(n.identifier, n.data)
                    item.executeActionsOnClick = true
                    break
                }
                default:
                {
                    console.log(`Unknown node type: ${n.type}`)
                    break
                }
            }
        })

        this.linkAll()
    }

    addEntity(entity)
    {
        this.entities[entity.identifier] = entity
    }

    removeEntity(entity)
    {
        delete this.entities[entity.identifier]
    }

    revealAll()
    {
        for(var i in this.entities)
            this.entities[i].reveal()

        for(var i in this.entities)
            this.entities[i].identify()

        for(var i in this.entities)
            this.entities[i].revealLinks()
    }

    getEntityByIndentifier(identifier)
    {
        const entity = this.entities[identifier]
        if(!entity)
            console.log(`Couldn't find entity with identifier ${identifier}`)
        else
            return entity
    }

    linkAll()
    {
        const entities = Object.values(this.entities)
        entities.forEach(e => {
            if(e.data.relationships)
            {
                for(var i in e.data.relationships)
                {
                    const r = e.data.relationships[i]

                    if(r.type == LinkType.Contains)
                    {
                        this.getEntityByIndentifier(r.target).transfer(e)
                    }
                    else if (r.type == LinkType.Exit)
                    {
                        const source = this.getEntityByIndentifier(e.identifier)
                        const target = this.getEntityByIndentifier(r.target)
                        target.addAction({identifier: `goto_${target.identifier}`,
                            label: 'Goto',
                            image: './icons/walk.png',
                            conditions: [
                                {type: 'PlayerLocation', target: target.identifier, invert: true}
                            ],
                            events: [
                                {
                                    type: 'Goto',
                                    target: target.identifier
                                }
                            ]
                        })
                        source.addAction({identifier: `goto_${e.identifier}`,
                            label: 'Goto',
                            image: './icons/walk.png',
                            conditions: [
                                { type: 'PlayerLocation', target: source.identifier, invert: true }
                            ],
                            events: [
                                {
                                    type: 'Goto',
                                    target: source.identifier,
                                }
                            ]
                        })
                        e.linkTo(r.type, this.getEntityByIndentifier(r.target))
                    }
                    else
                    {
                        console.log(`${e.identifier}.Link(${r.type}, ${r.target})`)
                        e.linkTo(r.type, this.getEntityByIndentifier(r.target))
                    }
                }
            }
        })
    }
}