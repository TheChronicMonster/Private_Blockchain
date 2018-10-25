# Private Blockchain Demo

Blockchain is changing the way that the world approaches data. In this demo I developed a simplified private blockchain, where levelDB is used to persist the blockchian dataset using the level Node.js library.

Udacity generated boilerplate code that implements a class containing attributes of a block, and a class that implements functionality that interacts with the blocks and blockchain. Udacity also provided a levelDB boilderplate to demonstrate the Data Access Layer.

Functions found in `blockchain.js` include:

  + `addBlock(newBlock)`: Adds a new block to the chain.

  + `getBlockHeight()`: Returns the blocks in the chain.

  + `getBlock(blockHeight)`: Returns a block's JSON striong object

  + `validateBlock(blockHeight)`: Validates individual block data integrity

  + `validateChain()`: Validates the entire blockchain

# Installation

1. Download or Clone repository

2. Open a terminal and cd into the local directory `Private_Blockchain`

3. `npm install`

4. `npm install crypto-js --save`

5. `npm install level --save`

# Test and play with Blockchain

1. Open a terminal and type `node` to open the REPL console

2. `.load blockchain.js`

3. A Blockchain is automatically initalized by code in `blockchain.js` 

4. Use `theLoop()` to add 10 blocks to the chain.
``` javascript
    (function theLoop (i) {
    setTimeout(function () {
        let blockTest = new Block("Test Block");
        blockchain.addBlock(blockTest)
            i++;
            if (i < 10) theLoop(i);
    }, 500);
  })(0);
  
  ```

6. Validate the blockchain to check for chain consistency

    + `blockchain.validateChain()`

7. Individual blocks can be validated with 

    + `blockchain.validateBlock(blockHeight)`

# Acknowledgements

Big thanks to Udacity classroom content, Udacity Knowledge Labs, and levelDB documentation
Check out the Blockchain Developer Nanodegree if you're interested in Blockchain development