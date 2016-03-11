# Clears all data from the database, but leaves the core settings
# record intact.
from pymongo import MongoClient
import sys
import os

client = MongoClient('localhost', 27017)
db = client.attributes

db.users.delete_many({})
db.data.delete_many({})
db.settings.delete_many({"type" : "example"})
db.settings.delete_many({"type" : "attribute"})