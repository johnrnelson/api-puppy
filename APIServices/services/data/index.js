/*
    The actual data service...
    
*/
const DataActions = {
    //Add the fruit...
    add(fruit, OnComplete) {
        SERVER.IN_MEM_DB.fruit.push(fruit);

        if (SERVER.IN_MEM_DB.fruit.length > 5) {
            // debugger;
            SERVER.IN_MEM_DB.fruit.shift();
        }
        const result = {
            msg: fruit,
            data: SERVER.IN_MEM_DB
        };
        OnComplete(null, result);
        SERVER.SocketBroadcast('dev',{
            TID: 0,
            service: 'data',
            msg: 'The fruit [' + fruit + '] was added!'
        });
    },
    delete(fruit, OnComplete) {

        for (let index = 0; index < SERVER.IN_MEM_DB.fruit.length; index++) {
            const fRec = SERVER.IN_MEM_DB.fruit[index];
            if (fRec == fruit) {
                SERVER.IN_MEM_DB.fruit.splice(index, 1);
                break;
            }
        }
        const result = {
            msg: fruit + ' has been removed!'
        };

        OnComplete(null, result);

        SERVER.SocketBroadcast('dev',{
            TID: 0,
            service: 'data',
            msg: 'Fruit [' + fruit + '] was deleted!'
        });
    },
    list(fruit, OnComplete) {

        const result = {
            msg: 'List all the fruits.',
            data: SERVER.IN_MEM_DB.fruit
        };
        OnComplete(null, result);

    },
    find(fruit, OnComplete) {

        const result = {
            msg: "Searching is not yet working...",
            selected: fruit,
            data: SERVER.IN_MEM_DB.fruit
        };
        OnComplete(null, result);

    },
};

function ServiceRequest(RequestObj, RequestData, OnComplete) {



    if (RequestData.action) {
        try {
            const task = DataActions[RequestData.action];
            if (!task) {
                const result = {
                    err: 'Action was not found! ' + RequestData.action,
                };
                OnComplete(result, null);

            } else {
                if (!RequestData.fruit) {
                    OnComplete({
                        err: 'no fruit specified'
                    }, null);
                    return;
                }

                var fruit = RequestData.fruit.replace(/[\W_]+/g, "");

                task(fruit, OnComplete);
            }
        } catch (errOnAction) {
            debugger;
            const result = {
                err: 'Error in Action! ',
            };

            OnComplete(null, result);
        }

    } else {
        const result = {
            err: 'No database action! We are working on this though. :-)',
            // put what you need in here to help the user debug any issues...
            debug: {
                User: RequestObj.User,
                QueryData: RequestObj.QueryData,
                QueryPath: RequestObj.QueryPath,
            },
        };


        OnComplete(null, result);        
    }



}
exports.ServiceRequest = ServiceRequest;