const fs = require('fs');
const airdrop = require('../airdrop.json');

let str = 'addr\tblock\tsize\n';
for (const addr in airdrop) {
  for (const deposit of airdrop[addr]) {
    str += `${addr}\t${deposit.blockNumber}\t${deposit.sizeNumber}\n`;
  }
}

fs.writeFileSync('./airdrop.tsv', str);
