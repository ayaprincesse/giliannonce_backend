const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const multer  = require('multer');
const path = require('path')
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

//add admin
router.post('/', async (req, res,next) => {
    try{
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
router.patch('/:id', async (req, res,next) => {
    try{
        const hashedPassword= await bcrypt.hashSync(req.body.Mdp,10);
        const { id }=req.params
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
router.patch('/updatephoto/:id', upload.single('img_profil'), async (req, res,next) => {
    try{
        const { id }=req.params
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
router.get('/:id', async (req, res,next) => {
    try{
        
       const { id }=req.params
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
router.delete('/:id', async (req, res,next) => {
    try{
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
module.exports=router;