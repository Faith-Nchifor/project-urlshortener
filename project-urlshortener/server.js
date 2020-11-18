
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser')
const app = express();
const sh = require('short-hash');
const dns = require('dns');
const validurl= require('valid-url');
const Url= require('url').URL;
const mongoose = require ('mongoose')
const schema = mongoose.Schema;

mongoose.connect(sample.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

//create schema
const urlSchema = new schema({
  original_url:{type:String,required:true,unique:true},
  short_url:{type:String,required:true}
});
let URLs = mongoose.model('URLs',urlSchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get("/api/shorturl/:short_url",async (req,res)=>{
  try{
   // let short_url = req.params.short_url;
    const record = await URLs.findOne( {'short_url':req.params.short_url});
    if(record){
       
     return res.redirect(record.original_url)
    }
    else{
      console.log('error occured somewhere')
      return res.status(404).json({error:'url not found'})
    }
  }
  catch(error){
    console.log(error)
    res.json({'error':error})
  }
})
const stringIsAValidUrl = (s) => {
    try {
      new Url(s);
      return true;
    } catch (err) {
      return false;
    }
  };

app.post('/api/shorturl/new',async (req,res,next)=>{
  var url= req.body.url;
 
  if (!validurl.isWebUri(url)){
       res.json({"error":"Invalid URL"})
    } 
  else {
    try{
     let findone = await URLs.findOne({original_url:url})
      if(findone){
        res.json({
        'original_url':findone.original_url,
        'short_url':findone.short_url
        })
  }
  
  else {
     let new_url= new URLs({
       original_url:url,
       short_url:sh(url)})

      await new_url.save()
      res.json({
        'original_url':new_url.original_url,
        'short_url':new_url.short_url
        })
    }
  }catch(error){
    console.log(error)
    res.json({error: 'server error...'})
  }
    }
 
 
})


//app.post(ng)
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});



/*URLs.exists({original_url:url}/*,(err,result)=>{
   // if(result== true){
      exists= true;
     existing_url= URLs.findOne({original_url:url},(err,result)=>{
       //if(err) console.log(err);
       res.json({
        original_url:url,
        short_url:result.short_url})
     });
     
    }
  }
  )*/