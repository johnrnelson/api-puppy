

window.AppRefs = {
    UserOptions: {

    }
};

if (localStorage) {
    const UserOptions = localStorage.getItem('UserOptions');
    if(UserOptions){
        window.AppRefs.UserOptions = UserOptions;
    }
}

console.info('App options have loaded....');