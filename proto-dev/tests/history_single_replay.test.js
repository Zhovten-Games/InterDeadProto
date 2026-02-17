import assert from 'assert';

// Base class representing a generic node in the messaging flow
class Node {
  constructor(name) {
    this.name = name;
    this.history = [];
  }

  receive(message) {
    if (!this.history.includes(message)) {
      this.history.push(message);
    }
  }
}

// Messenger extends Node and can send messages to another node
class Messenger extends Node {
  send(message, target) {
    this.receive(message);
    target.receiveFromMessenger(message, this);
  }

  receiveFromCamera(message) {
    this.receive(message);
  }
}

// Camera echoes messages back to the messenger
class Camera extends Node {
  receiveFromMessenger(message, messenger) {
    messenger.receiveFromCamera(message);
  }
}

describe('history_single_replay', () => {
  it('ensures no duplicate messages after messenger↔camera↔messenger cycle', () => {
    const messenger = new Messenger('messenger');
    const camera = new Camera('camera');

    messenger.send('snapshot', camera);

    assert.deepStrictEqual(messenger.history, ['snapshot']);
  });
});
