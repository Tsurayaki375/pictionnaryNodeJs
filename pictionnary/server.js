var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var logger = require('log4js').getLogger('Server');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var app = express();

// config
app.use(errorHandler());
app.use(cookieParser('S3CR37'));
app.use(cookieSession({
    key: 'app.sess',
    secret: 'SUPERsekret'
}));
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined')); // Active le middleware de logging

// (middleware chargé de base)
var port = process.env.PORT || 1234;
app.listen(port);
logger.info('server start on port ' + port);

// config
app.set('view engine', 'ejs');  
app.set('views', __dirname + '/views');

/* On affiche le formulaire d'enregistrement */

app.get('/', function(req, res){  
    res.redirect('/login');
});

app.get('/header', function(req, res){
    isLog();
    var  prenom = (typeof req.session.prenom == 'undefined' ? "" : req.session.prenom);
    var  photo = (typeof req.session.profilepic == 'undefined' ? "" : req.session.profilepic);

    res.render('header', {
        prenom: prenom,
        photo: photo
    });
});

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pictionnary'
});

function isLog() {
    if(!req.session.loggedIn)
        res.redirect('/');
}

app.get('/login', function(req, res){
   res.render('login');
});

app.post('/login', function (req, res) {  
    // TODO vérifier si l'utilisateur existe
    var email = req.body.email;
    var password  = req.body.password;
    connection.connect();
    connection.query('SELECT * from users WHERE email =? ' , email, function (err, rows) {
        if (rows.length == 0) {
            logger.info("L'utilisateur n'existe pas redirection vers main + error message");
            res.redirect('/main?erreur=1');
            //error1 = 'No account found, try again or register'
        }
        else{
            connection.query('SELECT password from users WHERE email =? ' , email, function (err, row) {
                if(password == row){
                    connection.query('SELECT u.id, u.email, u.nom, u.prenom, u.profilepic FROM USERS u WHERE ' +
                        'u.email =? ' , email, function (err, rows, fields) {
                        if (rows.length < 1) {
                            res.redirect('/main?erreur=2');
                            //error2 = 'This is a problem'
                        }
                        else {
                            var firstResult = rows[0];
                            req.session.id = firstResult['id'];
                            req.session.email = firstResult['email'];
                            req.session.nom = firstResult['nom'];
                            req.session.prenom = firstResult['prenom'];
                            req.session.profilpic = firstResult['profilpic'].toString('utf8');
                            req.session.loggedIn = true;
                            logger.info("L'utilisateur existe : redirection vers main");
                            res.redirect('/main');
                        }
                        connection.end();
                    })
                }
            })
        }
    connection.end();
    });
});

app.get('/profile', function (req, res) {
    connection.connect();
    connection.query('SELECT * from users WHERE email =? ' , email, function (err, rows) {
        var firstResult = rows[0];
        var tel = firstResult['tel'];
        var website = firstResult['website'];
        var sexe = firstResult['sexe'];
        var birthdate = firstResult['birthdate'];
        var ville = firstResult['ville'];
        var taille = firstResult['taille'];
        var couleur = firstResult['couleur'];
    });
    connection.end();

    res.render('profile', {
        email: req.session.email,
        nom: req.session.nom,
        prenom: req.session.prenom,
        tel: tel,
        website: website,
        sexe: sexe,
        birthdate: birthdate,
        ville: ville,
        taille: taille,
        couleur: couleur,
        profilepic: req.session.profilepic
    });
});

app.get('/modification', function (req, res) {
    connection.connect();
    connection.query('SELECT * from users WHERE email =? ' , email, function (err, rows) {
        var firstResult = rows[0];
        var tel = firstResult['tel'];
        var website = firstResult['website'];
        var sexe = firstResult['sexe'];
        var birthdate = firstResult['birthdate'];
        var ville = firstResult['ville'];
        var taille = firstResult['taille'];
        var couleur = firstResult['couleur'];
    });
    connection.end();

    res.render('modification', {
        email: req.session.email,
        nom: req.session.nom,
        prenom: req.session.prenom,
        tel: tel,
        website: website,
        sexe: sexe,
        birthdate: birthdate,
        ville: ville,
        taille: taille,
        couleur: couleur,
        profilepic: req.session.profilepic
    });
});

app.post('/modification', function (req, res){
    connection.connect();
    var newsData = {
        email : req.body.email,
        password : req.body.password,
        nom : req.body.nom,
        tel : req.body.tel,
        website : req.body.website,
        ville : req.body.ville,
        taille : req.body.taille,
        couleur : req.body.couleur,
        profilepic : req.body.profilepic
    };
    connection.query('UPDATE users SET ? where id= ?',[newsData,req.session.id], function(err, results) {
        req.session.email = req.body.email;
        req.session.nom = req.body.nom;
        req.session.prenom = req.body.prenom;
        req.session.profilepic = req.body.profilepic;
    });
    res.redirect('/profile');
    connection.end();
});

app.get('/delete', function (req, res) {
    connection.connect();
    connection.query("Delete * FROM users WHERE id=? ", req.session.iduser, function(err, rows) {
    });
    connection.end();
    res.render('delete');
});

app.get('/register', function (req, res) {
    // TODO ajouter un nouveau utilisateur
    var password = (typeof req.query.password == 'undefined' ? "" : req.query.password);
    var nom = (typeof req.query.nom == 'undefined' ? "" : req.query.nom);
    var prenom = (typeof req.query.prenom == 'undefined' ? "" : req.query.prenom);
    var tel = (typeof req.query.tel == 'undefined' ? "" : req.query.tel);
    var website = (typeof req.query.website == 'undefined' ? "" : req.query.website);
    var sexe = (typeof req.query.sexe == 'undefined' ? "" : req.query.sexe);
    var birthdate = (typeof req.query.birthdate == 'undefined' ? "" : req.query.birthdate);
    var ville = (typeof req.query.ville == 'undefined' ? "" : req.query.ville);
    var taille = (typeof req.query.taille == 'undefined' ? "" : req.query.taille);
    var couleur = (typeof req.query.couleur == 'undefined' ? "" : req.query.couleur);
    var profilepic = (typeof req.query.profilepic == 'undefined' ? "" : req.query.profilepic);
    var erreur = (typeof req.query.erreur == 'undefined' ? "" : req.query.erreur);

    if(erreur == true)
        req.flash('erreur', 'ERROR : There are already a registered user with this email, please choose another');

    res.render('register', {
        password: password,
        nom: nom,
        prenom: prenom,
        tel: tel,
        website: website,
        sexe: sexe,
        birthdate: birthdate,
        ville: ville,
        taille: taille,
        couleur: couleur,
        profilepic: profilepic,
        erreur: req.flash('erreur')
    });
});

app.post('/register', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var nom = req.body.nom;
    var prenom = req.body.prenom;
    var tel = req.body.tel;
    var website = req.body.website;
    var sexe = req.body.sexe;
    var birthdate = req.body.birthdate;
    var ville = req.body.ville;
    var taille = req.body.taille;
    var couleur = req.body.couleur;
    var profilepic = req.body.profilepic;

    connection.connect();
    connection.query('SELECT * from users WHERE email =? ' , email, function (err, rows) {
        if (rows.length >= 1) {
            var url = '/register?password=' + password + '&nom=' + nom + '&prenom=' + prenom +
            '&tel=' + tel + '&website=' + website + '&sexe=' + sexe + '&birthdate=' + birhdate + '&ville=' + ville
            + '&taille=' + taille + '&couleur=' + couleur + '&erreur=true';
            res.redirect(url);
        }
        else {
            var post = {
                email: email,
                password: password,
                nom: nom,
                prenom: prenom,
                tel: tel,
                website: website,
                sexe: sexe,
                birthdate: birthdate,
                age: age,
                ville: ville,
                taille: taille,
                couleur: couleur,
                profilepic: profilepic
            };
            connection.query('INSERT INTO users VALUES ?', post, function (err, result) {
                if (!err)
                    logger.info('Le résultat de la requête: ', result);
                else
                    logger.error(err);
            });

            connection.query('SELECT u.id, u.email, u.nom, u.prenom, u.couleur, u.profilepic FROM USERS u WHERE ' +
                'u.email=? ' , email, function (err, rows) {
                var firstResult = rows[0];
                req.session.id = firstResult['id'];
                req.session.email = firstResult['email'];
                req.session.nom = firstResult['nom'];
                req.session.prenom = firstResult['prenom'];
                req.session.couleur = firstResult['couleur'];
                req.session.profilpic = firstResult['profilpic'];
                req.session.loggedIn = true;
            });
            res.redirect('/main');
        }
    });

});

app.get('/main', function(req, res) {
    var error = (typeof req.query.erreur == 'undefined' ? "" : req.query.erreur);

    if(error == 1)
        req.flash('erreur', 'ERROR : No account found, try again or register');
    if(error == 2)
        req.flash('erreur', 'ERROR : This is a problem');

    res.render('main', {error: req.flash('erreur')});
});

app.get('/logout', function(req, res) {
    req.session = null;
    req.session.destroy();
    res.redirect('/');
});
