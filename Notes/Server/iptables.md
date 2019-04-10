# iptables

## Setup iptables
Use this to redirect lower ports to our higher port. This lets us run the service 
as a normal user instead of root.

    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 9080
    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 9443

 


If you change the tables make sure to save them again on the server. 

    sbin/iptables-save > /etc/iptables/rules.v4
