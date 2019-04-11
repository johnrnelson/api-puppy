echo "Getting the code...."
git pull
pm2 restart all
echo "Refreshed all code and restarted the services.."