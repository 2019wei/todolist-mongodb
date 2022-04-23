const http = require('http');
const errorHandle = require('./errorHandle');
const mongoose = require('mongoose');
const Post = require('./models/postModels')
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
    if(req.url =="/posts" && req.method == "GET"){
        const post  = await Post.find();
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data":post
        }));
        res.end();
    }else if(req.url =="/posts" && req.method == "POST"){
        req.on('end',async()=>{
            try{
                  const data = JSON.parse(body);
                  const post =  await Post.create(data)
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                    "status":"success",
                    "data":post
                    }));
                    res.end();
            }catch(error){
                console.log("錯誤",error);
                errorHandle(res)
            }
        })
    }
    else if(req.url =="/posts" && req.method == "DELETE"){
        const post = await Post.deleteMany({})
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            "data":post
        }));
        res.end();
    }
    else if(req.url.startsWith("/posts/") && req.method == "DELETE"){
        const id = req.url.split('/').pop();
        try{
            const post = await Post.findByIdAndDelete(id)
            res.writeHead(200,headers);
            res.write(JSON.stringify({
            "status":"success",
            "data":post
            }));
            res.end();
        }catch{
            errorHandle(res);
        }           
        
    }
    else if (req.url.startsWith("/posts/") && req.method == "PATCH"){
           req.on('end',async()=>{
               try{
                    const id = req.url.split('/').pop();
                    const data = JSON.parse(body)
                    const post =  await Post.findByIdAndUpdate(id,data)
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                        "status":"success",
                        "data":post
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