# Token Patrol v1.0

Welcome to Token Patrol. This script helps in creating patrols for your tokens in Roll20, without having to move them manually.

### Using Token Patrol
With this script you will be able to set patrols for various tokens. Tokens will only move on the page where your player banner is located.
Tokens can move in a closed loop patrol, or backtrack previous patrol points. The length of the time between the movements can also be modified.
For a better overview, you can also toggle a visual aid.

**Please note that the save function overrides the currently saved patrol, so always load first, then set a new patrol and then save. Otherwise your previous saved patrols will be gone.**

### Basic Commands
The script uses a standardized API command syntax. All Token Patrol commands will begin with !tp. This will then be followed by a space, a double dash preceding a keyword. This looks like this:
**!tp --menu**

### Setting up Token Patrol
After installing the script and reloading the sandbox, Token Patrol will create necessary macros. For the GM the following are of interest:
**API-TP-Menu**
For easy use, I recommend showing it in your macro bar.


### Using Token Patrol
Start by using the **API-TP-Menu** macro. This will prompt a menu in the chat.

**Set Position:**
Adds a new Patrol Point for the selected Token.

**Set End Position:**
Adds an End Point for the selected Token.
This will allow a Token to walk back to all patrol points. When not used, the token will then head from the last point to the first.

**Start Patrolling:**
Starts moving the Tokens on their patrol path.

**Stop Patrolling:**
Stops the Tokens from moving.

**Set Patrol Speed:**
Prompts an Input where you can set the time between the token movement.

**Toggle Patrol Path:**
Lets you see and dismiss the patrol path for the tokens on the page. These lines are on the gmlayer.

**Clear Current Patrol Points:**
Deletes all currently recorded patrol points.

**Save Current Patrol Points:**
Saves the patrol points for later use.

**Load Patrol Points:**
Loads the patrol points that have been saved.

**Toggle Logging:**
Whispers you when a patrol point gets set or cleared. 









