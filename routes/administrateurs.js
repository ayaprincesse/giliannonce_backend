const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const multer  = require('multer');
const path = require('path')
const helper=require('./helpers/authVerify.js');
const jwt = require('jsonwebtoken');
//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/administrateurs/')    
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
//get admins 
router.get('/',helper.verifyJWT, async (req, res,next) => {
    try{
        if(req.RoleUserConnected!="admin"){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
}
        const admins=await prisma.administrateurs.findMany({
        })
        res.status(200).json({
            success:true,
            list_admins:admins
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Une erreur s'est produite lors du traitement de votre demande",
            details:error.message
        });
    }
})

//add admin
router.post('/', async (req, res,next) => {
    try{
        {/*}
        if(req.RoleUserConnected!="admin"){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
        */
}
        //hash password
        const hashedPassword = await bcrypt.hashSync(req.body.Mdp,10);
        const admin_added= await prisma.administrateurs.create({
            data:{
                Nom:req.body.Nom,
                Prenom:req.body.Prenom,
                Email: req.body.Email,
                Tel: req.body.Tel,
                Login: req.body.Login,
                Mdp: hashedPassword
            }
        })
        res.status(200).json({
            success:true,
            admin_added:admin_added
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Une erreur s'est produite lors du traitement de votre demande",
            details:error.message
        });
    }
})

//update admin
router.patch('/:id',helper.verifyJWT, async (req, res,next) => {
    try{
        const { id }=req.params
        if(req.RoleUserConnected!="admin" || req.IdUserConnected!=id){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
}
        const hashedPassword= await bcrypt.hashSync(req.body.Mdp,10);
        
        const updatedadmin = await prisma.administrateurs.update({
            where: {
              Id: Number(id),
            },
            data: {
                Nom:req.body.Nom,
                Prenom:req.body.Prenom,
                Email: req.body.Email,
                Tel: req.body.Tel,
                Login: req.body.Login,
                Mdp: hashedPassword
            },
          })
        res.status(200).json({
            success:true,
            updated_admin:updatedadmin
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Une erreur s'est produite lors du traitement de votre demande",
            details:error.message,
        });
    }
})


//update profile image du admin
router.patch('/updatephoto/:id', upload.single('img_profil'),helper.verifyJWT, async (req, res,next) => {
    try{
        const { id }=req.params;
        if(req.RoleUserConnected!="admin" || req.IdUserConnected!=id){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
        }
        
        const updatedadmin = await prisma.administrateurs.update({
            where: {
              Id: Number(id),
            },
            data: {
                image:req.file.filename
            },
          })
        res.status(200).json({
            success:true,
            admin_updated:updatedadmin
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Une erreur s'est produite lors du traitement de votre demande",
            details:error.message,
        });
    }
})

//get admin  par id
router.get('/:id',helper.verifyJWT, async (req, res,next) => {
    try{
        const { id }=req.params;
        if(req.RoleUserConnected!="admin" || req.IdUserConnected!=id){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
        }
       
       const admin=await prisma.administrateurs.findUnique({
            where: {
              Id: Number(id),
            },
    }); 
        res.status(200).json({
            success:true,
            admin:admin
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Une erreur s'est produite lors du traitement de votre demande",
            details:error.message
        });
    }
})

//delete admin
router.delete('/:id',helper.verifyJWT, async (req, res,next) => {
    try{
        if(req.RoleUserConnected!="admin" ){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
}
        const { id }=req.params
        await prisma.administrateurs.delete({
            where: {
              Id: Number(id),
            },
          })
        res.status(200).json({
            success:true,
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Une erreur s'est produite lors du traitement de votre demande",
            details:error.message
        });
    }
})


//login admin
router.post('/login', async (req, res,next) => {
    try{
        const admin=await prisma.administrateurs.findUnique({
            where:{
                Login:req.body.Login
            },
        })
        if(admin==null){
            res.status(400).json({
                success:false,
                message:"Username incorrect",
            });
        }
        else{
            let isPasswordCorrect=await bcrypt.compare(req.body.Mdp.toString(),admin.Mdp);
            if(isPasswordCorrect) {
                const token=jwt.sign(
                    {id:admin.Id,role:"admin"}, 
                    "jwtMySecretKey", 
                    { expiresIn: '1d' }
                );
                res.status(200).json({
                    success:true,
                    message:"connexion réussie",
                    token:token,
                    admin_logged:admin
                });
            }
            else{
                res.status(400).json({
                    success:false,
                    message:"Mot de passe incorrect",
                });
            }
        }
       
    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Une erreur s'est produite lors du traitement de votre demande",
            details:error.message
        });
    }
})


module.exports=router;