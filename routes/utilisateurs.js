const router = require('express').Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const bcrypt = require('bcrypt');

//create Utilisateur
//req = request
// red.body = contenu de request
//res = response
router.post('/add', async (req, res,next) => {
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
                Mdp: hashedPassword
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

module.exports=router;