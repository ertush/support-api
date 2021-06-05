const axios = require('axios').default;
const admin = require('firebase-admin');
require('dotenv').config('./../.env');
const serviceAccount = require("../../../firebase-private-key/agrarian-ec4bc-firebase-adminsdk-v8k85-03f86c75a0.json")

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `${process.env.DATABASE_ROOT_URI}`,
  databaseAuthVariableOverride: {
    uid: `${process.env.ACCESS_TOKEN}`
  }

});

const firestoreDB = app.firestore();
let errorMessage;

const getSensorData = async (query) => {

  try{
  const responsePayload = {};
  
  if (query.includes("/")){ 
    const rdbsRes = await axios({
      url: `/${query}.json`,
      method: 'get',
      baseURL: `${process.env.DATABASE_ROOT_URI}`,
      params:{
        auth: `${process.env.ACCESS_TOKEN}`
      }
    })


    const [document,] = query.split("/");
    const docRef = firestoreDB.collection("data").doc(document);
    const fsRes = await docRef.get();

    responsePayload["fsPayload"] = fsRes;

    responsePayload["rdbsPayload"] = rdbsRes;

    if(!fsRes._fieldsProto.hasOwnProperty(`${query.split('/')[1]}`) && rdbsRes.data === null) {
      throw new Error('Resource not found, returned with status code 404');
    }

    return responsePayload;
  }

}
catch (e){
  errorMessage = e.message;
} 

}

const postSensorData = async (query, payload) => {
try{

  const responsePayload = {};
  
  if (query.includes("/")){
    
    const rdbsRes = await axios({
      url: `/${query}.json`,
      method: 'put', // can be post append and put for overwrite
      baseURL: `${process.env.DATABASE_ROOT_URI}`,
      data: `${payload[query.split('/')[1]]}`,
      params:{
        auth: `${process.env.ACCESS_TOKEN}`
      }
    }
      );
  

      const [document,] = query.split("/");
      const docRef = firestoreDB.collection("data").doc(document);
      const fsRes = await docRef.set(payload, { merge: true });
  
      responsePayload["fsPayload"] = fsRes;
      responsePayload["rdbsPayload"] = rdbsRes;

    
      return responsePayload;
  }

}
catch(e){
 errorMessage = e.message;
}
}

const updateSensorData = async (query, payload) => {
  try{
    const responsePayload = {};
    
    if (query.includes("/")){
      
  
      const rdbsRes = await axios({
        url: `/${query.split('/')[0]}.json`,
        method: 'patch',
        baseURL: `${process.env.DATABASE_ROOT_URI}`,
        data: `${payload[query.split('/')[1]]}`,
        params:{
          auth: `${process.env.ACCESS_TOKEN}`
        }
      }
        );
        
        const [document,] = query.split("/");
        const docRef = firestoreDB.collection("data").doc(document);
        const fsRes = await docRef.set(payload);
    
        responsePayload["fsPayload"] = fsRes;
        responsePayload["rdbsPayload"] = rdbsRes;

        
  
        
  
        return responsePayload;
    }
  
  }
  catch(e){
   errorMessage = e.message;
  }
}


const deleteSensorData = async (query) => {
  try{
    const responsePayload = {};
    
    if (query.includes("/")){
      
    
      const rdbsRes = await axios({
        url: `/${query}.json`,
        method: 'delete',
        baseURL: `${process.env.DATABASE_ROOT_URI}`,
        params:{
          auth: `${process.env.ACCESS_TOKEN}`
        }
      }
        );
        
  
        const [document,] = query.split("/");
        const docRef = firestoreDB.collection("data").doc(document);
        const fieldObj = () => {
           switch (`${query.split("/")[1]}`) {
             case "temperature":
               return { temperature: admin.firestore.FieldValue.delete() };
             case "humidity":
               return { humidity: admin.firestore.FieldValue.delete() };
             case "soil-moisture":
               return { 'soil-moisture': admin.firestore.FieldValue.delete() };
             case "uv-light":
               return { 'uv-light': admin.firestore.FieldValue.delete() };
             case "atm-pressure":
               return { 'atm-pressure': admin.firestore.FieldValue.delete() };
             case "wind-speed":
                return { 'wind-speed': admin.firestore.FieldValue.delete() };
              case "legit":
                  return { legit: admin.firestore.FieldValue.delete() };
              }

        }
  
        const fsRes = await docRef.update(fieldObj())
    
        responsePayload["fsPayload"] = fsRes;
        responsePayload["rdbsPayload"] = rdbsRes;
  
    
        return responsePayload;
    }
  
  }
  catch(e){
   errorMessage = e.message;
  }
}

module.exports = async (req, res) => {


try{
  switch (req.method) {
    case 'GET':
      const getResponse = await getSensorData(req.query.param)
      if(errorMessage !== undefined){
        if(errorMessage.includes("status code")){
          res.status(parseInt(`${errorMessage.split('status code')[1]}`)).json({message: errorMessage})
          break;
        }
      }
      res.status(200).json(
        {
          integerValue: getResponse.fsPayload._fieldsProto[`${req.query.param.split('/')[1]}`].integerValue, 
          data: getResponse.rdbsPayload.data
        });

      break;
    case 'POST':
      const postResponse = await postSensorData(req.query.param, req.body);
      if(errorMessage !== undefined){
        if(errorMessage.includes("status code")){
          res.status(parseInt(`${errorMessage.split('status code')[1]}`)).json({message: errorMessage})
          break;
        }
      }
      res.status(200).json({
        writeTime : `${new Date(postResponse.fsPayload.writeTime._seconds).getSeconds()} seconds ago`, 
        ...postResponse.rdbsPayload.data
      });

      break;
    case 'PATCH':
        const patchResponse = await updateSensorData(req.query.param, req.body);
        if(errorMessage !== undefined){
          if(errorMessage.includes("status code")){
            res.status(parseInt(`${errorMessage.split('status code')[1]}`)).json({message: errorMessage})
            break;
          }
        }
        res.status(200).json({
          writeTime : `${new Date(patchResponse.fsPayload.writeTime._seconds).getSeconds()} seconds ago`, 
          ...patchResponse.rdbsPayload.data
        });
  
        break;
    case 'DELETE':
           await deleteSensorData(req.query.param, req.body);
          if(errorMessage !== undefined){
            if(errorMessage.includes("status code")){
              res.status(parseInt(`${errorMessage.split('status code')[1]}`)).json({message: errorMessage})
              break;
            }
          }
          
          res.status(200).json({
          message: "resource has been deleted",
          
          });
    
          break;
    default:
      break;
  }
}
catch(e)
{ console.log({e, errorMessage})}

  
}
