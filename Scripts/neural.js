var brain = require("brain");
var fs = require('fs');
var _ = require('underscore');

var data = JSON.parse(fs.readFileSync('../input/train.json', 'utf8'));
var net = new brain.NeuralNetwork();

var traindata = []

var index = 0;

for (var key in data['listing_id']) {
	var test = data['interest_level'][key].toString();
	index = traindata.push(
		{input: { description : data['description'][key].length}, output: {}});
	traindata[index - 1]["output"][test] = 1;
}




var getsample = function() {
	var test_apartments = _.sample(traindata, 10000);
	var train_apartments = _.difference(traindata, test_apartments);
	
	return [test_apartments, train_apartments];
}

var apartments = getsample();
var test_apartments = apartments[0];
var train_apartments = apartments[1];

console.log(train_apartments[0]);
console.log(test_apartments[0]);

console.log("Numder of records: " + traindata.length);
console.log("Number of test records: " + test_apartments.length);
console.log("Number of train records: " + train_apartments.length);

var info = net.train(traindata, {
  errorThresh: 0.005,  // error threshold to reach
  iterations: 1000,   // maximum training iterations
  log: true,           // console.log() progress periodically
  logPeriod: 200,       // number of iterations between logging
  learningRate: 0.7    // learning rate
})

console.log(info);

// for (var i = 0; i < test_apartments.length - 1; i++) {
// 	console.log(test_apartments[i])
// 	var predictiondata = net.run(test_apartments[i]);
// 	console.log(predictiondata);
// 	var prediction = Object.keys(predictiondata).reduce(function(a, b){ return predictiondata[a] > predictiondata[b] ? a : b });
// 	console.log(prediction, Object.keys(test_apartments[i]["output"])[0]);

// }
console.log(test_apartments[50])
console.log(net.run(test_apartments[50]));
console.log(test_apartments[1050])
console.log(net.run(test_apartments[1050]));