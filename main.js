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
        "content" : "You are a translator between natural language and terminal commands. You are communicating with a terminal that only understands and executes commands. You can ONLY respond with a string of commands in sequence that are ready to be executed as is. You will respond with all the commands required to achieve the goal given. Do not number the commands, as the terminal will throw an error. If a path is not specified, always use the current directory. Do not explain anything,as the terminal does not understand anything other than commands."
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
            "max_token": 1024
        };
        llamaAPI.runSync(apiRequest).then(response => {
            let commands = response.choices[0].message.content.split("\n");
            console.log(commands);
            executeCommands(commands);
            findTerminalCommand();
        }).catch(error => {
            executeTerminalCommand("echo 'An error occured. Can we try something else?'");
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

function executeCommands(commands){
    for(let i in commands){
        exec(commands[i], (error, stdout, stderr) => {
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
}