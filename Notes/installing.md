# Quick Install Instructions
Clone the project to a new folder.

    git clone git@github.com:johnrnelson/api-puppy.git
    cd api-puppy

Install the NPM(s). There is only one. Check the `package.json` file. :smiley:

    npm update

Now run the SETUP if this is your first time.

    node ./SETUP.js

Take notice of how small the `package.json` is and how simple things can be. 


## Production Server Setup
Setup [iptables](Server/iptables.md) to make sure the lower ports will
work with the higher ports set in the scripts. Otherwise you have to put 
the ports you want to use in the URI.  
 
## Running the HTTP/S API Server
Read about the [APIServer](../APIServer/README.md) or check out
the [Source Code](../APIServer/APIServer.js) 
