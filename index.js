const router = require('express').Router()
const express = require('express')
const app = express()
var bodyParser = require('body-parser')
app.use(express.json())
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static("public"));
const cors = require("cors")
app.use(cors())

app.use('/annonce',require('./routes/annonce'));
app.use('/categorie',require('./routes/categorie'));
app.use('/utilisateurs',require('./routes/utilisateurs'));
app.use('/administrateurs',require('./routes/administrateurs'));
app.use('/commentaires',require('./routes/commentaires'));
app.use('/signal',require('./routes/signal'));

//***************************************************test part*******************************************
app.get('/test', function(req, res,next){
   //example1:return text
   res.send("Hello world!");
   //example2: return json (success case)
   /*res.status(200).json({
    success:true,
    message:"hello again"
    });*/
    //example3: send json error 400 case=error because of data received in request)
    /*res.status(400).json({
        success:false,
        message:"Veuillez vérifier les données saisies"
    });*/
    //example2: send json error 500 case=error from server
    /*res.status(500).json({
        success:false,
        message:"Une erreur s'est produite lors du traitement de votre demande"
    });*/
});
//***************************************************end test part*******************************************

module.exports = router;
app.listen(3001);