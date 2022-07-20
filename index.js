const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const crypto = require('crypto');

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

//
// REQUISITO 2
//
//  MIDDLEWARE REQUISITO 2
const req2 = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await readFile();
    const talkerId = data.find((el) => el.id === Number(id));
    if (!talkerId) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    res.status(200).json(talkerId);
  } catch (error) {
    console.log(error);
  }
};
//
// ROTA
app.get('/talker/:id', req2);
//
//

//
// REQUISITO 3
//
//  MIDDLEWARE REQUISITO 3 
const req3 = (req, res, next) => {
  const { email, password } = req.body;
  const regex = /^[\w.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (!email) return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  if (!regex.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  if (!password) return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
};
//
// ROTA
app.post('/login', req3, (_req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  res.status(200).json({ token });
});
//
//
//
app.listen(PORT, () => {
  console.log('Online');
});
