//01- declare function
// function : từ khóa khai báo hàm
//with height : tham so  (parmeter)
function getArea(With,height){
    return With*height
}

//goi ham 
let  result = getArea(5,6);
//ARROW FUNCTION : HAM MUI TEN
let getArea2 = (With,height) => {return With * height};

let getArea3 = function(With , height){
   return With*height;
}
//inline fuction
let getArea4 = (With,height)=>{
    return With*height;
}

    document.writeln(`<h1 style="color:red">result = ${result}</h1>`)
    document.writeln(`<h1 style="color:red">result = ${getArea2(5,10)}</h1>`)
    document.writeln(`<h1 style="color:red">result = ${getArea3(6,6)}</h1>`)
    document.writeln(`<h1 style="color:red">result = ${getArea4(3,5)}</h1>`)
//call back  function
function sayHello(fnProcesName){
let calssName = 'Nguyen Van A';
fnProcesName(calssName)//loi goi ham
}
function ProcesName(name){
    let result = name.toUpperCase()
document.write(`<h1>it23g</h1>`)
}

sayHello(ProcesName)
sayHello(Name=> {
    let result = Name.toUpperCase()
    document.writeln(`<h1>cach 2 : ${result}</h1>`)
})


let arrayNumber = [1,2,3,4,5,6,7,8,9,10]
function priintArray(array){
for(let i = 0;i<arrayNumber.length;i++){
    document.writeln(`<h2>${array[i]}</h2>`)
}
}

let resultArray = arrayNumber.filter(number => number%2 ===0)
let resultArray2 = arrayNumber.filter(function(item){
return item%2===0
})
let resultArray3 = arrayNumber.filter((item)=>{
    return item %2===0
})
 priintArray(resultArray)

 priintArray(resultArray2)
 priintArray(resultArray3)

