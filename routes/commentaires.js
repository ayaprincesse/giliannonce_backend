const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const helper=require('./helpers/authVerify.js');
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
                        Prenom:true,
                        image:true,
                    }
                }
            },
        });
        res.status(200).json({
            success:true,
            listcomments:comments
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
router.post('/',helper.verifyJWT, async (req, res,next) => {
    try{
        if(req.RoleUserConnected!="user" ){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
        }
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



module.exports = router;