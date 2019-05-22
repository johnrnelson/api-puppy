/*
    User wants to listen to a broadcasted event with a given topic..
*/

function HandleEvent(WebSocket,SocketData){

    // debugger;
    if(!WebSocket.User.Topics){
        WebSocket.User.Topics = [];
    }else{
        WebSocket.User.Topics.length = 0;
    }
    
    const AllTopics = SocketData.topics.split(",");

    for (let index = 0; index < AllTopics.length; index++) {
        const element = AllTopics[index];

        WebSocket.User.Topics.push(element);
        
    } 

    WebSocket.send(JSON.stringify({
        TID: SocketData.TID,
        // err: 'Join Events not working.. YET!'
        Topics:WebSocket.User.Topics
    }));
}

exports.HandleEvent=HandleEvent;