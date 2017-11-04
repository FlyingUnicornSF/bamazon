var mysql = require("mysql");
var Table = require('cli-table');
var inquirer = require('inquirer');
var connection = mysql.createConnection({
  host:"localhost",
  port: 3306,

  user: "root",
  password: "",
  database:"bamazon"

});
// result is output of entire sql table and will be used by multiple functions 
var result = undefined; 
//establish connection 
connection.connect(function(err) {
  if(err){
    console.log(err.code); // 'ECONNREFUSED'
    console.log(err.fatal); // true
  }
});
// extract data from the table 
connection.query('select * from products', function(error, qresult){
  if (error) throw error;
  result = qresult; 
});
// start the program 
prompt();

// this is just to make the table 
function tableConstuction(){
  var table = new Table({
  chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
  });
  table.push(
    ['Product ID', 'Product', 'Department', 'Price', 'Stock Quantity']
  );
  return table
}; 

// find lowInventory and put them to the pre-constructed table 
function lowInventory(table){
  for (var i = 0; i < result.length; i++){
    if(result[i].stock_quantity <=3 ){   
      table.push(
        [result[i].item_id, result[i].product_name, result[i].department_name, result[i].price, result[i].stock_quantity]
      ); 
    } // if 
  } //for  
  console.log(table.toString());
}; // lowInventory

// push query result to the table 
function queryDisplay(table){
  for (var i = 0; i < result.length; i++){
    table.push(
      [result[i].item_id, result[i].product_name, result[i].department_name, result[i].price, result[i].stock_quantity]
    ); 
  } //for  
  console.log(table.toString());
}; //queryDisplay


function addInventory(){
  inquirer.prompt([
   {
      type: "input",
      message: "Enter product ID of the item you are adding to the Inventory",
      name: "item_id"
    },
    {
      type: "input",
      message: "Enter quantity",
      name: "quantity"
    }
  ]).then(function(answers){
    //i need to check if user enter something
    var id = parseInt(answers.item_id)-1;
    var quan = parseInt(answers.quantity);
    connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {stock_quantity: result[id].stock_quantity + quan},
        {item_id: answers.item_id}
      ],
      function(err, res){
        if(err) { console.log(err)}
        connection.end(); 
      } //function
    ) //connection.query  
  }).catch(function(){
    console.log("something went wrong!")
    connection.end();
  });// catchthen
}// closing add new product

function addNewProduct(){
  inquirer.prompt([
   {
      type: "input",
      message: "Enter product ID of the item you are adding to the Inventory",
      name: "item_id"
    },
    {
      type: "input",
      message: "Enter product name",
      name: "name"
    },
    {
      type: "input",
      message: "Enter department name",
      name: "department"
    },
    {
      type: "input",
      message: "Enter price",
      name: "price"
    },
    {
      type: "input",
      message: "Enter quantity",
      name: "quantity"
    }
  ]).then(function(answers){
    //to do: check if user enter something
    //to do: clean up user input
    var id = parseInt(answers.item_id);
    var name = answers.name;
    var department = answers.department;
    var price = parseInt(answers.price); 
    var quan = parseInt(answers.quantity);
    connection.query(
      "INSERT INTO products SET ?",
        { 
          item_id: id,
          product_name: name,
          department_name: department,
          price: price,
          stock_quantity: quan
        }, 
      function(err, res){
        if(err) { console.log(err)}
        connection.end();
      }
    ) // connection query
  }).catch(function(){
    console.log("something went wrong!")
    connection.end();
  });// catchthen
}// closing add new product


function prompt(){
  inquirer.prompt([
   {
      type: "list",
      message: "Select one from the menu",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
      name: "menu"
    },
  ]).then(function(answers) {
    if(answers.menu === "View Products for Sale"){
      var table = tableConstuction();
      queryDisplay(table);
      connection.end();
    } else if (answers.menu === "View Low Inventory") {
      var table = tableConstuction();
      lowInventory(table);
      connection.end();
    } else if (answers.menu === "Add to Inventory") {
      addInventory();
    } else if (answers.menu === "Add New Product") {
      addNewProduct();
    }
  }).catch(function(){
      console.log("something went wrong!")
    connection.end();
  });// catch
}; // closing prompt 

// -----------keep this for connection testing----------------
// connection.connect(callback);
// function callback(err){
//   if(err) throw err;
  
//   console.log("connected as"+ connection.threadId)
//   connection.end();
// };// callback




