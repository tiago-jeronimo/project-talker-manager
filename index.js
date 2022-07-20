const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

//
//
// REQUISITO 1
//
//
// FUNÇÃO QUE LÊ
async function readFile() {
  try {
    const data = await fs.readFile('./talker.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
  }
}
//
//
// 
//  MIDDLEWARE REQUISITO 1
const req1 = async (_req, res) => {
  try {
    const data = await readFile();
    if (!data) return res.status(200).json([]);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
  }
};
//
// ROTA
app.get('/talker', req1);
//
//
app.listen(PORT, () => {
  console.log('Online');
});
