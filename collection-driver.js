/**
 * @fileoverview A facade to MongoDB API with error handling
 * @author Pradeep Vemulakonda
 * @exports CollectionDriver CollectionDriver utility object to access a mongodb instance
 * @module Persistence 
 * @requires mongodb server DB instance
 * @version 0.1
 */
var ObjectID = require('mongodb').ObjectID,
	CollectionDriver;
/**
 * A facade to mongodb driver
 * @param db {mongodb.DB} the Database object obtained from mongodb instance
 * @class
 */
CollectionDriver = function(db) {
	  this.db = db;
};
	
/**
 * fetch a collection from mongodb
 * @param collectionName {string} name of the collection
 * @param callback {function} to be executed once fetched
 * @access public
 */
CollectionDriver.prototype.getCollection = function(collectionName, callback) {
	this.db.collection(collectionName, function(error, fetchedCollection) {
		if( error ) {
			callback(error);
		}
		else {
			callback(null, fetchedCollection);
		}
	});
};	

/**
 * Returns all the objects found in the collection
 * @example 
 * collectionDriver.findAll(req.params.collection, function(error, objs) {
 *	    	  if (error) { 
 *	    		  res.send(400, error); 
 *	    	  }
 *		      else { 
 *		          if (req.accepts('html')) {
 *	    	          res.render('index',{objects: objs, collection: req.params.collection});
 *	              } else {
 *		          res.set('Content-Type','application/json');
 *	                  res.send(200, objs);
 *	              }
 *	         }
 *	   	});
 * @param collectionName {string} name of the mongodb collection
 * @param callback {function} the @callback
 * @access public
 */
CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, fetchedCollection) {
      if( error ) {
    	  callback(error);
      } else {
        fetchedCollection.find().toArray(function(error, results) {
          if( error ) { 
        	  callback(error);
          } else {
        	  callback(null, results);
          }
        });
      }
    });
};

/**
 * This filters the fetched collection based on id and returns the single row
 * @example
 * collectionDriver.get(collection, entity, function(error, objs) {
 *	          if (error) { res.send(400, error); }
 *	          else { res.send(200, objs); }
 *	       });
 * @param collectionName {string} collection name
 * @param id {string} to search for in the fetched collection
 * @param callback {function} callback invoked when get completes
 * @access public
 */
CollectionDriver.prototype.get = function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, fetchedCollection) {
        if (error) {
        	callback(error);
        } else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            if (!checkForHexRegExp.test(id)) {
            	callback({error: "invalid id"});
            } else {
            	fetchedCollection.findOne({'_id':new ObjectID(id)}, function(error,doc) {
            		if (error) {
            			callback(error);
                	} else {
                		callback(null, doc);
                	}
            	});
            }	
        }
    });
};

/**
 * Saves the passed in project object to the mongodb database
 * @param collectionName {string} The name of the collection to save.
 * @param obj {object} the object that needs to be saved as part of the collection.
 * @param callback {function} that is executed when the data is saved successfully.
 * @access public
 */
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if( error ){
    	  callback(error);
      } else {
        obj.created_at = new Date();
        the_collection.insert(obj, function() {
          callback(null, obj);
        });
      }
    });
};

/**
 * Update the passed in collection based on the object id for the collection
 * @param collectionName {string} the collection name
 * @param obj {object} that data that needs to be updated
 * @param entityId {string} the id of the entity persistent in the db.
 * @param callback {function} this callback is aclled once the update is complete.
 * @access public
 */
CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) {
        	callback(error);
        } else {
            obj._id = ObjectID(entityId); 
            obj.updated_at = new Date(); 
            the_collection.save(obj, function(error,doc) { 
                if (error) {
                	callback(error);
                }	
                else {
                	callback(null, obj);
                }
            });
        }
    });
};

/**
 * Deletes a specific object from the collection
 * @param collectionName {string} the collection name
 * @param entityId {string} the id of the entity persistent in the db.
 * @param callback {function} this callback is aclled once the update is complete.
 * @access public
 */
CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
    this.getCollection(collectionName, function(error, the_collection) { 
        if (error) {
        	callback(error);
        }	
        else {
            the_collection.remove({'_id':ObjectID(entityId)}, function(error,doc) { 
                if (error){
                	callback(error);
                }	
                else {
                	callback(null, doc);
                }
            });
        }
    });
};


/**
 * close the passed in db instance
 * @access public
 */
CollectionDriver.prototype.shutdown = function() {
	console.info('CLosing DB instance for db'+ this.db.toString());
	this.db.close();
};

exports.CollectionDriver = CollectionDriver;