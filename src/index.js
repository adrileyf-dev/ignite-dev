const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];
// middlware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  console.log(cpf);
  const customer = customers.find((customer) => customer.cpf === cpf);
  if (!customer) {
    return response.status(404).json({ error: "Customer not found" });
  }
  /// passa para a request par
  request.customer = customer;
  console.log("asda", customer);
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

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;
  const dataFormat = new Date(date + " 00:00");
  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dataFormat).toDateString()
  );
  return response.json(statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;
  console.log(customer);

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };
  customer.statement.push(statementOperation);
  return response.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = customer.statement.reduce((acc, operation) => {
    return operation.type === "credit"
      ? acc + operation.amount
      : acc - operation.amount;
  }, 0);

  if (amount > balance) {
    return response.status(400).json({ error: "Insufficient funds" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);
  return response.status(201).send();
});

app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;
  customer.name = name;
  return response.status(201).send();
});

app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer);
});

app.get("/account/all", (request, response) => {
  return response.json(customers);
});

app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  customers.splice(customer, 1);
  return response.status(200).json(customers);
});

app.listen(3333, () => {
  console.log("Servidor rodando na porta 3333");
});
