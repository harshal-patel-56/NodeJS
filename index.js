
var express = require('express');
var mysql = require('mysql')
var bodyParser = require("body-parser");
var app = express();
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'todo'
});

conn.connect(function(err){
  if(!!err) {
    console.log('Error occurred');
    
  } else {
    console.log('DB Connected');
  }
});

var complete = [];
var task = [];
var tmp = '';
var flg = 0;
var mx = 0;
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    conn.query("SELECT * FROM tasks", function(err, rows, cols){
      if(!!err) {
        console.log('Error in fetching DataBase');
      } else if(flg == 0) {
        flg = 1;
        //res.send(rows);
        for(var i=0; i < rows.length; i++){
          if(rows[i].compl == 1){
            complete.push(rows[i].taskk);
          }
          else{
            task.push(rows[i].taskk);
          }
          if(rows[i].task_id > mx){
            mx = rows[i].task_id;
          }
        }
        console.log('Query Successful');
        res.render("index", {task: task, complete: complete, tmp: tmp});
      }
      else
      res.render("index", {task: task, complete: complete, tmp: tmp});
      tmp = '';
    });
    
 });
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/addtask', function (req, res) {
    var newTask = req.body.newtask;
    if(newTask == ""){
      tmp = 'Null Task Not Accepted';
    }
    else if(task.indexOf(newTask) == -1) {
      task.push(newTask);
      conn.query('INSERT INTO tasks VALUES (?,?,?)',[mx+1, newTask, 0], function(err, result){
        if(err){
          console.log('Error Occurred');
        }
      });
      mx++;
      tmp = 'Addded Successfully';
    } else {
      tmp = 'Task Already Exists';
    }
    res.redirect("/");
});

app.post("/removetask", function(req, res) {
    var completeTask = req.body.check;
if (typeof completeTask === "string") {
    complete.push(completeTask);
    conn.query('UPDATE tasks SET compl = 1 WHERE taskk = ?',[completeTask]);
    task.splice(task.indexOf(completeTask), 1);
 } else if (typeof completeTask === "object") {

   for (var i = 0; i < completeTask.length; i++) {  
      conn.query('UPDATE tasks SET compl = 1 WHERE taskk = ?',[completeTask[i]]);
      complete.push(completeTask[i]);
      task.splice(task.indexOf(completeTask[i]), 1);
}
}
  res.redirect("/");
});

app.post("/removehist", function(req, res) {

  conn.query('DELETE from tasks WHERE compl = 1');
  complete = [];
res.redirect("/");
});