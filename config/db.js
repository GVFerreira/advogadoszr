const { MongoClient, ServerApiVersion } = require('mongodb')

const uri = "mongodb+srv://gustavo_admin:UPsqha23mljKbA4T@cluster0.bbkeaad.mongodb.net/rzadvogados?retryWrites=true&w=majority"

const client = new MongoClient(
  uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
  }
)

client.connect(err => {
  const collection = client.db("test").collection("devices")
  client.close()
})