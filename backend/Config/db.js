const mongoose =require('mongoose');

const connectDB=async()=>{
    try{
        const uri = process.env.MONGO_URI;
        if(!uri) throw new Error ('MONGO_URI not set in env');
        await mongoose.connect(uri,{ });
        console.log('MongoDB Connected');
        
    } catch (err){
        console.log.error('MongoDb connection error:', err.message);
        process.exit(1);
    }
};
module.exports =connectDB;