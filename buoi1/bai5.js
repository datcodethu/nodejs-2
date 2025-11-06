let students = [ 
    { 
        name: "John", 
        age: 20, 
        mark: 8.0 
    }, 
    { 
        name: "Anna", 
        age: 20, 
        mark: 9.0 
    }, 
    { 
        name: "Peter", 
        age: 20, 
        mark: 10.0 
    },
    {showinfo(){
        document.writeln(`sinh vien : ${this.name} ,tuoi: ${this.age} co so diem: ${this.mark}`)
    }},{
        max:function(x,y){return x>y?x:y},
        min:function(x,y){return this.max(x,y)==x?y:x}
    }
];
students[3].showinfo();
console.log("So diem cua sinh vien dao tao nhat la: ", students[2].min(students[0].mark,students[1].mark));
    

for(let i = 0; i < students.length ;i++){
    students[i].showinfo()
}
//Cho mảng student 
// Viết phương thức in  
// Tìm sinh viên có điểm (mark) cao nhất 
// Lọc ra danh sách sinh viên có điểm lớn hơn 5.0