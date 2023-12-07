import dotenv from 'dotenv';

dotenv.config();

import LlamaAI from 'llamaai';

const apiToken = process.env.API_TOKEN
const llamaAPI = new LlamaAI(apiToken);
 
function findTerminalCommand(query) {
    //ask the ai the command to execute a terminal function
    //return the command
    let apiRequest = {
        "messages": [
            {"role": "user", "content": query},
        ],
        "functions": [
            {
                "name": "find_terminal_command",
                "description": "Get the command to execute a terminal function. Return only the command.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "action": {
                            "type": "string",
                            "description": "The action to perform on the terminal, e.g. make a directory, remove a file, etc.",
                        },
                        "target": {
                            "type": "string",
                            "description": "The target of the action, e.g. the name of the directory to make, the name of the file to remove, etc.",
                        },
                        "platform": {
                            "type": "string",
                            "description": "The platform to execute the command on, e.g. Mac, Linux, Windows, etc.",
                        },
                    },
                },
                "required": ["action", "target", "platform"],
            }
        ],
        "stream": false,
        "function_call": "find_terminal_command",
    };
    llamaAPI.run(apiRequest).then(response => {
        let choices = response.choices;
        let command = choices[0].message.content;
        return command;
    }).catch(error => {
        console.log(error);
    });
}

let makeDirCommand = findTerminalCommand("make a directory called 'test' on Linux");

console.log(makeDirCommand);