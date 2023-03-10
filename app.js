//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

const port = process.env.PORT || 3000
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  mongoose.set('strictQuery', true);
  await mongoose.connect('mongodb+srv://rmaher:Ha7lMl3Ic7fWPMVw@cluster0.21sgoys.mongodb.net/todolistDB');
  
 
}
const itemsSchema = new mongoose.Schema({
  name: String,
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome To your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an Item."
})

const defalutItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defalutItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Items were added succesfully");
      }
     });
      res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems}); 
    } 
  });
  

});


app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })  
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("Item was deleted succesfully");
      res.redirect("/")
    }
  })
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  })
}

})

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create New list
         const list = new List({
        name: customListName,
        items: defalutItems
        })
        list.save().then(function(){
          res.redirect("/" + customListName)
        });
      } else {
        //Show exisiting list
        res.render("list", {listTitle: customListName, newListItems: foundList.items})
      }
    } 
     
     
  })
 

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});
