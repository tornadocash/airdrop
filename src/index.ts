import Web3 from 'web3'
import networkConfig from './networkConfig'
import { AbiItem } from 'web3-utils'
import MixerAbi from './MixerAbi.json'
import OldAbi from './Oldabi.json'
import fs from 'fs'

// const ethAddresses: { [key: string]: any } = {
//   '0.1': {},
//   '1': {},
//   '10': {},
//   '100': {},
//   'v1-eth0.1': {}
// }
const addresses: { [key: string]: {}[] } = {}
const web3 = new Web3('https://mainnet.infura.io/v3/39a7b8b9d7924f8398627a6fccb53bab')
async function main() {
  const instances = networkConfig.netId1.tokens.eth.mixerAddress
  for (const [size, address] of Object.entries(instances)) {
    let contract
    if (size === 'v1-eth0.1' || size === 'v1.1-eth0.1') {
      console.log('size')
      contract = new web3.eth.Contract(OldAbi as AbiItem[], address)
    } else {
      contract = new web3.eth.Contract(MixerAbi as AbiItem[], address)
    }

    const deposits = await contract.getPastEvents('Deposit', {
      fromBlock: 0,
      toBlock: 11400000,
    })

    console.log(`deposits ${size} ${deposits.length} `)
    let slice = 0
    if (size === '0.1') {
      slice = 956
    }
    if (size === 'v1.1-eth0.1') {
      slice = 441
    }
    for (const [i, deposit] of deposits.slice(slice).entries()) {
      const tx = await web3.eth.getTransaction(deposit.transactionHash)
      const from = tx.from.toString()
      // console.log(deposit)
      console.log(i, from, tx.hash)
      if (from === '0x8589427373D6D84E98730D7795D8f6f8731FDA16') {
        // operator
        continue
      }
      if (!addresses[from]) {
        addresses[from] = []
      }
      // count++
      let sizeNumber = Number(size) || 0.1
      addresses[from].push({ blockNumber: deposit.blockNumber, sizeNumber })
    }
    // ethAddresses[size] = addresses
  }
  console.log(addresses)
  fs.writeFileSync('./airdrop.json', JSON.stringify(addresses, null, 2))
}

main().catch(console.log)
