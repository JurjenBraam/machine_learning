var fs = require('fs');
var csvWriter = require('csv-write-stream');

var writer = csvWriter({ separator: '~', headers: [
	"building_word", "frequency_b", 
	"description_word", "frequency_description",
	"display_address_word", "frequency_display_address", 
	"feature_word", "frequency_feature", 
	"street_address_word", "frequency_street_address",
	"manager_words", "frequency_m"  ]});

writer.pipe(fs.createWriteStream('../Temporary Files/textmining_train_all.csv'))

var train = JSON.parse(fs.readFileSync('../input/train.json', 'utf8'));

var data = [];
var building_words;
var description_words;
var display_address_words;
var feature_words;
var street_address_words;
var manager_words

// Dus 100 meest voorkomende woorden met de frequentie erachter
//features, description, display_address, street_address

var index = 0;

for (var key in train['listing_id']) {
	index = data.push({'bathrooms' : train['bathrooms'][key], 
		'bedrooms' : train['bedrooms'][key], 
		'building_id' : train['building_id'][key], 
		'created' : train['created'][key], 
		'description' : train['description'][key], 
		'display_address' : train['display_address'][key],
		'features' : train['features'][key],
		'has_dishwasher' : false,
		'has_pool' : false,
		'latitude' : train['latitude'][key], 
		'listing_id' : train['listing_id'][key], 
		'longitude' : train['longitude'][key], 
		'manager_id' : train['manager_id'][key], 
		'photos' : train['photos'][key], 
		'price' : train['price'][key], 
		'street_address' : train['street_address'][key],  
		'interest_level' : train['interest_level'][key]});

	[train['building_id'][key]].map( function(k,v){ building_words||(building_words={});building_words[k]++||(building_words[k]=1); } );

	train['description'][key].toLowerCase().split(/[\s*\.*\,\;\+?\#\|:\-\/\\\[\]\(\)\{\}$%&0-9*]/).map( function(k,v){ description_words||(description_words={});description_words[k]++||(description_words[k]=1); } );

	train['display_address'][key].toLowerCase().split(/[\s*\.*\,\;\+?\#\|:\-\/\\\[\]\(\)\{\}$%&0-9*]/).map( function(k,v){ display_address_words||(display_address_words={});display_address_words[k]++||(display_address_words[k]=1); } );

	train['features'][key].forEach(function(current_value) {
		current_value.toLowerCase().split(/[\s*\.*\,\;\+?\#\|:\-\/\\\[\]\(\)\{\}$%&0-9*]/).map( function(k,v){ feature_words||(feature_words={});feature_words[k]++||(feature_words[k]=1); } );
	});

	train['street_address'][key].toLowerCase().split(/[\s*\.*\,\;\+?\#\|:\-\/\\\[\]\(\)\{\}$%&0-9*]/).map( function(k,v){ street_address_words||(street_address_words={});street_address_words[k]++||(street_address_words[k]=1); } );

}


var building_items = Object.keys(building_words).map(function(key) {
    return [key, building_words[key]];
});

building_items.sort(function(first, second) {
    return second[1] - first[1];
});

var description_items = Object.keys(description_words).map(function(key) {
    return [key, description_words[key]];
});

description_items.sort(function(first, second) {
    return second[1] - first[1];
});

var display_address_items = Object.keys(display_address_words).map(function(key) {
    return [key, display_address_words[key]];
});

display_address_items.sort(function(first, second) {
    return second[1] - first[1];
});


var feature_items = Object.keys(feature_words).map(function(key) {
    return [key, feature_words[key]];
});

feature_items.sort(function(first, second) {
    return second[1] - first[1];
});


var street_address_items = Object.keys(street_address_words).map(function(key) {
    return [key, street_address_words[key]];
});

street_address_items.sort(function(first, second) {
    return second[1] - first[1];
});

var test = Math.min(building_items.length, description_items.length, display_address_items.length, feature_items.length, street_address_items.length);


for (var i = 0; i < test - 1; i++) {
	writer.write([
		building_items[i][0], building_items[i][1],
		description_items[i][0], description_items[i][1],
		display_address_items[i][0], display_address_items[i][1],
		feature_items[i][0], feature_items[i][1],
		street_address_items[i][0], street_address_items[i][1]]);
			
}
