const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) =>{

  //first check request header has authorization or not
  const authorization = req.headers.authorization
  if(!authorization) return res.status(401).json({ error: 'Token not Found'});

    // Extract the jwt token from the request header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) res.send(401).json({ error : 'Unauthorized' });

    try{
      //Verify the token
      const decoded= jwt.verify(token, process.env.JWT_SECRET);

      //Attach the user information to the request the object
      req.user = decoded
      next();
    }catch(err){
      console.log(err);
      res.status(401).json({ error: 'Invalid token' });
    }
}

//function to create jwt token
const generateToken = (userData) => {
  //Generate a new token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: 30000});
}

module.exports = { jwtAuthMiddleware, generateToken };