# Imports files in a directory into the attributes database.
# Expects there to be .png files with associated .csv files
# in the specified directory
from pymongo import MongoClient
import sys
import os

phase = sys.argv[1]
scene = sys.argv[2]
dir = sys.argv[3]

client = MongoClient('localhost', 27017)
db = client.attributes
settings = db.settings

files = os.listdir(dir)

for f in files:
	name = os.path.splitext(f)[0]
	ext = os.path.splitext(f)[1]

	if (ext == ".png"):
		descriptor = "";
		with open(dir + '/' + name + '.csv', 'r') as csvFile:
			descriptor = csvFile.read()
		img = { "id" : int(name), "type" : "example", "filename" : f, "descriptor" : descriptor, "scene" : scene, "phase" : int(phase) }
		res = settings.replace_one({"id" : int(name)}, img, True)

		if (res.matched_count == 1):
			print("Updated element with id " + name)
		else:
			print("Inserted element with id " + name)