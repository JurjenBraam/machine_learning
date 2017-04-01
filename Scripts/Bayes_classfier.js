var limdu = require('limdu');
var fs = require('fs');
var _ = require('underscore');

var colorClassifier = new limdu.classifiers.Bayesian();


var data = JSON.parse(fs.readFileSync('../input/train.json', 'utf8'));

var traindata = []

var index = 0;
var low = 0;
var medium = 0;
var high = 0;

var maxBathroom = 0;
var minPrice = 0;
var count = 0;

for (var key in data['listing_id']) {
	if (data['price'][key] > maxBathroom) {
		maxBathroom = data['price'][key]; 
	} else if (data['price'][key] < minPrice) {
		minPrice = data['price'][key];
	}
}
console.log(maxBathroom);
console.log(minPrice);

for (var key in data['listing_id']) {
	index = traindata.push(
		{input: { bathrooms : normalize(data['price'][key],maxBathroom)}, 
		output: data['interest_level'][key].toString()});
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


colorClassifier.trainBatch(train_apartments);

var wrong = 0;
var right = 0;

for (var i = 0; i < test_apartments.length - 1; i++) {

	if (test_apartments[i]["output"] == colorClassifier.classify(test_apartments[i]["input"])) {
		right += 1;
	} else {
		wrong += 1;
	}
}

console.log(right/test_apartments.length);

// console.log(colorClassifier.classify(test_apartments[1]["input"], 2));


function normalize(num,max) {
	if (!num) {
		return 0; 
	} else {
		//console.log(num/max);
		return num/max;

	}
}