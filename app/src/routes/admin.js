const sleep = require('sleep')
const express = require('express')
const router = express.Router()
const chalk = require('chalk')
const accountsGeneration = require('../utils/accountsGeneration')
// const jsonParser = require('body-parser').json()

const tronWebBuilder = require('../utils/tronWebBuilder')

let testingAccounts;
let formattedTestingAccounts;


async function getBalances() {
  const tronWeb = tronWebBuilder()

  const balances = []
  for (let i = 0; i < testingAccounts.length; i++) {
    let address = tronWeb.address.fromPrivateKey(testingAccounts[i])
    balances[i] = await tronWeb.trx.getBalance(address)
  }
  return Promise.resolve(balances)
}

async function verifyAccountsBalance() {
  const tronWeb = tronWebBuilder()

  let balances = []
  let ready = 0
  console.log(chalk.gray("...\n(9) Waiting the node to mine the new accounts' transactions..."))

  while (ready < testingAccounts.length) {
    console.log(chalk.gray('Working...'))
    sleep.sleep(3);
    for (let i = 0; i < testingAccounts.length; i++) {
      if (!balances[i]) {
        let address = tronWeb.address.fromPrivateKey(testingAccounts[i])
        let balance = await tronWeb.trx.getBalance(address)
        if (balance > 0) {
          balances[i] = balance
          ready++
        }
      }
    }
  }
  return Promise.resolve(balances);
}

async function formatAccounts(balances) {
  const tronWeb = tronWebBuilder()

  formattedTestingAccounts = 'Available Accounts\n==================\n\n'
  for (let i = 0; i < testingAccounts.length; i++) {
    let address = tronWeb.address.fromPrivateKey(testingAccounts[i])
    formattedTestingAccounts += `(${i}) ${address} (${tronWeb.fromSun(balances[i])} TRX)\n`
  }
  formattedTestingAccounts += '\nPrivate Keys\n==================\n\n'
  for (let i = 0; i < testingAccounts.length; i++) {
    formattedTestingAccounts += `(${i}) ${testingAccounts[i]}\n`
  }
  return Promise.resolve()
}


router.get('/accounts', async function (req, res) {
  console.log('\n\n', chalk.green('(tools)'), chalk.bold('/admin/accounts'));
  const balances = await getBalances()
  await formatAccounts(balances)
  res.set('Content-Type', 'text/plain').send(formattedTestingAccounts);
});

router.get('/accounts-json', function (req, res) {
  console.log('\n\n', chalk.green('(tools)'), chalk.bold('/admin/accounts-json'));
  res.json(testingAccounts);
});

router.get('/accounts-generation', async function (req, res) {
  console.log('\n\n', chalk.green('(tools)'), chalk.bold('/admin/accounts-generation'));

  testingAccounts = await accountsGeneration(
      process.env.accounts
          ? parseInt(process.env.accounts, 10)
          : 10
  )
  const balances = await verifyAccountsBalance()
  await formatAccounts(balances);
  console.log(formattedTestingAccounts);
  res.send();
});

router.get('/', function (req, res) {
  res.send('Welcome to Tron Quickstart')
})


module.exports = router
