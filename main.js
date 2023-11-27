const fs = require('fs');
const readline = require('readline');
const { Client, GatewayIntentBits } = require('discord.js');
const { handleHowlStreak } = require('./services/howlStreak');

const configFilePath = 'config.json';

function promptForConfig() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your bot token: ', (token) => {
        rl.question('Enter words to monitor (comma-separated, e.g., howl,meow,bark): ', (words) => {
            const config = {
                token: token,
                wordsToMonitor: words.split(',').map(word => word.trim()),
                counterFilePath: 'wordCounter.json' // Default path, can be changed if needed
            };
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
            console.log('Config file created.');
            rl.close();
            startBot(config);
        });
    });
}

function initializeConfig() {
    if (!fs.existsSync(configFilePath)) {
        console.log('Config file not found. Please enter the following details:');
        promptForConfig();
        return null;
    }

    let config = JSON.parse(fs.readFileSync(configFilePath));
    if (!config.token || !config.wordsToMonitor || !config.counterFilePath) {
        console.log('Config file is incomplete. Please enter the following details:');
        promptForConfig();
        return null;
    }

    return config;
}

const config = initializeConfig();
if (config) {
    startBot(config);
}

function startBot(config) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

    client.once('ready', () => {
        console.log('Bot is ready!');
    });

    client.on('messageCreate', message => {
        handleHowlStreak(message, config);
    });

    client.login(config.token);
}