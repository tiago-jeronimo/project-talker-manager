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
// REQUISITO 3 & 4
//
//  MIDDLEWARE REQUISITO 3 & 4
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

// REQUISITO5 
//
//  MIDDLEWARES REQUISITO 5
const req5TokenValidation = (req, res, next) => {
    const { authorization } = req.headers;
      if (!authorization) return res.status(401).json({ message: 'Token não encontrado' });
      if (authorization.length < 16) return res.status(401).json({ message: 'Token inválido' });
   next();
};

const req5NameValidation = (req, res, next) => {
    const { name } = req.body;
     if (!name) return res.status(400).json({ message: 'O campo "name" é obrigatório' });
     if (name.length < 3) {
      return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
       }
       next();
};

const req5AgeValidation = (req, res, next) => {
  const { age } = req.body;
   if (!age) return res.status(400).json({ message: 'O campo "age" é obrigatório' });
   if (age < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
     }
     next();
};

const req5TalkValidation = (req, res, next) => {
  const { talk } = req.body;
   if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
     next();
};

const req5watchedAtValidation = (req, res, next) => {
  const { talk: { watchedAt } } = req.body;
   if (!watchedAt) return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
   const regex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i;
   if (!regex.test(watchedAt)) {
    return res.status(400)
    .json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' }); 
}
     next();
};
const req5RateValidation = (req, res, next) => {
  const { talk: { rate } } = req.body;
   if (!rate && rate !== 0) {
 return res.status(400)
   .json({ message: 'O campo "rate" é obrigatório' }); 
}
  if (rate < 1 || rate > 5) {
    return res.status(400)
    .json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
     next();
};

async function escrita(param) {
  await fs.writeFile('./talker.json', JSON.stringify(param));
}

async function req5(req, res) {
  const data = await readFile();
  const { name, age, talk: { watchedAt, rate } } = req.body;
  data.push({ id: data.length + 1, name, age, talk: { watchedAt, rate } });
  await escrita(data);
  res.status(201).json({
    id: data.length,
    name,
    age,
    talk: { watchedAt, rate },
  });
}
//
// ROTA
app.post('/talker', 
        req5TokenValidation,
        req5NameValidation,
        req5AgeValidation,
        req5TalkValidation,
        req5watchedAtValidation,
        req5RateValidation, 
        req5);
//
//
//
app.listen(PORT, () => {
  console.log('Online');
});
