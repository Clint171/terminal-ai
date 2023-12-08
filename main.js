import dotenv from 'dotenv';

import os from 'os';

import readline from 'readline';

dotenv.config();

import LlamaAI from 'llamaai';

import { exec } from 'child_process';

const apiToken = process.env.API_TOKEN
const llamaAPI = new LlamaAI(apiToken);

const input = readline.createInterface({
    input : process.stdin,
    output: process.stdout
});

let messages = [
    {
        "role" : "system",
        "content" : "You are a smart terminal. You respond only with shell scripts to execute queries. You do not use markdown formatting."
    },
    {
        "role" : "user",
        "content" : "How can you do a greeting?"
    },
    {
        "role" : "assistant",
        "content" : "echo 'Hi, how are you?'"
    }
]


function findTerminalCommand() {
    input.question("Prompt: ", async (query) => {
        query = query + " Platform: " + os.platform();
        messages.push({
            "role" : "user",
            "content" : query
        })
        
        let apiRequest = {
            "messages": messages,
            "temperature": 0.2,
            "stream": false
        };
        llamaAPI.runSync(apiRequest).then(response => {
            let commands = response.choices[0].message.content.split("\n");
            console.log(commands);
            for(let i in commands){
                executeTerminalCommand(commands[i]);
            }
            messages.push(response.choices[0].message);
            findTerminalCommand();
        }).catch(error => {
            console.log(error);
            messages.pop();
            findTerminalCommand();
        });
    });
    
}

function executeTerminalCommand(command) {
    //execute the command on the terminal
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }

        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }

        console.log(`stdout:\n${stdout}`);
    });
}

findTerminalCommand();