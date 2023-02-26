const { MongoClient, ServerApiVersion } = require('mongodb')

const dbPROD = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bbkeaad.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
const dbDEV = 'mongodb://127.0.0.1:27017/advogadoszr'
const uri = dbDEV

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