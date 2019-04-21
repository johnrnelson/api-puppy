# Installing
Clone the repo and use npm to install all the packages you need.
 
    npm update

Take notice of how small the `package.json` is and how simple things can be. 

## Production Server Setup
Setup [iptables](Server/iptables.md) to make sure the lower ports will
work with the higher ports set in the scripts. Otherwise you have to put 
the ports you want to use in the URI.  
 
## Running the HTTP/S API Server
Read about the [APIServer](../APIServer/README.md) or check out
the [Source Code](../APIServer/APIServer.js) 
