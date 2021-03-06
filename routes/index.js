var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  req.db.collection('flowers').distinct('color', function(err, colorDocs){
    if (err) {
      return next(err)
    }

    if (req.query.color_filter) {

      req.db.collection('flowers').find({"color":req.query.color_filter}).toArray(function (err, docs) {
        if (err) {
          return next(err);
        }
        return res.render('all_flowers', {'flowers': docs, 'colors': colorDocs, 'color_filter': req.query.color_filter});
      });

    } else {
      req.db.collection('flowers').find().toArray(function (err, docs) {
        if (err) {
          return next(err);
        }
        return res.render('all_flowers', {'flowers': docs, 'colors': colorDocs});

      });
    }
  });
});

router.get('/details/:flower', function(req, res, next){
  req.db.collection('flowers').findOne({'name' : req.params.flower}, function(err, doc) {
    if (err) {
      return next(err);  // 500 error
    }
    if (!doc) {
      return next();  // Creates a 404 error
    }
    return res.render('flower_details', { 'flower' : doc });
  });

});

// for adding a flower to db via html form POST
router.post('/addFlower', function(req, res, next){
  // check that the new flower doesn't already exist.

  var lowercase_flower_name = req.body.name.toLowerCase();
  var first_letter = lowercase_flower_name[0].toUpperCase();
  var flower_name = first_letter + lowercase_flower_name.slice(1);
  req.db.collection('flowers').count({name:flower_name}, function(err, count) {

    // Do not save a new flower if there is already a flower with that name in the database.
    if( count == 0 ){
      req.db.collection('flowers').insertOne(req.body, function (err) {
        if (err) {
          return next(err);
        }
      });
    }
    return res.redirect('/');
  });

});

// ajax handler for updating color
router.put('/updateColor', function(req, res, next) {

  var filter = { 'name' : req.body.name };
  var update = { $set : { 'color' : req.body.color }};

  req.db.collection('flowers').findOneAndUpdate(filter, update, function(err) {
    if (err) {
      return next(err);
    }
    return res.send({'color' : req.body.color})
  })
});

// ajax handler for deleting flower
router.delete('/deleteFlower', function(req, res) {

  var filter = { 'name' : req.body.name, 'color': req.body.color };

  req.db.collection('flowers').findOneAndDelete(filter, function(err) {
    if (err) {
      return err;
    }
      return res.send({'delete' : filter})
  })
});

module.exports = router;

