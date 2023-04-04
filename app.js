const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const port = process.env.PORT || 3001;


const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://aranandraj02:raj-anand@cluster0.odmbdit.mongodb.net/todolistDB");
const itemSchema = {
    name: String
};  

const Item = mongoose.model("item", itemSchema);
const item1 = new Item({
    name: "welcome to todolist"
});
const item2 = new Item({
    name: "Hit the + button to add a new item"
});
const item3 = new Item({
    name: "<--Hit this to delete an item"
});

const defaultItems = [item1, item2];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

 

app.get("/", function(req, res){
    Item.find().then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems).then(function () {
                console.log("Successfully saved defult items to DB");
              }).catch(function (err) {
                console.log(err);
              });
              res.redirect("/");
        }else{
            res.render('list', {listTitle: "Today", items: foundItems});
        }
        
     }).catch(function(err){
        console.log(err);
     });
    
    
});
 
app.get("/:customListName",function(req, res){
    const customListName = _.capitalize(req.params.customListName); 

    List.findOne({name: customListName}).then(function(foundList){
        if(!foundList){
            //creater new list
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            
            list.save();
            res.redirect("/"+customListName);
        }else{
            //show an existing list
            res.render("list", {listTitle: foundList.name, items: foundList.items})
        }
    });
    
    
});

app.post("/", (req, res)=>{
    
    const itemName = req.body.todoItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }

    
 
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(){
            console.log("successfully deleted checked item");
            res.redirect("/");
        })
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then(function(foundList){
            res.redirect("/"+listName);
        });
    }
    
});






app.listen(port, () => console.log(`Example app listening on port ${port}!`)); 
