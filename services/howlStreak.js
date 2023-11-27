const fs = require('fs');

// In-memory storage for recent word mentions
let recentWordMentions = {};

function incrementWordCounter(filePath, word) {
    let counters = {};

    if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        counters = JSON.parse(fileContents);
    }

    counters[word] = (counters[word] || 0) + 1;
    fs.writeFileSync(filePath, JSON.stringify(counters, null, 2));
}

function handleHype(message, word) {
    const currentTime = Date.now();
    const hypeThreshold = 5; // Number of times a word must be mentioned to trigger a response
    const timeWindow = 60000; // Time window in milliseconds (e.g., 60000ms = 1 minute)

    // Initialize or update recent mentions for the word
    if (!recentWordMentions[word]) {
        recentWordMentions[word] = [];
    }
    recentWordMentions[word].push(currentTime);

    // Filter out mentions outside of the time window
    recentWordMentions[word] = recentWordMentions[word].filter(timestamp => currentTime - timestamp <= timeWindow);

    // Check if the word has been mentioned enough times to trigger a hype response
    if (recentWordMentions[word].length >= hypeThreshold) {
        message.channel.send(`${word}!`);
        // Reset the count for the word to avoid repeated responses
        recentWordMentions[word] = [];
    }
}

function handleHowlStreak(message, config) {
    config.wordsToMonitor.forEach(word => {
        if (message.content.toLowerCase().includes(word)) {
            incrementWordCounter(config.wordCounterPath, word);
            handleHype(message, word);
        }
    });
}

module.exports = { handleHowlStreak };