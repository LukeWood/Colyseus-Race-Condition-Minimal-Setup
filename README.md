# Colyseus race condition repo
## Steps to reproduce
- `yarn install`
- `yarn run dev`
- open once browser tab, this one will work fine.
- open another browser tab - this one *MIGHT* fail.

You can see in the logs after opening in the second tab that on the server the proper bot is removed.
On the client the wrong entity is deleted.
This leads to the client having an entity with all undefined values.
you will then get an error in your console regarding the use of an undefined value.


## Details
The code that causes this behavior is located in [ArenaRoom.ts](https://github.com/LukeWood/Colyseus-Race-Condition-Minimal-Setup/blob/master/src/server/rooms/ArenaRoom.ts#L48) in the onjoin handler.

This handle immediately creates new values in the entities map under generated bot ids.
For some reason when doing this while a client is initializing sometimes the client will delete the wrong value from the map.

I've fixed this in the project I'm working on by doing:
`setTimeout(() => this.manageBotPopulation(), 500)`

but that's a pretty bad workaround.
