const readlineSync = require('readline-sync');
const shuffle = require('shuffle-array');

// Create a deck of cards
const suits = ['heart', 'diamond', 'club', 'spade']; //4 types of suits
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'K', 'Q', 'J'];


//Intializing a deck of cards(52 combination)
let deck = [];

suits.forEach(suit => {
  values.forEach(value => {
    deck.push({ suit, value });
    if (value !== '0') {
      deck.push({ suit, value });
    }
  });
});

// Shuffle the deck
shuffle(deck);

// Deal cards to players and number of players
const numPlayers = parseInt(readlineSync.question('How many players are playing? (up to 4) ')); 
const players = [];


//Distributing 5 cards to each player
for (let i = 1; i <= numPlayers; i++) {
  const playerName = readlineSync.question(`Enter name for player ${i}: `);
  const cardsInHand = deck.splice(0, 5);   
  players.push({ name: playerName, cardsInHand });
}

// Start the game by randomly selecting player
let activePlayerIndex = Math.floor(Math.random() * numPlayers);
let activeCard = deck.pop();


//Infinite loop till the game ends or players left
while (true) {
  const activePlayer = players[activePlayerIndex];
  console.log("\n***************************\n");
  console.log(`It's ${activePlayer.name}'s turn`);
  console.log(`\nTop card: ${activeCard.suit} ${activeCard.value}\n`);
  console.log(`Your cardsInHand: ${activePlayer.cardsInHand.map(card => `${card.suit} ${card.value}`).join(', ')}`);
  console.log("\n***************************\n");

  // Validating if player can play a card
  let playableCards = activePlayer.cardsInHand.filter(card => card.suit === activeCard.suit || card.value === activeCard.value);
  if (playableCards.length === 0) {
    console.log('You don\'t have any playable cards. Draw a card from the deck.');
    activePlayer.cardsInHand.push(deck.pop());
  } else {
    // Ask the player to play a card
    let chosenCard = null;
    while (!chosenCard) {
      const cardIndex = readlineSync.keyInSelect(
        activePlayer.cardsInHand.map(card => `${card.suit} ${card.value}`),
        'Choose a card to play or press "d" to draw a card from the deck'
      );

      //If player exits in between of the game or played a card
      if (cardIndex === -1) {
        console.log('Thanks for playing!');
        process.exit(0);
      } else if (cardIndex === activePlayer.cardsInHand.length) {
        activePlayer.cardsInHand.push(deck.pop());
        break;
      } else if (playableCards.includes(activePlayer.cardsInHand[cardIndex])) {
        chosenCard = activePlayer.cardsInHand.splice(cardIndex, 1)[0];
      } else {
        console.log('You can\'t play that card. Choose another one.');
      }
    }

    // Update the active card
    activeCard = chosenCard;
  }

  // Check for special cards 
  switch (activeCard.value) {
    case 'A': //Skip Card
      console.log(`${activePlayer.name} was skipped!`);
      activePlayerIndex = getNextPlayerIndex(activePlayerIndex, numPlayers);
      break;
    case 'K': //Reverse Card
      console.log('The direction of play has been reversed!');
      if (numPlayers === 2) {
        activePlayerIndex = getNextPlayerIndex(activePlayerIndex, numPlayers);
      } else {
        activePlayerIndex = getPrevPlayerIndex(activePlayerIndex, numPlayers);
      }
      break;
    case 'Q':  //Draw 2 Card
      console.log(`${activePlayer.name} must draw 2 cards!`);
      activePlayer.cardsInHand.push(deck.pop(), deck.pop());
      activePlayerIndex = getNextPlayerIndex(activePlayerIndex, numPlayers);
      break;
    case 'J':  //Draw 4 Card
      const nextPlayerIndex = getNextPlayerIndex(activePlayerIndex, numPlayers);
      players[nextPlayerIndex].cardsInHand.push(deck.pop(), deck.pop(), deck.pop(), deck.pop());
      activePlayerIndex = getNextPlayerIndex(nextPlayerIndex, numPlayers);
      break;
    default:
      activePlayerIndex = getNextPlayerIndex(activePlayerIndex, numPlayers);
  }

  // Check for winner
  if (activePlayer.cardsInHand.length === 0) {
    console.log(`\n${activePlayer.name} wins!\n`);
    process.exit(0);
  }

  //Check for Draw if Draw Pile is empty
  if(deck.length === 0){
    console.log(`\nNo Player wins. It's a Draw. !!\n`);
    process.exit(0);
  }
}

function getNextPlayerIndex(activePlayerIndex, numPlayers) {
  return (activePlayerIndex + 1) % numPlayers;
}

function getPrevPlayerIndex(activePlayerIndex, numPlayers) {
  return (activePlayerIndex + numPlayers - 1) % numPlayers;
}