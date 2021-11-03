const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('POST requests to /api/issues/{project}', function() {

    test('POST every field', function(done) {
      chai
      .request(server)
      .post('/api/issues/project')
      .send({
        'issue_title': 'title',
        'issue_text': 'text',
        'created_by': 'creator',
        'open': true,
        'status_text': 'status'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'title');
        assert.equal(res.body.issue_text, 'text');
        assert.equal(res.body.created_by, 'creator');
        assert.equal(res.body.open, true);
        assert.equal(res.body.status_text, 'status');

        done();
      });
    });

    test('POST required fields', function(done) {
      chai
      .request(server)
      .post('/api/issues/project')
      .send({
        'issue_title': 'title',
        'issue_text': 'text',
        'created_by': 'creator'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, 'application/json');
        assert.equal(res.body.issue_title, 'title');
        assert.equal(res.body.issue_text, 'text');
        assert.equal(res.body.created_by, 'creator');

        done();
      });
    });

    test('POST missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/project')
        .send({
          'issue_title': '',
          'issue_text': 'text',
          'created_by': 'creator'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'required field(s) missing');

          done();
        });
      });

  });

  suite('GET requests to /api/issues/{project}', function() {

    test('View issues on a project', function(done) {
      chai
        .request(server)
        .get('/api/issues/project')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.isArray(res.body);

          done();
        });
    });

    test('View issues on a project with one filter', function(done) {
      chai
        .request(server)
        .get('/api/issues/project?assigned_to=Joe')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.isArray(res.body);
          res.body.forEach(obj => {
            assert.equal(res.body.assigned_to, 'Joe')
          });

          done();
        });
    });

    test('View issues on a project with multiple filters', function(done) {
      chai
        .request(server)
        .get('/api/issues/project?open=true&assigned_to=Joe')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.isArray(res.body);
          res.body.forEach(obj => {
            assert.isTrue(res.body.open);
            assert.equal(res.body.assigned_to, 'Joe');
          });

          done();
        });
    });

  });

  suite('PUT requests to /api/issues/{project}', function() {

    test('Update one field', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({'_id': '618262427705ed5dadc0fbd2', 'assigned_to': 'Jim'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body._id, '618262427705ed5dadc0fbd2');
          assert.equal(res.body.result, 'successfully updated');

          done();
        });
    });

    test('Update multiple fields', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({'_id': '618262427705ed5dadc0fbd2', 'assigned_to': 'Jim', 'status_text': 'text'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body._id, '618262427705ed5dadc0fbd2');
          assert.equal(res.body.result, 'successfully updated');

          done();
        });
    });

    test('Missing "_id" field', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({'status_text': 'text'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing _id');

          done();
        });
    });   

    test('No fields to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({'_id': '618262427705ed5dadc0fbd3'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body._id, '618262427705ed5dadc0fbd3');
          assert.equal(res.body.error, 'no update field(s) sent');

          done();
        });
    });

    test('Invalid "_id" input', function(done) {
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({'_id': '618262427705ed5dadc0fbd0', 'assigned_to': 'Jim'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body._id, '618262427705ed5dadc0fbd0');
          assert.equal(res.body.error, 'could not update');

          done();
        });
    }); 

  });

  suite('DELETE requests to /api/issues/{project}', function() {

    test('delete an issue with an invalid "_id"', function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({'_id': '618262427705ed5dadc0fbd0'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body._id, '618262427705ed5dadc0fbd0');
          assert.equal(res.body.error, 'could not delete');

          done();
        });
    });

    test('delete an issue with missing "_id"', function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing _id');

          done();
        });
    });

    test('delete an issue', function(done) {
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({'_id': '6182623d7705ed5dadc0fbd1'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body._id, '6182623d7705ed5dadc0fbd1');
          assert.equal(res.body.result, 'successfully deleted');

          done();
        });
    });


  });

});
