# Installing
Clone the repo and use npm to install all the packages you need.
 
    npm update


The list of NPMs grows so check the `package.json` file for what 
is actually used.

Setup [iptables](Server/iptables.md) to make sure the lower ports will
work with the higher ports set in the scripts.



## Running
Go to the `APIServer` folder and run the `APIServer.js` script. 

    cd APIServer
    ./APIServer.js
or
    cd APIServer
    node APIServer.js

Use PM2 or something like that on a production server. :-)