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
