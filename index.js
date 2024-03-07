import fs from 'fs';
import fetch from 'node-fetch';
import chalk from 'chalk';
import moment from 'moment';
import readline from 'readline';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
});

const chains = [
    { name: 'Ethereum', id: '1' },
    { name: 'Polygon', id: '137' },
    { name: 'Binance Smart Chain', id: '56' },
    { name: 'Arbitrum One', id: '42161' },
    { name: 'OP Mainnet', id: '10' },
    { name: 'Cronos Mainnet', id: '25' },
    { name: 'Klaytn', id: '8217' },
    { name: 'Gnosis', id: '100' },
    { name: 'Linea', id: '59144' }
];

const addresses = [
    { name: 'Wallet 1', address: '' }, // ISI DENGAN WALLET ADDRESS KALIAN DI BAGIAN ''
    { name: 'Wallet 2', address: '' }, // ISI DENGAN WALLET ADDRESS KALIAN DI BAGIAN ''
    { name: 'Wallet 3', address: '' }, // ISI DENGAN WALLET ADDRESS KALIAN DI BAGIAN ''
    { name: 'Wallet 4', address: '' }, // ISI DENGAN WALLET ADDRESS KALIAN DI BAGIAN ''

];

function displayList(list, title) {
    console.log(chalk.bold.underline(`${title}:`));
    list.forEach((item, index) => {
        console.log(`  ${chalk.cyan(index + 1)}. ${chalk.greenBright(item.name || '')} - ${chalk.yellowBright(item.address)}`);
    });
    console.log(); // Memberikan jarak setelah list
}

function askForChoice(list, title) {
    return new Promise((resolve) => {
        displayList(list, title);
        rl.question(`Pilih ${title} : `, (choice) => {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < list.length) {
                resolve(list[index]);
            } else {
                console.log('Pilihan tidak valid. Silakan coba lagi.');
                resolve(askForChoice(list, title));
            }
        });
    });
}

function askToContinueViewing() {
    return new Promise((resolve) => {
        setTimeout(() => {
            rl.question('Apakah Anda ingin melihat wallet lain? (y/n): ', (choice) => {
                resolve(choice);
            });
        }, 2000); // Delay selama 2 detik sebelum pertanyaan muncul
    });
}

async function main() {
    let continueViewing = true;

    while (continueViewing) {
        const selectedChain = await askForChoice(chains, 'NETWORK');
        const selectedAddress = await askForChoice(addresses, 'WALLET');

        const apiUrl = `https://api.chainbase.online/v1/account/tokens?chain_id=${selectedChain.id}&address=${selectedAddress.address}&limit=50&page=1`;

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-api-key': 'demo',
                'accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                const tokens = data.data;

                if (!tokens || tokens.length === 0) {
                    console.log((`[${moment().format('HH:mm:ss')}] Tidak ada token pada alamat : ${chalk.greenBright(selectedAddress.address)} ${chalk.yellowBright(selectedAddress.name || 'Wallet')}\n`));
                    return;
                }

                tokens.forEach(token => {
                    const originalLength = token.balance.length;
                    const balanceDecimal = parseInt(token.balance, 16);
                    token.balance = balanceDecimal / 100;
                    const formattedBalance = token.balance.toFixed(originalLength - 1);

                    const formattedDate = `[${moment().format('HH:mm:ss')}]`;

                    console.log(`
${chalk.whiteBright(formattedDate)} Token: ${chalk.greenBright(token.name)} (${chalk.yellowBright(token.symbol)})
${chalk.whiteBright(formattedDate)} Balance: ${chalk.greenBright(formattedBalance)}
${chalk.whiteBright(formattedDate)} Contract Address: ${chalk.greenBright(token.contract_address)}
${chalk.whiteBright(formattedDate)} Current USD Price: ${chalk.greenBright(token.current_usd_price)}
${chalk.whiteBright(formattedDate)} Decimals: ${chalk.greenBright(token.symbol)}
${chalk.whiteBright(formattedDate)} Wallet Address: ${chalk.greenBright(selectedAddress.address)} (${chalk.yellowBright(selectedAddress.name || 'Wallet')})

${'-'.repeat(60)}\n`);
                });
            })
            .catch(error => console.error(error));

        const response = await askToContinueViewing();
        continueViewing = response.toLowerCase() === 'y';
    }

    rl.close();
}

main();