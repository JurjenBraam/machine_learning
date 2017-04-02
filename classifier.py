import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
from sklearn import datasets
from sklearn.metrics import log_loss
from sklearn.ensemble import GradientBoostingClassifier  as GBM
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import KFold

# Calculate the score for a feature list
def calculate_scorelist(feature_list):
	string = " ".join(feature_list).lower()
	score = 0
	if len(string) > 1:
		for row in feature_scores.itertuples():
			word = row[1]
			if string.find(word) > 0:
				score += float(row[2].replace(",", '.'))

	return score

# Calculate the score for a string using the tabel
def calculate_score(string, table):
	score = 0
	string = string.lower()
	for row in table.itertuples():
		word = str(row[1])
		if word in string:
			score += float(row[2].replace(",", '.'))
	return score


# Calculate the score using the coordinates
def calculate_gpsscore(latitude, longitude):
	score = 0
	for row in gps_zones.itertuples():
		if round(latitude, 2) >= float(row[1].replace(",", ".")) and \
		round(longitude, 2) >= float(row[2].replace(",", ".")):
			score = float(row[3].replace(",", "."))
	return score


# Initializing the classifier
gbm = GBM(max_features = 'auto',n_estimators=200,random_state=1)

label_column = 'interest_level'
num_classes = 3

# Load the train and test data
train = pd.read_json("./input/train.json")
test = pd.read_json("./input/test.json")

# Load calculated scores from csv files
feature_scores = pd.read_csv("./input/feature.csv", sep=';')
building_id_score = pd.read_csv("./input/buildingid.csv", sep=';')
gps_zones = pd.read_csv("./input/coordinateszones.csv", sep=';').sort_values(by="Latitude")
street_scores = pd.read_csv("./input/street.csv", sep=';')
description_score = pd.read_csv("./input/description.csv", sep=';')


# # Make the label numeric
label_map = pd.Series({'low': 2, 'medium': 1, 'high': 0})
train[label_column] = label_map[train[label_column]].values


# # Add test data to train data to calculate features also for test data
all_data = train.append(test)
all_data.set_index('listing_id', inplace=True)

# Filter the bad coordinates
all_data['bad_addr'] = 0
mask = ~all_data['latitude'].between(40.5, 40.9)
mask = mask | ~all_data['longitude'].between(-74.05, -73.7)
bad_rows = all_data[mask]
all_data.loc[mask, 'bad_addr'] = 1


# Replace bad cordinates with mean coordinates
mean_lat = all_data.loc[all_data['bad_addr']==0, 'latitude'].mean()
all_data.loc[all_data['bad_addr']==1, 'latitude'] = mean_lat
mean_long = all_data.loc[all_data['bad_addr']==0, 'longitude'].mean()
all_data.loc[all_data['bad_addr']==1, 'longitude'] = mean_long


# Adding the derived scores to the dataframe
all_data['feature_score'] = all_data['features'].apply(calculate_scorelist)
all_data['building_id_score'] = all_data.apply(lambda row: calculate_score(row['building_id'], building_id_score), axis=1)
all_data['gps_score'] = all_data.apply(lambda row: calculate_gpsscore(row['latitude'], row['longitude']), axis=1)
all_data['description_score'] = all_data.apply(lambda row: calculate_score(row['description'], description_score), axis=1)
all_data['street_score'] = all_data.apply(lambda row: calculate_score(row['street_address'], street_scores), axis=1)
all_data['photos'] = all_data['photos'].apply(len)
all_data['features'] = all_data['features'].apply(len)
all_data['description'] = all_data['description'].apply(len)
all_data['upload_hour'] = all_data.apply(lambda row: float(row['created'][11:13]), axis=1)


# Remove the colums which aren't used by the classifier
drop_cols = ['display_address', 'street_address',
'created','building_id','manager_id', 'bad_addr']
all_data.drop(drop_cols, axis=1, inplace=True)

# Devide the data into labeled train data and unlabeled test data
mask = all_data[label_column].isnull()
train = all_data[~mask].copy()
test = all_data[mask].copy()

data_columns = all_data.columns.tolist()
data_columns.remove(label_column)

# Store the values in X
X = train[data_columns].values
# Store the labels in y
y = train[label_column].values

# Run the classifier using 3 fold Cross Validation and print mean accuracy of the 3 runs
scores = cross_val_score(gbm, X, y, cv=3)
print("Accuracy: %0.2f (+/- %0.2f)" % (scores.mean(), scores.std() * 2))


# Calculate model on the whole dataset
gbm.fit(X, y)

# Predict values for the test data
test_pred = gbm.predict_proba(test[data_columns].values)

# Write data to csv file
test_out = pd.DataFrame(test_pred, columns = ['high', 'medium', 'low'], index=test.index)
test_out.to_csv('out.csv')
