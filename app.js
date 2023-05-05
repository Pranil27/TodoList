const express =require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js")
const mongoose=require('mongoose');
const _ =require("lodash");
const passport=require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const session =require("express-session");

const app=express();
require('dotenv').config();


let items =[];
let workItems=[];
app.set("view engine","ejs");




app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

app.use(session({
  secret:process.env.secret,
  resave:false,
  saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB,{useNewUrlParser:true});
//mongoose.connect('mongodb://localhost:27017/todolistDB',{useNewUrlParser:true});


const itemsSchema= new mongoose.Schema( {
  name:String
});
const userSchema= new mongoose.Schema({
  username:String,
  password:String,
  // lists:{type:[listSchema]}
});

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema],
  user:{type: mongoose.Schema.Types.ObjectId,
        ref: "User"}
});


userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model("User",userSchema);

const List =new mongoose.model("List",listSchema);

const Item =new mongoose.model("Item",itemsSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const item1=new Item({
  name:"Welcome to your todolist"
});

const item2= new Item({
  name:"Hit + button to add new items"
});

const item3=new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];



console.log("Connected");

var currUser;


app.get("/",function(req,res){
   res.set({"Allow-access-Allow-origin":'*'});

  //let day=date.getDay();
  res.render("signup");
  //res.render("list",{listTitles: day,newListItem:items});
});


app.get("/about",function(req,res){
  res.render("about");
});
var x=0;
app.get("/todo",async function(req,res){
  try{
    if(req.isAuthenticated()){

    let day=date.getDate();
    let listsOfCurr=await List.find({user:currUser._id});
    console.log(listsOfCurr);
    let currList=await List.findOne({name:day,user:currUser._id});
    console.log(currList);
    let itemList=currList.items;
    console.log(itemList);
    // .forEach(function(ele){
    //   if(ele.name===day){
    //     itemList=ele.items;
    //   }
    // });

    // x=1;
    // let itemList=await Item.find({});
    // let newlists=await List.find({});

    // console.log(newlists);
    res.render("list",{listTitles: day,newListItem:itemList,xyz:listsOfCurr});
  }
  else{
    res.redirect("/login");
  }
}
  catch(error){
    console.error(error);
  }


});
app.get("/login",function(req,res){
  res.render("login");

});

app.get("/logout",function(req,res){

  req.logout(function(err) {
   if (err) { return next(err); }
    //  console.log(currUser.lists);
   res.redirect('/');
 });
})

app.post("/neww",function (req,res) {
  console.log(req.body.newList);
  res.redirect("/"+req.body.newList);
})

app.get("/:customListName", async function(req,res){
    if(req.isAuthenticated()){
  const customListName=_.capitalize(req.params.customListName)
  // const l= await List.findOne({name:customListName});
  let l= await List.findOne({name:customListName,user:currUser._id});

  // (currUser.lists).forEach(function(ele){
  //   if(ele.name===customListName){
  //     l=ele;
  //   }
  // });
 let newlists=await List.find({});
  if(!l){
    await List.create({
      name:customListName,
      items:[],
      user:currUser._id,
    });
    let listsOfCurr=await List.find({user:currUser._id});
    // await User.collection.updateOne({username:currUser.username},{$push:{lists:list}});
    // currUser=await User.collection.findOne({username:currUser.username});
     // let newli=await List.find({});
     res.render("list",{listTitles:customListName,newListItem:[],xyz:listsOfCurr});
  }
  else{
    let listsOfCurr=await List.find({user:currUser._id});
    res.render("list",{listTitles:l.name,newListItem:l.items,xyz:listsOfCurr});
  }
}
else{
  res.redirect("/login");
}


});




app.post("/signup",function(req,res){


  User.register({username:req.body.username}, req.body.password, function(err,user){
    if(err){
      console.log(err);
      res.redirect("/signup");
    }else{
      passport.authenticate("local")(req,res,async function(){
        console.log("YES");
        let day=date.getDate();
        let listss=new List({
          name:day,
          items:[item1,item2,item3]
        });

        // await User.collection.updateOne({username:req.body.username},{$push:{lists:listss}});
        currUser=await User.collection.findOne({username:req.body.username});
        console.log(currUser.username);
        await List.create({
          name:day,
          items:[item1,item2,item3],
          user:currUser._id,
        });

        console.log(await List.findOne({user:currUser._id}));

        res.redirect("/todo");
      })
    }



});
});




app.post("/todo",async function(req,res){
    if(req.isAuthenticated()){
  const newItem = new Item({name:req.body.newItem});
  const listName = req.body.list;
  console.log(listName);
  // await User.collection.updateOne({lists:{name:listName}},{$push:{lists:{name:newItem}}});
  // currUser.lists.forEach(function(ele){
  //   if(ele.name===listName){
  //     ele.item.push(newItem);
  //   }
  // });
  // currUser = await User.collection.findOne({username:currUser.username})


console.log(listName);
var addnew={name:newItem};
await List.findOneAndUpdate({name:listName,user:currUser._id},
            {$push:{items:newItem}});
let itemL=await List.findOne({name:listName,user:currUser._id});
let itemList=itemL.items;
// currUser.lists.forEach(function(ele){
//   if(ele.name===listName){
//     ele.items.push(newItem);
//     itemList=ele.items;
//   }
// })
  console.log(itemList);

// User.findById(currUser._id).then(user=>{
//     console.log(user.lists);
//
//     const list = user.lists.find(lists => lists.name === listName);
//
//     list.items.push({name:newItem});
//
//     user.save();
//
// }).then(() => {
//     console.log('Item added to list successfully');
//   })
//   .catch(err => {
//     console.error(err);
//   });

   // await User.collection.updateOne({username:currUser.username, "lists.name":listName},{$set:{items:itemList}}, {new:true});

  //currUser=await User.collection.findOne({username:req.body.username});
  // console.log(currUser.lists);
  let listsOfCurr=await List.find({user:currUser._id});
  res.render("list",{listTitles:listName,newListItem:itemList,xyz:listsOfCurr});
  // let itemName = new Item({
  //   name: req.body.newItem
  // });
// let day=date.getDate();
// if(listName===day){
//   Item.collection.insertOne({
//     name:newItem
//   });
//   const itemList=await Item.find({});
//   console.log(itemList);
//   res.redirect("/todo");
//   //res.render("list",{listTitles: day,newListItem:itemList});
// }
// else{
//
//
//   List.findOne({name:listName})
//   .then((docs)=>{
//     docs.items.push(newItem);
//     docs.save();
//     if(docs)
//     res.render("list",{listTitles:docs.name,newListItem:docs.items});
//   })
//   .catch((err)=>{
//     console.log(err);
//   });
//   // l.items.push(itemName);
//   // l.save();
//
//
// }
}
else{
  res.redirect("/login");
}


});



app.post("/login",async function(req,res){
  const userrr= new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(userrr,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,async function() {
        currUser=await User.collection.findOne({username:userrr.username});
        console.log(currUser.username);
        // console.log(currUser.lists);
        res.redirect("/todo");
      })
    }
  })


});

app.post("/delete",async function(req,res){
  if(req.isAuthenticated()){
  let checkedItemId= req.body.checkbox;
  let listName = req.body.listName;
  console.log(listName);
//   currUser.lists.forEach(function(ele){
//     if(ele.name===listName){
//       const newele=new List({ele});
// console.log(ele);
//       newele.deleteOne({items:{_id:checkedItemId}});

//       ele=newele;
//       console.log(ele);
//     }
//   })
  await List.findOneAndUpdate({name:listName,user:currUser._id},{$pull:{items:{_id:checkedItemId}}  });
  let day=date.getDate();
  if(listName==day) res.redirect("/todo");
  else res.redirect("/"+listName);
  // let day=date.getDate();
  // if(listName===day){
  //   await User.collection.findOneAndUpdate({username:currUser.username, "lists.name":listName},{$pull:{items:{_id:checkedItemId}}});
  //   console.log(currUser.username);
  //
  // }
  // else{
  //   await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
  //   console.log("y");
  //   res.redirect("/"+listName);
  // }
}
else{
  console.log("lol");
  res.redirect("/login");
}
});



// app.post("/:customListName",async function(req,res){
//   let itemName = new Item({
//     name: req.body.newItem
//   });
//
//   itemName.save();
// })

app.listen(3000,function(){
  console.log("Server is runnig on port 3000");
});
