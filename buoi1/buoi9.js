// Khi click vào nút ĐÁP ÁN // 01 - Ẩn đi đáp án SAI // 02 Hiển thị tô đỏ đáp án ĐÙNG // 03 - Hãy thêm lời giải thích vì sao ĐÚNG
// let btnDapAn = document.getElementById('btnDapAn').addEventListener('click', (event)=> { 
    // }) 
    $(document).ready(function () { 
        $('#btnDapAn').click(function (e) { 0
            e.preventDefault() 
            e.stopPropagation() 
            // 01 - Hide the WRONG answer // JQUERRY SYNTAX = $('CSS-SELECTR').JQ() functions 
            $(".wrong-answer").fadeOut("fast"); 
            // 02 - Displays the CORRECT answer highlighted in red 
            $('.correct-answer').css('color', 'red') 
            // 03 Please add an explanation why it is TRUE 
            $('.correct-answer').append("<p style='color:black'>This is the CORRECT answer because..."); }); });
            $('#btnReset').click(function (e) { 
                e.preventDefault() 
                e.stopPropagation() 
                $(".wrong-answer" ).fadeIn( "slow" ); 
                $('.correct-answer').css('color', 'black') 
                $('.added-info').remove(); 
                 }); 
             
            let countTime= setInterval(()=>{ 
                THOI_GIAN_THI --
                 document.getElementById('count-down').innerHTML = THOI_GIAN_THI 
                 if(THOI_GIAN_THI === 0){ 
                    alert('YOU ARE TIME OUT FOR YOUR ASSIGNMENT!!!!') 
                    clearInterval(countTime); 
                } 
            },1000)