#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const fetch = require('node-fetch');

program
    .version('0.1.0')
    .description('ResilientURL CLI tool for automatically rewriting links');

program
    .command('convert')
    .option('-f, --file <path>', 'Path to the file to convert')
    .option('-d, --dir <path>', 'Path to the directory to convert')
    .action(async (options) => {
        if (!options.file && !options.dir) {
            console.error('Error: You must specify either a file or directory to convert');
            process.exit(1);
        }

        if (options.file) {
            await convertFile(options.file);
        } else if (options.dir) {
            await convertDirectory(options.dir);
        }
    });

async function convertFile(filePath) {
    try {
        console.log(`Converting links in ${filePath}...`);

        // Read the file
        const content = fs.readFileSync(filePath, 'utf8');

        // Find all URLs in the file
        const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;
        const urls = content.match(urlRegex) || [];

        if (urls.length === 0) {
            console.log('No URLs found in the file');
            return;
        }

        console.log(`Found ${urls.length} URLs in the file`);

        // Convert each URL
        let newContent = content;
        for (const url of urls) {
            try {
                // In a real implementation, this would call the ResilientURL API
                const resilientUrl = await createResilientUrl(url);
                newContent = newContent.replace(new RegExp(url, 'g'), resilientUrl);
            } catch (err) {
                console.error(`Error converting URL ${url}:`, err);
            }
        }

        // Write the new content back to the file
        fs.writeFileSync(filePath, newContent, 'utf8');

        console.log(`Successfully converted ${urls.length} URLs in ${filePath}`);
    } catch (err) {
        console.error(`Error converting file ${filePath}:`, err);
    }
}

async function convertDirectory(dirPath) {
    try {
        console.log(`Converting links in all HTML files in ${dirPath}...`);

        // Get all HTML files in the directory
        const files = fs.readdirSync(dirPath)
            .filter(file => file.endsWith('.html') || file.endsWith('.htm'))
            .map(file => path.join(dirPath, file));

        if (files.length === 0) {
            console.log('No HTML files found in the directory');
            return;
        }

        console.log(`Found ${files.length} HTML files in the directory`);

        // Convert each file
        for (const file of files) {
            await convertFile(file);
        }

        console.log(`Successfully processed ${files.length} files in ${dirPath}`);
    } catch (err) {
        console.error(`Error converting directory ${dirPath}:`, err);
    }
}

async function createResilientUrl(url) {
    // In a real implementation, this would call the ResilientURL API
    // For this mockup, we'll just return a placeholder
    console.log(`Converting ${url} to a resilient URL...`);

    // Simulate API call
    const shortCode = generateShortCode();
    const resilientUrl = `https://resilienturl.vercel.app/r/${shortCode}`;

    console.log(`Created resilient URL: ${resilientUrl}`);

    return resilientUrl;
}

function generateShortCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

program.parse(process.argv);