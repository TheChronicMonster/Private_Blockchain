const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// LevelDB to hold persistent blockchain data

// Get block height from LevelDB
function getHeightFromLevelDB(callback) {
    let i = 0;
    db.createReadStream().on('data', function(data) {
        i++;
    }).on('error', function(err) {
        console.log('Error found: ', err);
    }).on('close', function() {
        callback(i - 1);
    });
}

// Add data to levelDB with key/value pair
function addLevelDBData(key, value) {
    db.put(key, value, function(err) {
        if (err) return console.log('Block ' + key + ' submission failed', err);
    });
}

// Validate block in levelDB
function validateLevelDBBlock(key, callback) {
    getLevelDBData(key, function(value) {
        // Get block object
        let block = JSON.parse(value);
        // Get block hash
        let blockHash = block.hash;
        // Remove block hash to test block integrity
        block.hash = '';
        // Generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            callback(true);
        } else {
            callback(false);
            console.log('Block # ' + key + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        }
    });
}

// Get data from levelDB with key
function getLevelDBData(key, callback) {
    db.get(key, function(err, value) {
        if (err) {
            return console.log('Not found ', err);
        }
        callback(value);
    });
}

/* End levelDB architecture */
// ------------------------ //
/*  Begin Blockchain logic  */

// Block Class holding Block constructor
class Block {
    constructor(data) {
        this.hash = '',
        this.height = 0,
        this.body = data,
        this.time = 0,
        this.previousBlockHash = ''
    }
}

// Blockchain Class
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

    // Get Block Height
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
                  console.log("Current Block Height is: " +  height);
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

    // Validate entire Blockchain
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