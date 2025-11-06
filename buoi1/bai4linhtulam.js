//một thuộc tính ko có phương thức vẫn chạy đc
var hotel = {
    name: 'quay',
    rooms: 40,
    booked: 25,
    gym: true,
    roomtypes: ['twin', 'double', 'suite'],
    showInfo: function () {
        document.writeln(`<h1>khach san: ${this.name} co : ${this.rooms} phong</h1>`);
    }

}

hotel.showInfo();
hotel2.showInfo();
class hotel {
    constructor(Name, rooms, booked, gym, roomType) {
        this.name = Name
        this.rooms = rooms
        this.booked = booked
        this.gym = gym
        this.roomType = roomType


    }
    checkAvailability() {
        return this.room - this.booked;
    }
}
hotelHAGL1.showInfo()
hotelHAGL2.showInfo()
let hotel2 = {}
hotel.showinfo()
hotel2.showInfo()

let arrayHotel1 = [hotelHAGL1,
    hotelHAGL2,
    new Hotel('HAGL3', 400, 200, true, ['twin', 'double', 'suite', 'single']),
]
let arrayHotel2 = [
    {
        name: "Quay1",
        rooms: 40,
        booked: 25,
        gym: true,
        roomType: ['twin', 'double', 'suite'],
        checkAvailability: function () { return this.rooms - this.booked },
        showInfo: function () {
            document.writeln(`<h1>Khach san: ${this.name} có: ${this.rooms} phong</h1>`)
        }

    },
    {
        name: "Quay2",
        rooms: 40,
        booked: 25,
        gym: true,
        roomType: ['twin', 'double', 'suite'],
        checkAvailability: function () { return this.rooms - this.booked },
        showInfo: function () {
            document.writeln(`<h1>Khach san: ${this.name} có: ${this.rooms} phong</h1>`)
        }
    }
]
for (let i = 0; i < arrayHotell.length; i++) { arrayHotell[i].showInfo() } arrayHotel2.forEach(() => { hotel2.showInfo() });

class Owner{ constructor (name, age) { this.name = name 
    this.age = age
 } showInfo(){ 
    document.writeln(`<h1>: ${this.name} cơ: ${this.age}</h1>`) 
}
 } 
 class Hotel { constructor(name, rooms, booked, gym, roomType, owner) 
    { this.owner = owner 
        this.name = name 
        this.rooms = rooms 
        this.booked = booked 
        this.gym = gym 
        this.roomType= roomType }
         checkAvailability(){ return this.rooms -this.booked }
          showInfo(){ 
            document.writeln(`<h1 style='color: red'>Khach san: ${this.name} có: ${this.rooms} phong, CSH: ${this.owner.name}</h1>`) } } 
            let mrDuc = new Owner('Duc', 40) 
            let hotelHAGL1 = new Hotel('HAGL1', 400, 200, true, ['twin', 'double', 'suite', 'single'], mrDuc) 
            let hotelHAGL2 = new Hotel('HAGL2', 300, 250, true, ['twin', 'double', 'suite', 'single'], mrDuc) 
// hotelHAGL1.showInfo() 
// hotelHAGL2.showInfo()
// mảng các đối tượng