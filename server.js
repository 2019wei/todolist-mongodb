const http = require('http');
const errorHandle = require('./errorHandle');
const mongoose = require('mongoose');
const Todo = require('./models/todo')
const dotenv = require('dotenv')

dotenv.config({ path: "./config.env" })

const DB = process.env.DATABASE
let todos = [];


mongoose.connect(DB)
.then(()=>console.log('資料連接成功'))

const requestListener =async (req , res) =>{
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    let body ="";
    req.on('data',chuck=>{
        body+=chuck;
    })
    if(req.url =="/todos" && req.method == "GET"){
        todos = await Todo.find();
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data":todos
        }));
        res.end();
    }else if(req.url =="/todos" && req.method == "POST"){
        req.on('end',async()=>{
            try{
                const title = JSON.parse(body).title;
                const completed = JSON.parse(body).completed;
                if(title !== undefined){
                  await Todo.create({
                        "title":title,
                        "completed":completed
                    })
                    todos = await Todo.find();
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                    "status":"success",
                    "data":todos
                    }));
                    res.end();
                }else{
                    errorHandle(res)
                    }
            }catch(error){
                console.log("錯誤",error);
                errorHandle(res)
            }
        })
    }
    else if(req.url =="/todos" && req.method == "DELETE"){
        await Todo.deleteMany({})
        todos = await Todo.find();
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data":todos
        }));
        res.end();
    }
    else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
        const id = req.url.split('/').pop();
        try{
            await Todo.findByIdAndDelete(id)
            todos = await Todo.find();
            res.writeHead(200,headers);
            res.write(JSON.stringify({
            "status":"success",
            "data":todos
            }));
            res.end();
        }catch{
            errorHandle(res);
        }           
        
    }
    else if (req.url.startsWith("/todos/") && req.method == "PATCH"){
           req.on('end',async()=>{
               try{
                    const id = req.url.split('/').pop();
                    const title = JSON.parse(body).title;
                    const completed = JSON.parse(body).completed;
                    const editContent = {
                        "title":title,
                        "completed":completed
                    }
                    await Todo.findByIdAndUpdate(id,editContent)
                    todos = await Todo.find();
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                        "status":"success",
                        "data":todos
                    }));
                    res.end();
               }catch{
                    errorHandle(res)
               }
           })
    }
    else if(req.method == "OPTIONS"){
        res.writeHead(200,headers);
        res.end();
    }
    else{
        res.writeHead(404,headers);
        res.write(JSON.stringify({
            "status":"false",
            "message":"無此網站路由"
        }));
        res.end();
    }
    
}




const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);