var hotel = {

    name: 'quay',
    rooms: 40,
    booked: 25,
    gym: true,
    roomTypes : ['twin','double','suite'],
    checkAvailability : function() {
        return this.rooms - this.booked;
    },

    showInfo: function() {
    document.writeln(`<h1> khach san: ${this.name} co : ${this.rooms} phong</h1>`)
}
}
hotel.showInfo()
hotel.showInfo()
// dung tu khoa class
class Hotel {
    constructor(name, rooms, booked, gym, roomTypes) {
        this.name = name
        this.rooms =  rooms
        this.booked = booked
        this.gym = gym
        this.roomTypes = roomTypes
    }

    checkAvailability(){
        return this.rooms - this.booked
    }
     ShowInfo() {
        document.writeln(`<h1 style= 'color:red'> khach san: ${this.name} co: ${this.rooms} phong</h1>`)
    }
}
let hotelHAGL1 = new Hotel ('HAGL1', 400, 200, true, ['twin', 'double', 'suite', 'single'])
hotelHAGL1.ShowInfo()
hotelHAGL2.ShowInfo()
let arrayHotel2 = [
    {
        name: 'quay1',
    rooms: 40,
    booked: 25,
    gym: true,
    roomTypes : ['twin','double','suite'],
    checkAvailability : function() {
        return this.room - this.booked;
    },

    showInfo: function() {
    document.writeln(`<h1> khach san: ${this.name} co : ${this.rooms} phong</h1>`)
}
    },
    {
        name: 'quay2',
    rooms: 40,
    booked: 25,
    gym: true,
    roomTypes : ['twin','double','suite'],
    checkAvailability : function() {
        return this.room - this.booked;
    },

    showInfo: function() {
    document.writeln(`<h1> khach san: ${this.name} co : ${this.rooms} phong</h1>`)
}
    }
]

for(let i = 0; i < arrayHotel2.length; i++) {
    arrayHotel2[i].showInfo()
}
arrayHotel2.forEach(Hotel=>{
    hotel.showInfo()
})
class Owner {
    constructor(name,age){
       this.name = name
       this.age = age
    }
    showInfo(){
        document.writeln(`<h1>: ${this.name} co: ${this.age}</h1>`)
    }
}
class Hotel1 {
    constructor(name, rooms, booked, gym, roomTypes, Owner) {
        this.Owner = Owner
        this.name = name
        this.rooms =  rooms
        this.booked = booked
        this.gym = gym
        this.roomTypes = roomTypes 
    }

    checkAvailability(){
        return this.rooms - this.booked
    }
     showInfo() {
        document.writeln(`<h1 style='color:pink'>khach san: ${this.name} co: ${this.rooms} phong, CSH: ${this.Owner.name}</h1>`)
    }
}

let mrDuc = new Owner('Duc', 40)
let hotelHAGL3 = new Hotel1 ('HAGL1', 400, 200, true, ['twin', 'double', 'suite', 'single'], mrDuc)
let hotelHAGL4 = new Hotel1 ('HAGL1', 400, 200, true, ['twin', 'double', 'suite', 'single'], mrDuc)

hotelHAGL3.showInfo()
hotelHAGL4.showInfo()
const user = {
id:42,
is_verified:true
};
const {id, is_verified} = user;
console.log(user); // { id: 42, is_verified: true }
console.log(id); // 42
console.log(is_verified); // true
