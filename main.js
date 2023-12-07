import dotenv from 'dotenv';

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

function findTerminalCommand() {
    //ask the ai the command to execute a terminal function
    //return the command
    input.question("Prompt: ", async (query) => {
        
        let apiRequest = {
            "messages": [
                {
                    "role" : "system",
                    "content" : "You are a computer expert. You want to respond to prompts with the commands required to complete the task. You are given a prompt witn a task. You must respond with the command to complete the task."
                },
                {
                    "role": "user",
                    "content": query
                }
            ],
            "functions": [
                {
                    "name": "find_terminal_command",
                    "description": "Get the command to execute a terminal function. Return only the command.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "action": {
                                "title": "action",
                                "type": "string",
                                "description": "The action to perform on the terminal, e.g. make a directory, remove a file, etc."
                            },
                            "target": {
                                "title": "target",
                                "type": "string",
                                "description": "The target of the action, e.g. the name of the directory to make, the name of the file to remove, etc."
                            },
                            "platform": {
                                "title": "platform",
                                "type": "string",
                                "description": "The platform to execute the command on, e.g. Mac, Linux, Windows, etc."
                            }
                        }
                    },
                    "required": [
                        "action",
                        "target",
                        "platform"
                    ]
                }
            ],
            "temperature": 1.0,
            "stream": false,
            "function_call": {"name" : "find_terminal_command"}
        };
        llamaAPI.runSync(apiRequest).then(response => {
            let choices = response.choices;
            let command = choices[0].message;
            console.log(command);
            if(!command.function_call.arguments.action){
                console.log("No action found.");
                findTerminalCommand();
                return;
            }
            if(!command.function_call.arguments.target){
                console.log("No target found. Executing without target.");
                console.log(command.function_call.arguments.action);
                executeTerminalCommand(command.function_call.arguments.action);
                findTerminalCommand();
                return;
            }
            else{
                console.log(command.function_call.arguments.action + " " + command.function_call.arguments.target);
                executeTerminalCommand(command.function_call.arguments.action + " " + command.function_call.arguments.target);
                findTerminalCommand();
            }
            // executeTerminalCommand(command.arguments.action + " " + command.arguments.target);
        }).catch(error => {
            console.log(error);
            findTerminalCommand();
        });
    });
    
}
findTerminalCommand();

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