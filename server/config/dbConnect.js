import mongoose from "mongoose";

const connectDb = async () => {
      if (process.env.NODE_ENV === 'test') return; // ⛔ لا تتصل أثناء التست

    try{
        await mongoose.connect(
            // process.env.DBURI
            'mongodb+srv://nfayrws:root**44@cluster0.hvwc12n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
            ,{

    });
    console.log("✅ MongoDB Connected Successfully");
    
}catch(err){
    console.error("❌ MongoDB Connection Failed:", err);
    // process.exit(1);
}

}

export default connectDb;