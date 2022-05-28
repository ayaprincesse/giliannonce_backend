const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const multer  = require('multer');
const path = require('path')
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/annonces/')    
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
//get plusieurs annonces
router.get('/', async (req, res,next) => {
    try{
        const annonces=await prisma.annonce.findMany({
            include:{
                imagesannonce: {
                    select:{
                        image:true
                    },
                    take: 1,
                }
            },
            }
        );
        res.status(200).json({
            success:true,
            list_annonces:annonces
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

//get toutes les villes
router.get('/villes', async (req, res,next) => {
    try{
        const villes=await prisma.annonce.findMany({
            distinct: ['Ville'],
            select: {
                Ville: true,
                Id : true,
            }
                    });
        res.status(200).json({
            success:true,
            list_villes:villes
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
//get annonces par ville
router.get('/ville/:nom', async (req, res,next) => {
    try{
       const { nom }=req.params
       const annonce=await prisma.annonce.findMany({
            where: {
              Ville: nom,
            },
            include:{
                imagesannonce: {
                    select:{
                        image:true
                    }
                },
            }
    }); 
        res.status(200).json({
            success:true,
            annonces:annonce
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

//get 1 annonce par id
router.get('/:id', async (req, res,next) => {
    try{
        
       const { id }=req.params
       const annonce=await prisma.annonce.findUnique({
            where: {
              Id: Number(id),
            },
            include:{
                imagesannonce: {
                    select:{
                        image:true
                    }
                },
            }
    }); 
        res.status(200).json({
            success:true,
            annonce:annonce
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


//get annonces by categorie : recherche
router.get('/categorie/:nom', async (req, res,next) => {
    try{      
       const { nom }=req.params
       const annonce=await prisma.annonce.findMany({
            where: {
              CategorieNom: nom,
            },
            include:{
                imagesannonce: {
                    select:{
                        image:true
                    }
                }
            }
    }); 
        res.status(200).json({
            success:true,
            annonce:annonce
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

//get annonces by mot clé : recherche par mot clé (titre)
router.get('/motcle/:terme', async (req, res,next) => {
    try{      
       const { terme }=req.params
       const annonce=await prisma.annonce.findMany({
            where: {
                Titre: {
                    contains: terme,
                },
            },
            include:{
                imagesannonce: {
                    select:{
                        image:true
                    }
                }
            }
    }); 
        res.status(200).json({
            success:true,
            annonce:annonce
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


//create annonce
router.post('/',upload.array('Img_annonce'), async (req, res,next) => {
    try{
        const annonce_added=await prisma.annonce.create({
            data:{
                Titre:req.body.Titre  ,       
                Descriptionn : req.body.Descriptionn,
                DatePublication  : new Date(req.body.DatePublication) ,       
                Ville : req.body.Ville ,           
                CategorieNom  : req.body.CategorieNom,
                ProprietaireId  : parseInt(req.body.ProprietaireId)
            }
        })
        req.files.forEach(async (item)=>{
            await prisma.imagesannonce.create({
                data:{
                    image:item.filename,
                    AnnonceId:annonce_added.Id
                }
            })
        });
        res.status(200).json({
            success:true,
            annonce_added:annonce_added
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

//update annonce infos
router.patch('/:id', async (req, res,next) => {
    try{
        const { id }=req.params
        const updatedAnnonce = await prisma.annonce.update({
            where: {
              Id: Number(id),
            },
            data: {
                Titre:req.body.Titre  ,       
                Descriptionn : req.body.Descriptionn,       
                Ville : req.body.Ville ,           
                CategorieNom  : req.body.CategorieNom
            },
          })
        res.status(200).json({
            success:true,
            annonce_updated:updatedAnnonce
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

//delete annonce
router.delete('/:id', async (req, res,next) => {
    try{
        const { id }=req.params
        await prisma.annonce.delete({
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