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



# Important
Make sure you create a `DATA` and `SECRET` folder before you try to 
run any scripts. 

    mkdir DATA
    cd DATA
    mkdir SECRET


** READ THE [README's](Notes)!  :-)




# MySQL 
Make sure you have a file called `mysql.json` in the `DATA/SECRET` folder!
Example:

    {
        "host": "127.0.0.1",
        "port": 3306,
        "user": "mydbuser",
        "password": "mypassword",
        "database": "asset-inventory"    
    }

Get and ID and PASSWORD from a system admin. Open an issue on github if need be. 



## TODO
This is quick running to do list of items that should be moved to the github issues list. 
However it would seem as only the people actually using the code are the ones doing the 
todo list. :-)

- [x] Repurpose the code
- [x] Support multiple tasks per request  
- [ ] Live documentation and tools

