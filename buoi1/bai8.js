// console.log('01. egin') 
// setTimeout(()=> { 
//     console.log('Do 1'); 
// }, 1000); 
// setInterval(()=> { 
//     console.log('Do 2'); 
// }, 2000); 
// console.log('02. End')

// let cleanRoom = false 
// let promiseCleanRoom = new Promise((resolve, reject)=>{ 
//     if(cleanRoom) { 
//         resolve('Clean you can go play football') 
//     }else{ 
//         reject('Must go laundry !!!') 
//     } 
// }) 
// console.log('BEGIN') 
// promiseCleanRoom.then((message)=>{ 
//     console.log(message) 
// }).catch((error)=>{ 
//     console.log(error) 
// }).finally(() => { 
//     console.log('DONE') 
// }) 
// console.log('END')


async function getData() { 
    try{ 
        console.log('GET DATA') 
        let response = await fetch("https://reqres.in/api/users?page=1", { 
            method: "GET", headers: { "Content-Type": "application/json" }, 
        }) 
        let data = await response.json() 
        let listUser = data.data 
        let bodyHTML = ''
        listUser.forEach(user => { 
            let id =user.id 
            let email = user.email 
            let firstName = user.first_name 
            let lastName = user.last_name 
            let avatar = user.avatar 
            let rowHTML = `<tr> <td>${id}</td> <td>${email}</td> <td>${firstName}</td> <td>${lastName}</td> <td><img src=${avatar}></td> </tr>` 
            bodyHTML += rowHTML 
        }); 
        let tableBody = document.getElementById('table-body') 
        tableBody.innerHTML = bodyHTML 
    }catch(erroг) { 
        console.log(erroг) 
    }
}
console.log('BEGIN')
getData()
console.log('END')