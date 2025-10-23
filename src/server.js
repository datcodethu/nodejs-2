const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const path = require('path');
const cors = require("cors");
const route = require('./routes')




const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

//Connect db
const db = require('./config/db')
db.connect()

app.use(express.static(path.join(__dirname, 'public')))

//HTTP logger
app.use(morgan('combined'));

//Template engine
app.engine('hbs', engine({
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'))

//route
route(app);











app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
})
