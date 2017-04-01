    // module dependencies
    var dclassify = require('dclassify');
    var fs = require('fs');
    var DecisionTree = require('decision-tree');
    var _ = require('underscore');
    
    var data = JSON.parse(fs.readFileSync('../input/train.json', 'utf8'));

    // Utilities provided by dclassify
    var Classifier = dclassify.Classifier;
    var DataSet    = dclassify.DataSet;
    var Document   = dclassify.Document;


    // create a DataSet and add test items to appropriate categories
    // this is 'curated' data for training
    var low = [];  // 34284
    var medium = []; // 11229
    var high = []; // 3839
    


for (var key in data['listing_id']) {

    var appartment = new Document(key, [data['bedrooms'][key], data['price'][key], data['photos'][key].length]); 
    
    if (data['interest_level'][key] == "low") {
        low.push(appartment);
    }

    if (data['interest_level'][key] == "medium") {
        medium.push(appartment);
    }

    if (data['interest_level'][key] == "high") {
        high.push(appartment);
    }


    };

    console.log(low.length);
    console.log(medium.length);
    console.log(high.length);


    var data = new DataSet();
    data.add('low', low);
    data.add('medium', medium);
    data.add('high', high);




    // an optimisation for working with small vocabularies
    var options = {
        // applyInverse: true
    };
    
    // create a classifier
    var classifier = new Classifier(options);
    
    // train the classifier
    classifier.train(data);
    console.log('Classifier trained.');
    console.log(JSON.stringify(classifier.probabilities, null, 4));
  
    for (var i = 0; i < medium.length - 1; i++) { 
       console.log(classifier.classify(medium[i])['category']);
    }

 