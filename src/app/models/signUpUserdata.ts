export class User {
  public uid: string;
  public username: string;
  public email: string;
  public img: string;
  public online: boolean;
  

  constructor(obj?: any) {
    this.uid = obj ? obj.uid : '';
    this.username = obj ? obj.username : '';
    this.img = obj ? obj.img : '';
    this.email = obj ? obj.email : '';
    this.online = obj ? obj.online : false;
  }

  public toJson() {
    return {
      uid: this.uid,
      email: this.email,
      username: this.username,
      img: this.img,
      online: this.online,  
    };
  }
}
