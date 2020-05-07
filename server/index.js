const express = require('express')

const app = express()
app.set('secret', 'nickname4th')
app.use(express.json())
app.use(require('cors')())

require('./db/db')(app)

require('./routes/route')(app)



app.listen(3030, () => console.log("http://localhost:3030"))