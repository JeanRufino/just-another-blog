import express from 'express';

const app = express()

app.get('test', (req, res) => {
  res.status(200).send('it works!');
});

app.listen(300, () => {
  console.log('Server is running on PORT 3000');
})