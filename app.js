const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// const { application } = require("express");

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRound = 10;
var alert = require("alert");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));


mongoose.connect("mongodb://localhost:27017/bankServer", {useNewUrlParser: true});
// mongoose.set("useCreateIndex",true);


const userSchema = new mongoose.Schema({
    email : String,
    password: String,
    name : String,
    address : String,
    balance : Number,
    transections : [
        {
            date : Date,
            transferWith : String,
            amount : Number,
            action : String
        }
    ],
}); 


const User = new mongoose.model("User", userSchema);


app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});
app.get("/register", function(req,res){
    res.render("register");
});
app.get("/logout", function(req, res) {
    // res.render("account", {accountUser: null});
    res.render("home");
})
app.get("/withdraw", function(req,res){
    res.render("withdraw");
});
app.get("/deposit", function(req,res){
    res.render("deposit");
});
app.get("/transfer", function(req,res){
    res.render("transfer");
});


app.post("/register", function(req, res){
    const curdate = new Date();
    bcrypt.hash(req.body.password, saltRound, function(err, hash) {

        const newUser = new User({
            email: req.body.email,
            password: hash, 
            name: req.body.name,
            address: req.body.address,
            balance: req.body.amount,
            transections: {
                date:curdate,
                transferWith: "Self",
                amount:req.body.amount,
                action: "credit"
            }

        });
        newUser.save(function(err) {
            if(err) {
                console.log(err);
            }
            else{
                // res.render("home");
                res.render("account", {accountUser: newUser});
            }
        });
    });

});

app.post("/login", function(req,res) {
    const email =  req.body.email;
    const password = req.body.password;
    User.findOne({email: email}, function(err, foundUser) {
        if(err) {
            console.log(err);
        }
        else {
            
            if(foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if(result === true) {
                        // console.log(foundUser);
                        // res.render("home");
                        res.render("account", {accountUser: foundUser});
                    }
                    else {
                        alert("password didn't match");
                    }
                });
            }
            else {
                alert("user email didn't match");
            }
        }
    });

});

app.post("/withdraw", function(req,res) {
    const email =  req.body.email;
    const password = req.body.password;
    const amount = req.body.amount;
    const curdate = new Date();
    User.findOne({email: email}, function(err, foundUser) {
        if(err) {
            console.log(err);
        }
        else {
            
            if(foundUser) {
                bcrypt.compare(password, foundUser.password, function(er, result) {
                    if(er) {
                        console.log(er);
                    }
                    else {
                        if(result === true) {
                            // console.log(foundUser);
                            var avaBalance = foundUser.balance;
                            if(amount>avaBalance) {
                                alert("you doesn't have enough balance");
                            }
                            else {
                                var data = {$set: {balance : avaBalance-amount}}
                                
                                User.updateOne({email : email}, data, function(e, r) {
                                    if(e) {
                                        console.log(e);
                                    }
                                    else {
                                    }
                                    
                                });
                                User.updateOne({email: email}, {$push: {transections: {
                                    date:curdate,
                                    transferWith: "Self",
                                    amount:amount,
                                    action: "debit"
                                } }}, function(e, r) {
                                    if(e) {
                                        console.log(e);
                                    }
                                    else {
                                    }
                                });
                                res.render("home");
                                
                            }
                        }
                        else {
                            alert("password didn't match");
                        }
                        
                    }
                });
            }
            else {
                alert("user email didn't match");
            }
        }
    });
});

app.post("/deposit", function(req,res) {
    const email =  req.body.email;
    const password = req.body.password;
    const amount = req.body.amount;
    const curdate = new Date();
    User.findOne({email: email}, function(err, foundUser) {
        if(err) {
            console.log(err);
        }
        else {
            
            if(foundUser) {
                bcrypt.compare(password, foundUser.password, function(er, result) {
                    if(er) {
                        console.log(er);
                    }
                    else {
                        if(result === true) {
                            // console.log(foundUser);
                            var avaBalance = foundUser.balance;
                            var newBalance = Number(avaBalance) + Number(amount);
                            var data = {$set: {balance : newBalance}}
                                
                            User.updateOne({email : email}, data, function(e, r) {
                                if(e) {
                                    console.log(e);
                                }
                                else {
                                }
                                    
                            });
                            User.updateOne({email: email}, {$push: {transections: {
                                date:curdate,
                                transferWith: "Self",
                                amount:amount,
                                action: "credit"
                            } }}, function(e, r) {
                                if(e) {
                                    console.log(e);
                                }
                                else {
                                }
                            });
                            res.render("home")
                        }
                        else {
                            alert("password didn't match");
                        }
                        
                    }
                });
            }
            else {
                alert("user email didn't match");
            }
        }
    });
});

app.post("/transfer", function(req,res) {
    // console.log(req.body);
    const email_S =  req.body.senderEmail;
    const password = req.body.password;
    const email_R =  req.body.receiverEmail;
    const amount = req.body.amount;
    const curdate = new Date();
    User.findOne({email: email_S}, function(err, foundUser1) {
        if(err) {
            console.log(err);
        }
        else {
            
            if(foundUser1) {
                bcrypt.compare(password, foundUser1.password, function(er, result) {
                    if(er) {
                        console.log(er);
                    }
                    else {
                        if(result === true) {
                            // console.log(foundUser);
                            User.findOne({email: email_R}, function(error1, foundUser2) {
                                if(error1) {
                                    console.log(error1);
                                }
                                else if(foundUser2) {
                                    var avaBalance1 = foundUser1.balance;
                                    var avaBalance2 = foundUser2.balance;
                                    if(amount>avaBalance1) {
                                        alert("you doesn't have enough balance");
                                    }
                                    else {
                                        var data1 = {$set: {balance : avaBalance1-amount}}
                                        User.updateOne({email : email_S}, data1, function(e1, r) {
                                            if(e1) {
                                                console.log(e1);
                                            }
                                            else {
                                            }
                                    
                                        });
                                        User.updateOne({email : email_S}, {$push: {transections: {
                                            date:curdate,
                                            transferWith: email_R,
                                            amount:amount,
                                            action: "debit"
                                        } }}, function(e2, r) {
                                            if(e2) {
                                                console.log(e2);
                                            }
                                            else {
                                            }
                                        });
                                        var newBalance = Number(avaBalance2) + Number(amount);
                                        var data2 = {$set: {balance : newBalance}}
                                        User.updateOne({email : email_R}, data2, function(e3, r) {
                                            if(e3) {
                                                console.log(e3);
                                            }
                                            else {
                                            }
                                    
                                        });
                                        User.updateOne({email: email_R}, {$push: {transections: {
                                            date:curdate,
                                            transferWith: email_S,
                                            amount:amount,
                                            action: "credit"
                                        } }}, function(e4, r) {
                                            if(e4) {
                                                console.log(e4);
                                            }
                                            else {
                                            }
                                        });
                                        res.render("home");
                                
                                    }
                                }
                                else {
                                    alert("Receiver email didn't match");
                                }
                            });
                            
                        }
                        else {
                            alert("password didn't match");
                        }
                        
                    }
                });
            }
            else {
                alert("user email didn't match");
            }
        }
    });
});

app.listen(3000, function(){
    console.log("server running at port 3000");
})