let liststudent = [
    {
        name: "Nguyen Van A",
        mark : 8.0,
        showInfo : function() {
            document.writeln(`<h3>${this.name} co ${this.mark}</h3>`)
        }
    },
    {
        name: "Le Thi C",
        mark: 10.0,
        showInfo : function() {
            document.writeln(`<h3> ${this.name} co ${this.mark}</h3>`)
        }
    }
]

function findMax(liststudent) {
    let Maxstudent = liststudent[0]
    liststudent.forEach(element => {
        if(element.mark > Maxstudent.mark) {
            Maxstudent = element
        }
    });
    return Maxstudent
}

function listGreaterThan8(liststudent) {
    let result = []
    for(let i =0; i < liststudent.length;i++){
        if(liststudent[i].mark >=8){
            result.push(liststudent[i])
        }
    }
    return result
}
function listGreaterThan8(listStudents){ 
    if(listStudents[i].mark >=8) { 
        result.push(listStudents[i]) 
    } return result
}



let maxStudent = findMax(liststudent) 
maxStudent.showInfo()
  



 // Lấy ra danh sách những bạn từ 8 điểm trở lên để tặng học bổng 
 let result = listGreaterThan8(liststudent) 
 result.forEach(element=>{
        document.writeln(`<h3 style="color:blue">${element.name} co diem la ${element.mark}</h3>`)
        })
        let result2 = liststudent.filter((student)=>{ 
            return student.mark >= 8.0 
        }) 
        result2.forEach(element=>{ 
            document.writeln(`<h3 style="color:green">${element.name} có diem la: ${element.mark}</h3>`) 
    })
    function sortStudent(){ 
        for(let i=0;i<liststudent.length-1;i++){ 
            for(let j=i+1;j<liststudent.length;j++){ 
                if(liststudent[i].mark < liststudent[j].mark){ 
                let trungGian =liststudent[i] 
                liststudent[i] = liststudent[j] 
                liststudent[j] = trungGian 
                document.writeln(`*****************`) 
                liststudent.forEach(element =>{ 
                    document.writeln(`<h3 style="color:black">${element.name} có diem la: ${element.mark}</h3>`) 
                })
                    document.writeln(`******************`)
            }
         }
         }
        }
        //sortStudent()
        liststudent.sort((a, b) => {
            return b.mark - a.mark;
        })
        liststudent.forEach(element=>{
            document.writeln(`<h3 style="color:black">${element.name} có diem la: ${element.mark}</h3>`)
        })
        function convertMark(){ 
            let resultArray = [] 
            for(let i=0;i< listStudents.length;i++){ 
                let newStudent = listStudents[i] 
                const markOfStudent = newStudent.mark 
                if(markOfStudent>=8.0 && markOfStudent<=10){ 
                    newStudent.mark='A' 
                }
                else if(mark0fStudent<4){ 
                    newStudent.mark='F' }
                    else if(markOfStudent>=4 && markOfStudent<5.5){ 
                        newStudent.mark='D' }
                        else if(markOfStudent>=5.5 && markOfStudent<7) { 
                            newStudent.mark='C' }else{ newStudent.mark='B'} 
                            resultArray.push(newStudent) 
                        }
                        return resultArray 
                    }
                    let result4 = listStudents.map((student)=>{ 
                        const markOfStudent = student.mark 
                        if(markOfStudent>=8.0 && mark0fStudent<=10){ 
                            student.mark='A' 
                        }else if(markOfStudent<4){ student.mark='F' 
                    }else if(markOfStudent>=4 && mark0fStudent<5.5){ 
                        student.mark='D' 
                    }else if(markOfStudent>=5.5 && mark0fStudent<7) { 
                        student.mark='C' 
                    }else{ student.mark='B' 
                } return student 
            }) 
            result4.forEach(element=>{ 
                document.writeln(`<h3 style="color:red">${element.name} có diem la: ${element.mark}</h3>`) })
// function showInfo(liststudent) {
//     liststudent.forEach(element => {
//         element.showInfo()
//     });
// }

// let Maxstudent = findMax(liststudent)
// document.writeln(`<h3>${Maxstudent.name} co ${Maxstudent.mark}</h3>`)

// let listGreaterThan8 = listGreaterThan8(liststudent)

// showInfo(listGreaterThan8)