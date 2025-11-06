let i =10
let j = 20

j=++i
//j=i++
//j=? i =?
function kq(a,b){
    let kq = a+b;
    return kq;
}
let c = sum(2,3)
sum(2,3)
console.log('ket qua la:')
console.log(c)
// //=: lệnh gán
// //==: so sánh bằng
// //===: so sách cùng kiểu dữ liệu

let number = 10
let strnumber = "10"
// //nếu khác kdl thì == đổi vè cùng kiểu rồi so sánh
// ///===: nếu khác kdl thì cho sai
if(number == strnumber){
    alert('equa!!!')

} else{
    alert('notequa')
}
//lệnh if trả về sai khi gặp các giá trị
//false,0,null,underfined,"",NaN
//viết hàm tính tỉ số BMI
//biết rằng , BMI = chiều cao/(cân nặng bình phương)
// // Hàm tính chỉ số BMI  
function tinhBMI(canNang, chieuCao) {
    // Chuyển chiều cao từ cm sang mét
    const chieuCaoM = chieuCao / 100;
    
//     // Tính chỉ số BMI
    const bmi = canNang / (chieuCaoM * chieuCaoM);
    
//     // Trả về kết quả
    return bmi;
}

// // Nhập cân nặng và chiều cao từ người dùng
const canNangKg = parseFloat(prompt("Nhập cân nặng của bạn (kg):"));
const chieuCaoCm = parseFloat(prompt("Nhập chiều cao của bạn (cm):"));

// // Tính chỉ số BMI
const bmi = tinhBMI(canNangKg, chieuCaoCm);

// // In kết quả
console.log(`Chỉ số BMI của bạn là: ${bmi.toFixed(2)}`);
function tinhBMI(cannang,chieucao) {
    let BMI = cannang/(chieucao*chieucao)
    return BMI
}
let cannang = 90
let chieucao = 1.72
let yourBMI = tinhchisoBMI(chieucao,cannang)
if(yourBMI<18.5){
    document.writeln(`<h1> chieu cao ${chieucao},can nang ${cannang} ==> cow thể bạn gầy</h1>`)
}else if(yourBMI>=18.5 && yourBMI<=24.9){
    document.writeln(`<h1> chieu cao ${chieucao},can nang ${cannang}.==> bình thường </h1>`)
}else if(yourBMI>=25.0){
    document.writeln(`<h1> chieu cao ${chieucao},can nang ${cannang}.==> cơ thể bạn thừa cân </h1>`)

}

//vòng lặp for
//liệt kê các số chẵn từ 1 đến 30 ,với n nhạp vào
function kiemtrasochan(n){
    if (n%2 === 0) { 
        return true 
    }  
    return false

}
function kiemtrasochiahetcho3(n){
    if(n%3 === 0){
        return true
    }  
    return false 
 } 
 for(let i = 0;i<=30;i++) {
    if(kiemtrasochiahetcho3(i)){
        document.writeln(`<h3 style="color:red">${i} la so chia het cho 3 !!!</h3>`)
 }
 }
 let PIN = 1234
 let PIN1 = 1
 let PIN2 = 2
 let PIN3 = 3
 let PIN4 = 4
 function checkPIN(){ 
    for(let i=0;i<=9;i++) 
    for(let j=0;j<=9;j++) 
          for(let k=0;k<=9;k++) 
        for(h=0;h<=9;h++){ 
    if(i===PIN1 && j===PIN2 && k===PIN3 && h ===PIN4){ 
        document.writeln(`<h1 style='color:red'>Ma PIN = ${i} ${j} ${k} ${h}</h1>`)
         return 
    }else{ 
        document.writeln(`<h1>NON-LAM PIN = ${i} ${j} ${k} ${h}</h1>`) }
    }}
