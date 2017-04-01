var fs = require('fs');
var DecisionTree = require('decision-tree');
var _ = require('underscore');
var data = JSON.parse(fs.readFileSync('../input/train.json', 'utf8'));
//var test = JSON.parse(fs.readFileSync('test.json', 'utf8'));
var traindata = []

var index = 0;

for (var key in data['listing_id']) {
	index = traindata.push({'bathrooms' : data['bathrooms'][key], 
		'bedrooms' : data['bedrooms'][key], 
		'building_id' : data['building_id'][key], 
		'created1' : data['created'][key].substring(0,10),
		'created2' : data['created'][key].substring(11,13), 
		'description' : data['description'][key], 
		'display_address' : data['display_address'][key],
		'features' : data['features'][key],
		'has_dishwasher' : false,
		'has_pool' : false,
		'has_elavator' : false,
		'latitude' : data['latitude'][key], 
		'listing_id' : data['listing_id'][key], 
		'longitude' : data['longitude'][key], 
		'manager_id' : data['manager_id'][key], 
		'photos' : data['photos'][key].length, 
		'price' : data['price'][key], 
		'street_address' : data['street_address'][key],  
		'interest_level' : data['interest_level'][key]});

	data['features'][key].forEach(function(current_value) {
		if (current_value.toLowerCase().includes("dishwasher")) {
			traindata[index -1]['has_dishwasher'] = true;
		
		}

		if (current_value.toLowerCase().includes("pool")) {
			traindata[index -1]['has_pool'] = true;
			
		}

		if (current_value.toLowerCase().includes("elavator")) {
			traindata[index -1]['has_elavator'] = true;
			
		}

		// short, term, living, heat, city, photo's, actual
		//
	});

}

var getsample = function() {
	var test_apartments = _.sample(traindata, 10000);
	var train_apartments = _.difference(traindata, test_apartments);
	
	return [test_apartments, train_apartments];
}

var apartments = getsample();
var test_apartments = apartments[0];
var train_apartments = apartments[1];

console.log("Numder of records: " + traindata.length);
console.log("Number of test records: " + test_apartments.length);
console.log("Number of train records: " + train_apartments.length);


var class_name = "interest_level";
var features = ["bathrooms", "bedrooms", "display_address", 
"features", "has_dishwasher", "has_pool", "latitude", "listing_id", "longitude", "price", "street_address"];


var mean = 0;
for (var i = 0; i < 1; i++) {
	apartments = getsample();
	test_apartments = apartments[0];
	train_apartments = apartments[1];
	var dt = new DecisionTree(train_apartments, class_name, features);
	
	mean += dt.evaluate(test_apartments);

	console.log(mean/(i+1));
}

console.log(test_apartments[20]['interest_level'], dt.predict([test_apartments[0]]));



// features.forEach(function(feature) {
// 	var test = [feature]
// 	var dt = null;
// 	console.log(test);
// 	dt = new DecisionTree(train_apartments, class_name, test);
// 	console.log(feature);
// 	console.log(dt.evaluate(train_apartments));
// 	console.log(dt.evaluate(test_apartments));	
// })


