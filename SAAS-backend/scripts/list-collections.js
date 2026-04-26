// Script to list all MongoDB collections
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saas';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\n📊 Collections in database:');
    console.log('========================');
    
    if (collections.length === 0) {
      console.log('No collections found. Collections will be created automatically when you save data.');
    } else {
      collections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
      });
    }
    
    // Count documents in each collection
    console.log('\n📈 Document counts:');
    console.log('==================');
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }
    
    mongoose.connection.close();
    console.log('\n✅ Done!');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

