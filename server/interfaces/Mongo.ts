import { MongoClient } from "mongodb";
import assert from "assert";

// Connection URL
const url = "mongodb://localhost:27017";

class Mongo {
  private mongo: MongoClient;

  constructor({ mongo }: { mongo: MongoClient }) {
    this.mongo = mongo;
  }
}

