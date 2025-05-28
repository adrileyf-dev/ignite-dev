const express = require("express");
const app = express(); ///para teste crie junto emcima
const { v4: uuidv4 } = require("uuid");
app.use(express.json());

const customers = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;
  const customersExiste = customers.some((customers) => customers.cpf === cpf);
  if (customersExiste) {
    return response.status(400).json({ error: "Customer already existe " });
  }
  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });
  response.status(201).send();
});
app.listen(3333);
