const axios = require("axios").default;
require("dotenv").config("./../.env");

module.exports = async (req, res) => {
  try {
     
    const data = req.body;

    if (req.method === "POST") {
      const resp = await axios({
        url: `/users.json?auth=${process.env.AUTHTOKEN}`,
        method: 'POST',
        baseURL: `${process.env.DATABASE_USER_URL}`,
        data,
      });

      if(resp.status === 200){
          res.status(200).send('Successfully added a user comment')
      }
    }
    else{
        res.status(400).send('Bad request')
    }
  } catch (e) {
    console.log( e );
  }
};
