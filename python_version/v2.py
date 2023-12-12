import os
import readline
import sys
import dotenv
from llamaapi import LlamaAPI
from subprocess import Popen, PIPE

# Load environment variables from .env file
dotenv.load_dotenv()

# Get API token from environment variable
api_token = os.environ.get("API_TOKEN")

# Initialize LlamaAI client
llama_api = LlamaAPI(api_token)

# Initial message to user
messages = [
    {
        "role": "system",
        "content": (
            "You are a translator between natural language and terminal commands. "
            "You are communicating with a terminal that only understands and "
            "executes commands."
            "You receive a prompt with a task. You must respond with the commands."
            " You can ONLY respond with a string of commands "
            "in sequence that are ready to be executed as is. You will respond "
            "with all the commands required to achieve the goal given. Do not "
            "number the commands, as the terminal will throw an error. If a path "
            "is not specified, always use the current directory. You must not not"
            " explain "
            "anything, as the terminal does not understand anything other than "
            "commands."
        ),
    }
]

def handle_prompt(query):
    # If user wants to quit, exit the program
    if query == "quit" or query == "exit":
        sys.exit()
    
    # Add additional information to query.
    # This is a hack to make the AI more accurate.
    query = query + ", I am on platform " + sys.platform + " and my current directory is " + os.getcwd() + ". The current process id is " + str(os.getpid()) + "."
    # Add user query to message list
    messages.append({"role": "user", "content": query})

    # Prepare API request
    api_request = {
        "messages": messages,
        "temperature": 0.3,
        "stream": False,
    }

    # Send request to LlamaAI and process response
    try:
        response = llama_api.run(api_request)
        commands = response.json()["choices"][0]["message"]["content"].split("\n")
        print(commands)
        # Execute each command and stop if one fails
        for command in commands:
            # check if contains "```" or '' and skip
            if(command.find("```") != -1 or command.find("''") != -1):
                continue
            proc = Popen(command, shell=True, stdout=PIPE, stderr=PIPE)
            stdout, stderr = proc.communicate()

            if proc.returncode != 0:
                print(f"Error: {stderr.decode('utf-8')}")
                print("Retrying...")
                # remove last message
                messages.pop()
                # send error message to llama
                handle_prompt(command + " failed with the error message : " + stderr.decode('utf-8'))
                break
            else:
                print(f"Output:\n{stdout.decode('utf-8')}")

        # If all commands succeed, find the next command
        else:
            # messages.append({"role": "assistant", "content": commands})
            # print(messages)
            find_terminal_command()
    except Exception as error:
        print(f"An error occurred: {error}")
        print(response.json())
        find_terminal_command()



def find_terminal_command():
    # Prompt user for input
    query = input("Prompt: ")
    handle_prompt(query)

# Start the conversation loop
find_terminal_command()