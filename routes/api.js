'use strict';
const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectID;

const URI = process.env.MONGO_URI;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res) {
      let project = req.params.project;

      // req.query object
      let filterObj = req.query;
      if (filterObj.open == 'true') filterObj.open = true;
      if (filterObj.open == 'false') filterObj.open = false;
      if (filterObj._id) filterObj._id = new ObjectId(filterObj._id);
      
      MongoClient.connect(URI)
        .then(client => {
          let db = client.db('issue_tracker');
          db.collection(project).find(filterObj).toArray()
            .then(doc => res.json(doc));
        })
        .catch(err => res.json(err));
      
    })
    
    .post(function (req, res) {
      let project = req.params.project;

      // req.body parameters
      let title = req.body.issue_title ? req.body.issue_title: '';
      let text = req.body.issue_text ? req.body.issue_text : '';
      let created = req.body.created_by ? req.body.created_by : '';
      let assigned = req.body.assigned_to ? req.body.assigned_to : '';
      let status = req.body.status_text ? req.body.status_text : '';

      // object format for entries into the db
      let entry = {
        issue_title: title,
        issue_text: text,
        created_by: created,
        assigned_to: assigned,
        status_text: status,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }

      if (title && text && created) {
        // create db connection, insert the entry and respond with json
        MongoClient.connect(URI, (err, client) => {
          if (err) console.log(err);
          let db = client.db('issue_tracker');
          db.collection(project).insertOne(entry, (err, doc) => {
            if (err) res.json(err);
            res.json(entry);
            client.close();
          });
        });
        // else respond with json for error message
      } else {
        res.json({error: 'required field(s) missing'});
      }
    })
    
    .put(function (req, res) {
      let project = req.params.project;

      let updateObj = Object.assign({}, req.body);
      if (updateObj._id) delete updateObj._id;

      // Object.keys(updateObj).forEach(key => {
      //   if (updateObj[key] == '') {
      //     delete updateObj[key];
      //   }
      // });
   
      if (Object.keys(updateObj).length == 0 && req.body._id) {
        console.log(JSON.stringify({error: 'no update field(s) sent', _id: req.body._id}));
        res.json({error: 'no update field(s) sent', _id: req.body._id});

      } else if (!req.body._id) {
        console.log(JSON.stringify({error: 'missing _id'}));
        res.json({error: 'missing _id'});

      } else {

        updateObj.updated_on = new Date();
        
        MongoClient.connect(URI, (err, client) => {
          let db = client.db('issue_tracker');
          db.collection(project).findOneAndUpdate(
            {'_id': ObjectId(req.body._id)},
            {'$set': updateObj},
            {returnDocument: 'after'}
          )
            .then(updatedDoc => {
              if (updatedDoc.value) {
                console.log('updated Doc value: ', updatedDoc.value);
                console.log(JSON.stringify({result: 'successfully updated', _id: req.body._id}));
                res.send({result: 'successfully updated', _id: req.body._id});
              } else {
                console.log(JSON.stringify({error: 'could not update', _id: req.body._id}));
                res.json({error: 'could not update', _id: req.body._id});
              }
              client.close();
            })
            .catch(err => res.json({'db error': err}));
        });  
      }
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
      if (!req.body._id) {
        res.json({error: 'missing _id'});
      } else {
        let id = new ObjectId(req.body._id);

        MongoClient.connect(URI)
          .then(client => {
            let db = client.db('issue_tracker');
            db.collection(project).findOneAndDelete({_id: id})
              .then(deletedDoc => {
                console.log(deletedDoc)
                if(deletedDoc.value) {
                  res.send({result: 'successfully deleted', _id: req.body._id});
                } else {
                  res.send({error: 'could not delete', _id: req.body._id});
                }
                client.close();
              })
              .catch(err => res.send({error: 'could not delete', _id: req.body._id}));
          })
          .catch(err => res.send({'db error': err}));
      }
    });
    
};
