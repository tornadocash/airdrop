const fs = require('fs')
const airdrop = require('../airdrop.json')
const Decimals = require('decimal.js')
Decimals.set({ precision: 50 })

const lastBlock = 11400000
const dropTotal = Decimals(500000).mul(10 ** 18)
const timeConstant = 0.0000015

const getSizeCoeff = (size) => Decimals.log10(size).plus(2)
const getBlockCoeff = (blocks) =>
  Decimals(2)
    .div(Decimals.exp(Decimals(timeConstant).mul(blocks)).plus(1))
    .minus(1)
const getAmount = (size, blocks) => getSizeCoeff(size).mul(getBlockCoeff(blocks))

let str = ''
let coeff = dropTotal.div(
  Object.values(airdrop)
    .flat()
    .reduce((acc, x) => (acc = acc.plus(getAmount(x.sizeNumber, lastBlock - x.blockNumber))), Decimals(0)),
)
let sum = Decimals(0)
for (const addr in airdrop) {
  let total = Decimals(0)
  for (const deposit of airdrop[addr]) {
    total = total.plus(getAmount(deposit.sizeNumber, lastBlock - deposit.blockNumber))
  }
  total = coeff.mul(total).floor()
  str += `${addr},${total.toFixed()}\n`
  sum = sum.plus(total)
}

console.log('Expected drop:', dropTotal.toFixed())
console.log('Total actual drop:', sum.toFixed())
fs.writeFileSync('./airdrop.csv', str)
