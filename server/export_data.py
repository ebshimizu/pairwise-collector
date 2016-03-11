# Exports data to a csv document
# The element in position (x, y) indicates how many times x was preferred over y
from pymongo import MongoClient
import sys
import os

outputLoc = sys.argv[1]

client = MongoClient('localhost', 27017)
db = client.attributes

attrs = db.settings.find({"type" : "attribute"})
examples = db.settings.find({"type" : "example"})

print ("Found " + str(attrs.count()) + " attributes with " + str(examples.count()) + " examples")

for attr in attrs:
	# gathers all data and sticks it into a dictionary where each
	# key corresponds to an array
	print ("Exporting data for " + attr["name"])
	gather = {}

	for i in range(1, examples.count() + 1):
		gather[i] = [0]*examples.count()

	data = db.data.find({"attribute" : attr["name"]})

	# Place data into proper position in 2D dictionary
	for d in data:
		x = d["x"]
		y = d["y"]
		xPy = 0
		yPx = 0

		if "xPy" in d:
			xPy = d["xPy"]
		if "yPx" in d:
			yPx = d["yPx"]

		gather[x][y-1] = yPx
		gather[y][x-1] = xPy

	# write data object to csv
	f = open(outputLoc + "/" + attr["name"] + ".csv", 'w')
	strings = []

	for row in gather:
		# create string 
		strings.append(",".join(map(str, gather[row])))

	f.write("\n".join(strings))


features = [""] * (examples.count()+1);

print ("Exporting feature vectors")
# Output features as well
for example in examples:
	features[example["id"]] = example["descriptor"]

features.pop(0);
f = open(outputLoc + "/" + "features.csv", 'w')
f.write("\n".join(features))
