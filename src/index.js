const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];
// middlware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.params;
  console.log(cpf);
  const customer = customers.find((customer) => customer.cpf === cpf);
  if (!customer) {
    return response.status(404).json({ error: "Customer not found" });
  }
  /// passa para a request par
  request.customer = customer;
  return next();
}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerExists = customers.some((customer) => customer.cpf === cpf);
  if (customerExists) {
    return response.status(400).json({ error: "Customer already exists" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send();
});

/// outra forma de usar  middlware  app.user(verifyIfExistsAccountCPF) tudo que tiver abaixo dele vai receber ele

app.get("/statement/:cpf", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.listen(3333, () => {
  console.log("Servidor rodando na porta 3333");
});
