const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const render = require('./render');


// This how to exclude certain directories from testing
const forbiddenDirs = ['node_modules'];

class Runner {
    constructor() {
        this.testFiles = [];
    }
    // After getting a full list of the test files, execute them one by one 
    async runTests() {
        for (let file of this.testFiles) {
            console.log(chalk.blue(`---- ${file.shorName}`));
            // same as "it"
            const beforeEaches = [];
            global.render = render;
            global.beforeEach = (fn) => {
                beforeEaches.push(fn)
            };
            // "it" here it defined in the global scope of the browser and 
            global.it = async (desc, fn) => {
                beforeEaches.forEach(func => func());
                try {
                    await fn();
                    console.log(chalk.green(`\tOK-${desc}`));
                } catch (err) {
                    const message = err.message.replace(/\n/g, '\n\t\t');
                    console.log(chalk.red(`\tX-${desc}`));
                    console.log(chalk.red('\t', message));
                }
            };
            try {
                require(file.name);
            } catch (err) {
                console.log(chalk.red(err));
            }
        };
    }

    // Find and Collect all files inside a directory
    async collectFiles(targetPath) {
        const files = await fs.promises.readdir(targetPath);
        // Check inside the directory if is it file that ".test.js" or a folder
        for (let file of files) {
            const filePath = path.join(targetPath, file);
            const stats = await fs.promises.lstat(filePath);

            if (stats.isFile() && file.includes('.test.js')) {
                this.testFiles.push({ name: filePath, shorName: file });
            } else if (stats.isDirectory() && !forbiddenDirs.includes(file)) {
                const childFiles = await fs.promises.readdir(filePath);

                // Store a reference to each file we find
                files.push(...childFiles.map(f => path.join(file, f)));
            }
        }
    }

}

module.exports = Runner;