const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

//get signal with titre de lannonce signalé et data du user signaleur
router.get('/', async (req, res,next) => {
    try{
        const signals=await prisma.signalannonce.findMany({
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
//doesnt work
router.post('/', async (req, res,next) => {
    try{
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