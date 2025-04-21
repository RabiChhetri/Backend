const connectToMongo = require('./db');
const express = require('express')
const cors = require('cors');
connectToMongo();
const app = express()
const port = 5000

app.use(cors());
app.use(express.json())
//Available Routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/signuser',require('./routes/notes'))
app.use('/api/contact', require('./routes/contactauth'));
app.use('/api/book', require('./routes/bookauth'));
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})