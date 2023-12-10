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
        "content" : "You are a translator between natural language and terminal commands. You are communicating with a terminal that only understands and executes commands. You can ONLY respond with a string of commands in sequence that are ready to be executed as is. You will respond with all the commands required to achieve the goal given. Do not number the commands, as the terminal will throw an error."
    }
]


function findTerminalCommand() {
    input.question("Prompt: ", async (query) => {
        query = query + " on platform " + os.platform();
        let qmessages = messages
        qmessages.push({
            "role" : "user",
            "content" : query
        })
        
        let apiRequest = {
            "messages": qmessages,
            "temperature": 0.8,
            "stream": false,
            "max_tokens": 1024
        };
        llamaAPI.runSync(apiRequest).then(response => {
            let commands = response.choices[0].message.content.split("\n");
            console.log(commands);
            for(let i in commands){
                if(commands[i] == '```' || commands[i] == ''){
                    continue;
                }
                executeTerminalCommand(commands[i]);
            }
            findTerminalCommand();
        }).catch(error => {
            if (error.status == 422) {
                executeTerminalCommand("echo 'An error occured. Can we try something else?'");
            }
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