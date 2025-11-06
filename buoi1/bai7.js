//dịnh vị các thẻ html
let soThu1 = document.getElementById('so-thu-1')
let soThu2 = document.getElementById('so-thu-2')

let btnAdd = document.getElementById('btn-add')
let btnSup = document.getElementById('btn-sup')
let operator = document.getElementById('btn-phep-toan')

let ketQua = document.getElementById('ket-qua')
let btnKetQua = document.getElementById('btn-ket-qua')


//bắt sự kiện click
btnAdd.addEventListener('click', function() {
  operator.value = '+'
})
btnSup.addEventListener('click', function() {
  operator.value = '-'
})
    btnKetQua.addEventListener('click',()=>{
        if(operator.value === '+'){
            ketQua.value = Number(soThu1.value) + Number(soThu2.value)
        }
        if(operator.value === '-'){
            ketQua.value = Number(soThu1.value) - Number(soThu2.value)
        }
        })
//         document.getElementById('btn-swap').addEventListener('click',()=>{
// let temp = soThu1.value
// soThu1.value =soThu2.value
// soThu2.value=temp
// })