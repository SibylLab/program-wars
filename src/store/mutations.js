import Timer from 'easytimer'
import { bus } from '@/components/shared/Bus'
import Player from '@/classes/game/Player'
import Deck from '@/classes/game/Deck'
import Stack from '@/classes/game/Stack'


export default {
  /**
   * Resets all game related items in the state for a fresh game.
   * Creates an empty Deck so createDeck Will need to be called with
   * the number of players in the game.
   * Sets gameState to 'game'.
   * Should not affect non-game related settings.
   */
  resetStateForGame (state) {
    state.players = []
    state.stacks = []
    state.hands = []
    state.aiHandlers = []
    state.objectives = []
    state.deck = new Deck()
    state.gameState = 'game'
    state.activePlayer = undefined
    state.activeCard = undefined
    state.scoreLimit = 75
    state.tips = {showTips: true, factIndex: 0}
  },

  /**
   * Set the starting player for the game.
   */
  setStartingPlayer (state) {
    // Original game always let the AI start first. Any desired behaviour can
    // be set here to do that, but for now just pick the first player.
    state.activePlayer = state.players[0]
  },

  /**
   * Change the game state to a given new state.
   * Payload needs field -> newState: 'state'
   */
  changeGameState (state, payload) {
    state.gameState = payload.newState
  },

  /**
   * Create a new deck for a game with a certain number of players.
   */
  createNewDeck (state, payload) {
    state.deck = new Deck(payload.numPlayers)
  },

  /**
   * Toggle tips on and off.
   */
  toggleTips (state) {
    state.tips.showTips = !state.tips.showTips
  },

  /**
   * Setup a new timer.
   */
  newTimer (state) {
    state.timer = new Timer()
    state.timer.start()
    // eslint-disable-next-line no-unused-vars
    state.timer.addEventListener('secondsUpdated', function (e) {
      $('#basicUsage').html(state.timer.getTimeValues().toString())
    })
  },

  /**
   * Stop the current timer.
   */
  stopTimer (state) {
    if (state.timer) {
      state.timer.stop()
    }
  },

  /**
   * Uses a list of player information to create and add new players.
   */
  addPlayers(state, payload) {
    let playerInfo = payload.players
    for (let i = 0; i < playerInfo.length; i++) {
      let player = new Player(i, playerInfo[i].name, playerInfo[i].ai)
      state.players.push(player)
    }
  },

  /**
   * Give a player a new hand.
   * Can be used when they have no hand or to redraw a full hand.
   */
  giveNewHand (state, payload) {
    let player = payload.player

    // discard old hand if applicable
    let oldHand = state.hands.find(h => h.playerId === player.id)
    if (oldHand !== undefined) {
      for (let card of oldHand.cards) {
        state.deck.discard.push(card)
      }
    }

    // create and fill new hand
    let hand = {playerId: player.id, cards: []}
    while (hand.cards.length < 5) {
      let card = state.deck.draw()
      hand.cards.push(card)
    }

    state.hands = state.hands.filter(h => h.playerId !== player.id)
    state.hands.push(hand) 
    state.activeCard = undefined
  },

  /**
   * Set the current active card.
   */
  setActiveCard (state, payload) {
    state.activeCard = payload.newCard
    bus.$emit('card-selected')
  },

  /**
   * Move to the next player.
   */
  nextPlayer (state) {
    let id = state.activePlayer.id
    id = (id + 1) % state.players.length
    state.activePlayer = state.players.find(p => p.id === id)
  },

  /**
   * Draw a card from the deck and add it to the activePlayers hand.
   */
  drawCard (state) {
    let card = state.deck.draw()
    let hand = state.hands.find(h => h.playerId === state.activePlayer.id)
    hand.cards.push(card)
  },

  /**
   * Remove a given card from a given players hand.
   */
  removeCardFromHand (state, payload) {
    let hand = state.hands.find(h => h.playerId === payload.player.id)
    hand.cards = hand.cards.filter(c => c !== payload.card)
  },

  /**
   * Discard the active card from the current players hand.
   */
  discardActiveCard (state) {
    let player = state.players.find(p => p.id === state.activePlayer.id)
    let hand = state.hands.find(h => h.playerId === player.id)
    hand.cards = hand.cards.filter(c => c !== state.activeCard)
    state.deck.discard.push(state.activeCard)
    state.activeCard = undefined
  },

  /**
   * Adds a given card effect to a player with the given id.
   * Must also be passed isPositive to know what kind of effect it is.
   */
  addCardEffect (state, payload) {
    let player = state.players.find(p => p.id === payload.playerId)
    if (payload.isPositive) {
      player.addPositive(payload.effect)
    } else {
      player.addNegative(payload.effect)
    }
  },

  /**
   * Remove a given card from the hand with the given playerID.
   */
  removeFromHand (state, payload) {
    let hand = state.hands.find(h => h.playerId === payload.playerId)
    hand.cards = hand.cards.filter(c => c.id != payload.card.id)
  },

  /**
   * Add a given card to a stack with the given stackId.
   * If payload.replace is true we are removing the top card before adding
   * the given card.
   */
  addToStack (state, payload) {
    let stack = state.stacks.find(s => s.stackId === payload.stackId)
    if (payload.replace) {
      let top = stack.cards.pop()
      state.deck.discard.push(top)
    }
    stack.cards.push(payload.card)
  },

  /**
   * Create a new stack with a given card and a given player id.
   */
  newStack (state, payload) {
    let stack = new Stack(payload.playerId)
    stack.cards.push(payload.card)
    state.stacks.push(stack)
  },

  /**
   * Combine stacks that have been grouped together.
   * Needs to change to use willAccept and probably take the 
   * 2 highest repeats or Rx variable pairs.
   * Also, needs to discard all unused cards.
   * Should also just ask how much work to put into this if we are going to
   * remove group cards.
   */
  combineStacks (state, payload) {
    let stack = new Stack(payload.stacks[0].playerId)
    stack.cards.push(payload.groupCard)
    // Pool all repeats and vars (keep Rx and var pairs)
    // Sort by value of repeats and pairs. Add the biggest 2 to the group.
    // only add a max of 1 unpaired Rx.

    let stacks = payload.stacks.filter((s) => {
      let top = s.getTop()
      return top.type !== "REPEAT" || top.value !== 1
    })
    for (let s of stacks) {
      let stripped = s.cards.slice(1)
      for (let c of stripped) {
        stack.cards.push(c)
      }
    }

    let unpairedRxStacks = payload.stacks.filter((s) => {
      let top = s.getTop()
      return top.type === "REPEAT" && top.value === 1
    })

    if (unpairedRxStacks.length > 0) {
      for (let s of unpairedRxStacks) {
        let stripped = s.cards.slice(1)
        for (let c of stripped) {
          stack.cards.push(c)
        }
      }
    }

    state.stacks = state.stacks.filter(s => !payload.stacks.find(st => st === s))
    state.stacks.push(stack)
  }
}
