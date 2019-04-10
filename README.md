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

    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 9080
    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 9443

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
- [x] Content Security Policy (CSP) fixes!
- [x] Support paths and query string for routing
- [ ] Live documentation and tools
 

Currently working on..

[SSL/HTTPS demo.tektology.com](https://demo.tektology.com/)
or
[HTTP demo.tektology.com](http://demo.tektology.com/)

If debugging, use [Local Host](http://0.0.0.0:9080) 

