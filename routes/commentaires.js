const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

//get comments par annonce 
router.get('/:annonceid', async (req, res,next) => {
    try{
        const { annonceid }=req.params
        const comments=await prisma.commentaires.findMany({
            where:{
                AnnonceId : Number(annonceid),
            },
            include:{
                utilisateurs: {
                    select:{
                        Nom:true,
                        Prenom:true
                    }
                }
            },
        });
        res.status(200).json({
            success:true,
            list_comments:comments
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


//create comment
router.post('/', async (req, res,next) => {
    try{
            const comment_added=await prisma.commentaires.create({
                data:{
                    Contenu: req.body.Contenu,
                    UtilisateurId:parseInt(req.body.UtilisateurId),
                    AnnonceId:parseInt(req.body.AnnonceId)
                }
            })
            res.status(200).json({
                success:true,
                commentaire_added:comment_added
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


//doesnt work
/*
router.post('/add', async (req, res,next) => {
    try{
        const comment=await prisma.commentaires.create({
            data:{
                Contenu:req.body.Contenu,       
                UtilisateurId : req.body.UtilisateurId,
                AnnonceId  : req.body.AnnonceId    
            }
        })
        res.status(200).json({
            success:true,
            comment_added:comment
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
*/

module.exports = router;