var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/videos/:videoId',function(req,res,next){
  res.render('video',{videoId:req.params.videoId});
})
module.exports = router;
