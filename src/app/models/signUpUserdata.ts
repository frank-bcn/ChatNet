export class User {
    
    public username: any[] = [];
    public email: any[] = [];
    public img: any[] = [];
    public online: any[] = [];


    constructor(obj?:any) {
        this.username = obj ? obj.name : '';
        this.img = obj ? obj.img : '';
        this.email = obj ? obj.email : '';
        this.online = obj ? obj.online : false;
    }

    public toJson() {
        return {
            email: this.email,
            username: this.username,
            img: this.img,
            online:this.online,
        };
    }
}