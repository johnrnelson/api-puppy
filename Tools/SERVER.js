/*
    Setup configs for this server...
*/


const fs = require('fs');
const path = require('path');


global.SERVER = {

    SECRET: path.join(__dirname, '../', 'SECRET'),
    OpenDB(OnOpen) {


        // Async step by step becaues it's easier to debug... They say.. :-)
        (async () => {



            try {


                SERVER.SqlData = require('../APIServer/DataManager');


                const ServerConfg = JSON.parse(fs.readFileSync(SERVER.SECRET + '/CONFIG.json', 'utf8'));

                /*
                    Open our Mysql server...
                */
                const PoolReq = await SERVER.SqlData.OpenPoolSync(ServerConfg.mysql);

                if (PoolReq.err) {
                    console.log(PoolReq.err);
                    console.log('\r\n\t ****** Check your connection to the server!');
                    process.exit();
                } else {
                    OnOpen();
                }
            } catch (errorNoSQLServer) {
                console.log('Critical Error!');
                console.log(errorNoSQLServer);
                process.exit(2);
            }

        })();


    }
};






