const express = require("express");
const app = express();
app.get('/', (req, res) => {
  res.json({hello: 'world'})
});

app.listen(process.env.PORT || 4000, () => console.log('APP listening on 4000'));