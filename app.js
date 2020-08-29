//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _=require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Varanshu:30@Varun@cluster0-jyxjl.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your TodoList"
});
const item2=new Item({
  name:"Hit + to add the item"
});
const item3=new Item({
  name:"<--Hit this to delete the item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Working without problem");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    console.log(foundItems);
  })
// const day = date.getDate();


});


app.get("/:URL", function(req,res){
  const nameURL=_.capitalize(req.params.URL);


  List.findOne({name:nameURL},function(err,foundList){
    if(!err){
      if(!foundList){
        // Create a New List
        const list=new List({
          name:nameURL,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+nameURL);
      }else{
        //Show an Existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    }
  })
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
console.log(listName);
  const item=new Item({
    name:itemName
  });

  if(listName=="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
  const itemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(itemId,function(err){
      if(!err){
        console.log("Deleted Successfully");
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
