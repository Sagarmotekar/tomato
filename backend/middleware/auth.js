import jwt from 'jsonwebtoken';

const authMiddleware = (req,res,next) =>{
    const {token} = req.headers;
    if(!token){
        return res.json({success:false,message:"Not Unauthorized , Login again"})
    }
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);
        req.body.userId = tokenDecode.id;
        next();
    }
    catch (error) {
        console.log(error);
        return res.json({success:false,message:"error"})
    }
}

export default authMiddleware;