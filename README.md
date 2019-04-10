# api-puppy
Can we do better?

Break our your favorite editor to write some code in your favorite language on your 
favorite platform.

 
- [Important](#important) 
- [Installing](Notes/installing.md) 
- [Notes](Notes)
- [Tools](Tools) 
- [Helpful Links](Notes/links.md)


 
An important note is the short list of vendor modules and libraries. It's easy 
to slap on another NPM but before you do, please consider it. Lets keep 
this project as clean and close to the metal as possible. 



# Clone The Project
Make sure you setup your SSH correctly!

    git clone git@github.com:johnrnelson/api-puppy


# Setup iptables
Use this to redirect lower ports to our higher port. This lets us run the service 
as a normal user instead of root.

    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 9118
    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 9118

now to make the changes persist.

    sudo iptables-save > /etc/iptables.conf


If you change the tables make sure to save them again on the server. 

    sbin/iptables-save > /etc/iptables/rules.v4

    



# PM2

    pm2 start APIServer.js --name api-puppy


## TODO
This is quick running to do list of items that should be moved to the github issues list. 
However it would seem as only the people actually using the code are the ones doing the 
todo list. :-)

- [x] Support multiple tasks per request  
- [ ] Live documentation and tools
- [ ] Support paths and query string for routing
- [ ] Content Security Policy (CSP) fixes!
 

CORB
Guess there is work to be done to fix this...


    CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

Another day...
For now remove it since it causes errors..