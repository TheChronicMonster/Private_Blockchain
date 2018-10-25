const SHA256 = require('crypto-js/sha256');
const leveldb = require('./level');

class Block {
    constructor(data) {
        this.hash = '',
        this.height = 0,
        this.body = data,
        this.time = 0,
        this.previousBlockHash = ''
    }
}

class Blockchain {
    // Blockchain Constructor
    constructor() {
        this.getBlockHeight().then((height) => {
            if (height === -1) {
                this.addBlock(new Block("Blockchain Initiated: Genesis Block"));
                console.log("\nGenesis Block Created");
            }
        })
    }

    // Create and add New Blocks
    addBlock(newBlock) {
        getHeightFromLevelDB(function(height) {
            // Block height
            newBlock.height = (height + 1);
            // UTC timestamp
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            // Previous Block Hash
            if (height !== -1) {
                getLevelDBData(height, function(data) {
                    newBlock.previousBlockHash = JSON.parse(data).hash;
                    // Block hash with SHA256 using newBlock and convert to string
                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                    // Store new block in database
                    addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
                    console.log("Block " + newBlock.height + " has been added to the blockchain.");
                });
            } else {
                // Block hash with SHA256 using newBlock and convert to string
                newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                // Store new block in database
                addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
            }
        });
    }

    // Get Block
    getBlock(blockHeight) {
        // Return object as string
        getLevelDBData(blockHeight, function(block) {
            console.log(JSON.parse(block));
        });
    }

    // Get Block Height V2.0 - now with promises
    getBlockHeight() {
        return new Promise((resolve, reject) => {
            let height = -1;
            db.createReadStream()
              .on('data', (data) => {
                  height++;
              })
              .on('error', () => {
                  reject(error);
              })
              .on('close', () => {
                  resolve(height);
                  console.log("\nBlock Height resolved. Current Block Height is: " +  height);
              });
        });
    }

    // Validate Block
    validateBlock(blockHeight) {
        validateLevelDBBlock(blockHeight, function(isValid) {
            if (isValid) {
                console.log('Block ' + blockHeight + ' is valid');
            } else {
                console.log('Block ' + blockHeight + ' is not valid');
            }
        });
    }

    validateChain() {
        let errorLog = [];
        let chain = [];
        let i = 0;
        db.createReadStream().on('data', function(data) {
            // Validate Block
            validateLevelDBBlock(i, function(value) {
                if (!value) {
                    errorLog.push(i);
                }
            });
            chain.push(data.value);
            i++;
        })
        .on('error', function (err) {
            console.log('Error: ', err);
        })
        .on('close', function() {
            for (var i=0; i < chain.length - 1; i++) {
                // Compare block hash
                let blockHash = JSON.parse(chain[i]).hash;
                let previousHash = JSON.parse(chain[i+1]).previousBlockHash;
                if (blockHash !== previousHash) {
                    errorLog.push(i);
                }
            }
            if (errorLog.loength > 0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: ' + errorLog);
            } else {
                console.log('Chain Valid; No errors detected');
            }
        });
    }
}

const blockchain = new Blockchain()

/* --------------------------------------- //
// Use this to generate 10 blocks       //
// --------------------------------------- */

/*

(function theLoop(i) {
    setTimeout(function() {
        let blockTest = new Block("Test Block");
        blockchain.addBlock(blockTest)
            i++;
            if (i < 10) theLoop(i);
    }, 500);
  })(0);

*/

module.exports = Blockchain