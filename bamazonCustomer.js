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

connection.connect(queryDisplay);

function queryDisplay(err){
  if(err) throw err;
  var qResult = undefined;
  var table = new Table({
  chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
         , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
         , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
         , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
  });
  connection.query('select * from products', function(err, result){
    qResult = result;
    table.push(
        ['Product ID', 'Product', 'Department', 'Price', 'Stock Quantity']
    );
    for (var i = 0; i < result.length; i++) {
      table.push(
        [result[i].item_id, result[i].product_name, result[i].department_name, result[i].price, result[i].stock_quantity]
      );
    }
    console.log(table.toString());
    prompt(qResult);
  });
};


function prompt(qResult){
  var result = qResult;
  inquirer.prompt([
   {
      type: "input",
      message: "Please enter product ID of the item would you like to purchase",
      name: "item_id"
    },
    {
      type: "input",
      message: "How many would you like to purchase?",
      name: "quantity"
    }
  ]).then(function(answers) {
    //i need to check if user enter something
    var id = parseInt(answers.item_id)-1
    var quan = parseInt(answers.quantity)
    var cost = result[id].price*quan*1.08+1.23
    if(quan <= result[id].stock_quantity){
      // updating the SQL database to reflect the remaining quantity.
      //Once the update goes through, show the customer the total cost of their purchase.
      connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {stock_quantity: result[id].stock_quantity - quan},
          {item_id: answers.item_id}
        ],
        function(err, res){
          if(err) throw err;
          console.log("your total cost is $", cost.toFixed(2), "with tax and H&S.");
        } 
      ); // 
    } else {console.log("Insufficient quantity!");}// closing if 
    connection.end();
  }).catch(function(){
      console.log("something went wrong!")
    connection.end();
  });// catch
} // closing prompt 

// -----------keep this for connection testing----------------
// connection.connect(callback);
// function callback(err){
//   if(err) throw err;
  
//   console.log("connected as"+ connection.threadId)
//   connection.end();
// };// callback




