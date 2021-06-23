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
          
          
          res.redirect(`${process.env.REDIRECT_URL}`)
          res.status(200).send('Successfuly sent your message. Thank You!')
      }
      else{
        res.status(resp.status).send(resp.statusText)
      }
    }
    else{
        res.status(400).send('Bad request')
    }
  } catch (e) {
    console.log( e );
  }
};
