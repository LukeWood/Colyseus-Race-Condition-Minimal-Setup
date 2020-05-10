import { Room, Client, generateId } from "colyseus";
import { Entity } from "./Entity";
import { State } from "./State";
import { Player } from './Player';

interface MouseMessage {
  x: number;
  y: number;
}

const DESIRED_PLAYERS = 5;

export class ArenaRoom extends Room<State> {

  bots: string[] = [];

  onCreate() {
    this.setState(new State());
    this.state.initialize();

    this.onMessage("mouse", (client, message: MouseMessage) => {
      const entity = this.state.entities[client.sessionId];

      // skip dead players
      if (!entity) {
        console.log("DEAD PLAYER ACTING...");
        return;
      }

      // change angle
      const dst = Entity.distance(entity, message as Entity);
      entity.speed = (dst < 20) ? 0 : Math.min(dst / 15, 4);
      entity.angle = Math.atan2(entity.y - message.y, entity.x - message.x);
    });

    this.setSimulationInterval(() => this.state.update());
  }

  sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  async onJoin(client: Client, options: any) {
    console.log(client.sessionId, "JOINED");
    // simulate network delay to ensure the race condition hits
    await this.sleep(2000);
    this.state.createPlayer(client.sessionId);
    this.manageBotPopulation()
  }

  manageBotPopulation() {
    console.log("Managing bot pop");
    const diff = DESIRED_PLAYERS - Object.values(this.state.entities)
      .filter(v => v instanceof Player)
      .length;
    console.log('need to modify bot population by', diff);
    for (let i = 0; i < diff; i++) {
      const bot = generateId();
      console.log("adding bot", bot)
      this.state.createPlayer(bot);
      this.bots.push(bot);
    }

    for (let i = 0; i > diff; i--) {
      if (this.bots.length > 0) {
        const bot = this.bots.pop();
        if (bot) {
          console.log("removing bot", bot)
          delete this.state.entities[bot];
        }
      }
    }
  }

  onLeave(client: Client) {
    this.manageBotPopulation();
    console.log(client.sessionId, "LEFT!");
    const entity = this.state.entities[client.sessionId];

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }


}
