type UserInfo = {
    readonly id: number,
    username: string,
    age?: number,
    email: string
}
export class User {
    static userID: number = 0
    
    private _users: UserInfo[] = [];
    
    get users() {
        return this._users;
    }

    add(data: UserInfo){
        const datas: UserInfo = {
            id: User.userID ++,
            username: data.username,
            email: data.email
        }
        if (data.age !== undefined) {
            datas.age = data.age;
        }
        this._users.push(datas);
    }

    getOne(id: number) {
        return this._users.find(u => u.id === id);
    }

}