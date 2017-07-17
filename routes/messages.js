var express = require('express');
var router = express.Router();
var mysql = require('mysql')

var connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'streamvideos',
  charset: 'utf8mb4'
})

connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
})
/* POST users listing. */
router.post('/', function(req, res, next) {
  var messages=[];
  var data = JSON.parse(req.body.data);
  data.items.forEach(function(message) {
    messages.push([message.authorDetails.channelId,message.authorDetails.displayName,req.body.videoId,message.snippet.displayMessage])
  }, this);
  connection.query('INSERT INTO messages (authorChannelId,name,videoId,message) VALUES ?',[messages], function(err, result) {
      if (err) { console.log(err); }
      res.send('respond with a resource');
  });
});

router.get('/:channelId', function(req,res,next){
  var channelId = req.params.channelId;
  connection.query('SELECT * from  messages where authorChannelId="'+channelId+'"', function(err, result) {
      if (err) {
        console.log(err);
      }
      res.render('user',{messages:result});
  });
})

module.exports = router;



