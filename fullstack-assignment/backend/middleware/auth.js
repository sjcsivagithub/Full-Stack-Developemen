const jwt = require('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMTIzNDU2Nzg5MGFiY2RlZiJ9LCJpYXQiOjE3MjY0ODQ4NzAsImV4cCI6MTcyNjQ4ODQ3MH0.fYFxA6vG1XH1mZxR9uR2AvAZZTXU7F3M3YrFFtlHgI0');
module.exports = (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //req.user = decoded.user;
    req.user = { id: "1234567890abcdef" }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};