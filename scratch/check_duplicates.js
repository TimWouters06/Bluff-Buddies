const { NUMBER_PROMPTS } = require('./lib/prompts');

for (const mode in NUMBER_PROMPTS) {
    for (const range in NUMBER_PROMPTS[mode]) {
        const questions = NUMBER_PROMPTS[mode][range];
        const seen = new Set();
        const duplicates = [];
        for (const q of questions) {
            if (seen.has(q)) duplicates.push(q);
            seen.add(q);
        }
        if (duplicates.length > 0) {
            console.log(`Duplicate in ${mode} ${range}:`, duplicates);
        }
    }
}
