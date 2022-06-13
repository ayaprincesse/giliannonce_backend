
const jwt = require('jsonwebtoken');
exports.verifyJWT=(req,res,next)=>{
    const token=req.headers["x-access-token"];
    if(!token){
        res.status(401).json({
            success:false,
            status:"TokenInvalid",
            message:"Session expirée! Veuillez vous reconnecter",
            details:"Token required",
        });
    }
    else{
        jwt.verify(token,"jwtMySecretKey",(error,decoded)=>{
            if(error){
                res.status(401).json({
                    success:false,
                    status:"TokenInvalid",
                    message:"Session expirée! Veuillez vous reconnecter",
                    details:error.message,
                });
            }
            else{
                req.IdUserConnected=decoded.id;
                req.RoleUserConnected=decoded.role;
                next();
            }
        })
    }
}

//module.exports = verifyJWT