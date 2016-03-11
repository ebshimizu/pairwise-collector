# Adds a new attribute to the database
from pymongo import MongoClient
import sys
import os

attr = sys.argv[1]

client = MongoClient('localhost', 27017)
db = client.attributes
settings = db.settings

print("Adding attribute option: " + attr)
settings.insert_one({ "name" : attr, "type" : "attribute" })