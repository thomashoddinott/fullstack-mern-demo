import express from "express";

const app = express();

app.get("/hello", function (req, res) {
  res.send("Hello!");
});

app.listen(8000, function() {
    console.log('Server is listening on port 8000')
})