const express =require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js")

const app=express();

let items =["Buy Food" , "Cook Food" , "Eat Food"];
let workItems=[];
app.set("view engine","ejs");


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",function(req,res){
  let day=date.getDate();
  //let day=date.getDay();
  res.render("list",{listTitles: day,newListItem:items});
});

app.get("/work",function(req,res){
  res.render("list",{listTitles:"Work List", newListItem:workItems});
});

app.get("/about",function(req,res){
  res.render("about");
});

app.post("/work",function(req,res){
  let item=req.body.newItem;
  workItems.push(item);
  res.redirect("/");
})


app.post("/",function(req,res){
  item = req.body.newItem;
  if(req.body.button=='Work List'){
    workItems.push(item);
    res.redirect("/work")
  }
  else{
      items.push(item);
        res.redirect("/");
  }



})

app.listen(3000,function(){
  console.log("Server is runnig on port 3000");
});
