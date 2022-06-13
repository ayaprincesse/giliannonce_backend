const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const helper=require('./helpers/authVerify.js');

//get signal with titre de lannonce signalé et data du user signaleur
router.get('/:idannonce',helper.verifyJWT,  async (req, res,next) => {
    try{
        const { idannonce }=req.params;
        if(req.RoleUserConnected!="admin"){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
        }
        const signals=await prisma.signalannonce.findMany({
            where: {
                AnnonceId: Number(idannonce),
            },
            include:{
                annonce: {
                    select:{
                        Titre:true
                    }
                },
                utilisateurs: {
                    select:{
                        Nom:true,
                        Prenom:true,
                        Email:true
                    }
                }
            },
        });
        res.status(200).json({
            success:true,
            list_signals:signals
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

//create
router.post('/',helper.verifyJWT, async (req, res,next) => {
    try{
        if(req.RoleUserConnected!="user" ){
            res.status(401).json({
                success:false,
                message:"Vous n'êtes pas autorisé à faire cette action"
            });
            return;
        }
        const signal=await prisma.signalannonce.create({
            data:{      
                SignaleurId: parseInt(req.body.SignaleurId),      
                AnnonceId: parseInt(req.body.AnnonceId),
                DescriptionRaison: req.body.DescriptionRaison 
            }
        })
        res.status(200).json({
            success:true,
            signal_added:signal
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