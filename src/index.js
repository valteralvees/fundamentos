const express = require ('express');
const {v4: uuidv4} = require("uuid")

const app = express();

app.use(express.json())

//FinAPI
//#1 - Deve ser possível Criar uma conta

const customers = [];

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if(!customer) {
    return response.status(400).json({error: "customer not found"})
  }

  request.customer = customer; 

  return next();

}

app.post("/account", (request,response) =>{
  const {cpf, name} = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if(customerAlreadyExists) {
    return response.status(400).json({error: "Customer already exists"})
  }

  const id = 
  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement:[],
  });

  return response.status(201).send()
});





//#2 -Deve ser possível buscar o extrato bancário do cliente

app.get("/statement/", verifyIfExistsAccountCPF, (request, response) => {
  
  const { customer } = request;

  return response.json(customer.statement)
})


app.post("/deposit", verifyIfExistsAccountCPF, (request,response) => {
  const { description, amount} = request.body;

  const {customer} = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send()
})

app.post("/withdraw", verifyIfExistsAccountCPF, (request,response) => {
  const {amount} = request.body;
  const { customer} = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({error: "Insufficient funds :("});
  }
  
  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
})

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const  {date} = request.query;

  const dateFormat = new Date(date + "00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return response.json(customer.statement)
})

app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
  const {name} = request.body;
  const {customer} = request;

  customer.name = name;

  return response.status(201).send();
});

app.get("/account", verifyIfExistsAccountCPF, (request, response) =>{
  const {customer} = request;

  return response.json(customer);
})

app.delete("/account", verifyIfExistsAccountCPF, (request, response) =>{
  const {customer} = request;

  customers.splice(customer,1);

  return response.status(200).json(customers)
})

app.get("/balance", verifyIfExistsAccountCPF, (request, response) =>{
  const { costumer } = request.body;
  const balance = getBalance(customer.statement);
  return response.json(balance)
})

app.listen(3333);


















//FUNDAMENTOS 

/*app.get("/courses", (request, response) => {
  const query = request.query
  console.log(query)
  return response.json([
    "curso 1", "curso 2", "Curso 3"
  ]);
})

app.post("/courses", (request,response) => {
  return response.json([
    "curso 1", "curso 2", "Curso 3", "Curso 4"
  ]);
})

app.put("/courses/:id", (request,response) =>{
  const { id } = request.params;
  return response.json([
    "curso 6", "curso 2", "Curso 3", "Curso 4"
  ]);
})

app.patch("/courses/:id",(request, response) =>{
  return response.json([
    "curso 6", "curso 7", "Curso 3", "Curso 4"
  ]);
})

app.delete("/courses/:id", (request,response) =>{
  return response.json([
    "curso 6", "curso 7", "Curso 4"
  ]);
})

app.listen(3333);*/


