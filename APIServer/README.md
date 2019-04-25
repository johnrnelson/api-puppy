# API Server
This provides the API and it's HTML UI for the debug helper.

Use `APIServer/debug/API_HELP.json` file to edit the list of services for the HTML client.
 

Use PM2 or something like that on a production server. :-)

## Adding New Services
The `services` folder is where you put your new folder that is, in fact, your service. An
easy way to get started is to just copy the `default` folder and start from there.