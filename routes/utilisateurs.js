const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const multer  = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const helper=require('./helpers/authVerify.js');

//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/utilisateurs/')    
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});

//create Utilisateur : créer un compte
// red.body = contenu de request
//res = response
router.post('/', async (req, res,next) => {
    try{
        //hash password
        const hashedPassword=await bcrypt.hashSync(req.body.Mdp,10);
        const user_added=await prisma.utilisateurs.create({
            data:{
                Nom:req.body.Nom,
                Prenom:req.body.Prenom,
                Email: req.body.Email,
                Tel: req.body.Tel,
                Login: req.body.Login,
                Mdp: hashedPassword,
                image:"Img_categorie-1652782531900"
            }
        })
        res.status(200).json({
            success:true,
            user_added:user_added
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


//update user
router.patch('/:id',helper.verifyJWT, async (req, res,next) => {
    try{
        const hashedPassword= await bcrypt.hashSync(req.body.Mdp,10);
        const { id }=req.params;
        if(req.RoleUserConnected!="user" || req.IdUserConnected!=id){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
        }
        const updateduser = await prisma.utilisateurs.update({
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
            user_updated:updateduser
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


//update profile image du user
router.patch('/updatephoto/:id', upload.single('img_profil'), async (req, res,next) => {
    try{
        const { id }=req.params;
        /*if(req.RoleUserConnected!="user" || req.IdUserConnected!=id){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
       }*/
        const updateduser = await prisma.utilisateurs.update({
            where: {
              Id: Number(id),
            },
            data: {
                image:req.file.filename
            },
          })
        res.status(200).json({
            success:true,
            user_updated:updateduser
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

//get utilisateur  par id
router.get('/:id',helper.verifyJWT, async (req, res,next) => {
    try{
       const { id }=req.params;
       if(req.RoleUserConnected!="user" || req.IdUserConnected!=id){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
       }
       const utilisateur=await prisma.utilisateurs.findUnique({
            where: {
              Id: Number(id),
            },
    }); 
        res.status(200).json({
            success:true,
            utilisateur:utilisateur
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

//getuserNumber par son id
router.get('/tel/:id', async (req, res,next) => {
    try{
        const { id }=req.params;
        const utilisateur=await prisma.utilisateurs.findUnique({
             where: {
               Id: Number(id),
             }
     }); 
         res.status(200).json({
             success:true,
             utilisateur:utilisateur
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


//login user
router.post('/login', async (req, res,next) => {
    try{
        const user=await prisma.utilisateurs.findUnique({
            where:{
                Login:req.body.Login
            },
        })
        if(user==null){
            res.status(400).json({
                success:false,
                message:"Username incorrect",
            });
        }
        else{
            let isPasswordCorrect=await bcrypt.compare(req.body.Mdp.toString(),user.Mdp);
            if(isPasswordCorrect) {
                const token=jwt.sign(
                    {id:user.Id,role:"user"}, 
                    "jwtMySecretKey", 
                    { expiresIn: '5h' }
                );
                res.status(200).json({
                    success:true,
                    message:"connexion réussie",
                    token:token,
                    user_logged:user
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
