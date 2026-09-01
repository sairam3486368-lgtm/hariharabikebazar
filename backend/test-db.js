const mongoose = require('mongoose');

const uri = 'mongodb://sairamvemula15_db_user:gOrpzeDexkGsnlwY@ac-0f3wh96-shard-00-00.qtox3jd.mongodb.net:27017,ac-0f3wh96-shard-00-01.qtox3jd.mongodb.net:27017,ac-0f3wh96-shard-00-02.qtox3jd.mongodb.net:27017/hariharabikebazar?tls=true&replicaSet=atlas-13c5p9-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('Connected!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
