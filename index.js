#!/usr/bin/env node

const Runner = require('./runner');
const runner = new Runner();

// Return all files inside a directory
const run = async () => {
    // collect that files in runner.js
     await runner.collectFiles(process.cwd());
    // run the execution of these files
     runner.runTests();
    
};

run();

