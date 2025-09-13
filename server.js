const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('hello') 
    res.end()
})
app.get('/age', (req, res) => {
    res.send(age(2005)) 
    res.end()
})
app.get('/name', (req, res) => {
    res.send(name('Nguyen Van A')) 
    res.end()
})
const PORT = process.env.PORT ||5000;

app.listen(PORT,console.log(`Server started on port ${PORT}`));
function age(birthDay){
    const today = new Date();
    let age = today.getFullYear() - birthDay;
    return age;}
function name(name){
    return name;
}