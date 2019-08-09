const express = require('express')
 const app = express()
 const port = process.env.PORT || 5000

 app.listen(port, () => console.log(`listeninportg on port: ${port}`))