//let la tu khoa de khi bao bien
//class name :ten bien
//'it23g' :chuoi
let classname = 'it23g'
//document : doi tuong dung de thao tac voi dom,dc tao san
//. :toán tử truy cập thuộc tính và phương thức của dối tượng
//writeln()
//`${ten bien}` :String template
document.writeln(`<h1>xin chao cac ban lop ${classname}!!!</h1>`)
//function : từ khóa trong js , định nghĩa 1 hàm
//sayhello : tên hàm
//mesenger : tham số của hàm say hello
function sayhello(mesenger){
    document.writeln(`<h1 style="color:red">xin chao cac ban lop ${mesenger}!!!</h1>`)
}
//gọi hàm  sayhello và truyền tham số 'it23a'
sayhello('it23a')
//gọi hàm  sayhello và truyền tham số 'it23b'
sayhello('it23b')
//gọi hàm  sayhello và truyền tham số 'it23c'
sayhello('it23c')