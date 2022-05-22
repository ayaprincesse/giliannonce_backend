const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const multer  = require('multer');
const path = require('path')
//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/categories/')    
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});

//create categorie
router.post('/add', upload.single('Img_categorie'), async (req, res,next) => {
    try{
            const categorie_added=await prisma.categorie.create({
                data:{
                    Nom:req.body.Nom,
                    image:req.file.filename
                }
            })
            res.status(200).json({
                success:true,
                categorie_added:categorie_added
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

//get all categories avec nb annonces dans chacune
router.get('/', async (req, res,next) => {
    try{
        const categories=await prisma.categorie.findMany({
            include:{
                _count: {
                    select: {
                        annonce:true
                    }
                }
            }
        })
        res.status(200).json({
            success:true,
            list_categories:categories
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

//update cat img
router.patch('/updateimg/:id', upload.single('Img_categorie'), async (req, res,next) => {
    try{
        const { id }=req.params
        const updatedcat = await prisma.categorie.update({
            where: {
              Id: Number(id),
            },
            data: {
                image:req.file.filename
            },
          })
        res.status(200).json({
            success:true,
            cat_updated:updatedcat
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

//update cat
router.patch('/:id', async (req, res,next) => {
    try{
        const { id }=req.params;
        const categorie=await prisma.categorie.findUnique({
            where: {
                Id: Number(id),
            },
            include:{
                _count: {
                    select: {
                        annonce:true
                    }
                }
            }
        });
        if(categorie._count.annonce>0){
            res.status(400).json({
                success:false,
                message:"Vous ne pouvez pas changer le nom d'une catégorie qui a déjà des annonces",
            });
        }
        else{
            const updatedcat = await prisma.categorie.update({
                where: {
                  Id: Number(id),
                },
                data: {
                    Nom:req.body.Nom
                },
              })
            res.status(200).json({
                success:true,
                cat_updated:updatedcat
            });
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