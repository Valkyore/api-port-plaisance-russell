Documentation d'Installation et d'Utilisation du Projet API Port de Plaisance Russell
Cette documentation explique comment installer, lancer et utiliser l'API localement sur votre PC, ainsi que sur Render. L'API gère les utilisateurs, catways et réservations avec Express.js, MongoDB, authentification JWT et vues EJS.

Prérequis

Node.js 
npm
MongoDB Atlas et/ou MongoDB Compass:
Localement : Installez MongoDB Community Server .
Ou utilisez MongoDB Atlas pour le cloud .

Étape 1 – Cloner le projet
git clone https://github.com/Valkyore/api-port-plaisance-russell.git
cd api-port-plaisance-russell

Étape 2 – Installer les dépendances

npm install

Dépendances principales installées :

express
mongoose
bcrypt / bcryptjs
jsonwebtoken
cookie-parser
dotenv
ejs
method-override
swagger-ui-express
express-validator

Dev dependencies :

nodemon
mocha + chai + supertest
jsdoc

Étape 3 – Configurer le fichier .env
Crée (ou modifie) le fichier .env à la racine avec exactement ce contenu :
PORT=3000
MONGO_URI=mongodb+srv://alexmille_db_user:F4lk2240@essai.zuou2oz.mongodb.net/port_russell_db?retryWrites=true&w=majority
JWT_SECRET=ta_clé_super_longue_et_secrète_au_moins_32_caractères

Étape 4 – Lancement en local
Mode développement (avec rechargement auto)
npm run dev

Mode production (comme sur Render)
npm start

Ou directement :
node server.js

Étape 5 – Créer l’utilisateur test (local)
http://localhost:3000/create-test-user
→ Cela supprime l’ancien utilisateur test (si présent) et en recrée un nouveau :
Vous pouvez ensuite vous connecter avec ces identifiants sur la page d’accueil.


Accédez à l'API :
Page d'accueil : http://localhost:3000/
Documentation : http://localhost:3000/docs
Dashboard (après login) : http://localhost:3000/dashboard

Étape 6 – Créer l’utilisateur test sur Render
https://api-port-plaisance-russell-yvxz.onrender.com/

ouvrir simplement https://api-port-plaisance-russell-XXXX.onrender.com/create-test-user

Étape 8 – Utilisation courante

Action    ,                URL locale   ,                                   URL Render
Page d’accueil,            http://localhost:3000,                           https://ton-app.onrender.com
Documentation API,         http://localhost:3000/docs,                      https://ton-app.onrender.com/docs
Créer utilisateur test,    http://localhost:3000/create-test-user,          https://ton-app.onrender.com/create-test-user
Connexion,                 Formulaire sur /,                                Même chose
Dashboard (après login),   http://localhost:3000/dashboard,                 https://ton-app.onrender.com/dashboard

Sur le plan Free de Render : l’application se met en veille après ~15 min d’inactivité → premier appel suivant prend 10–40 secondes.
Les logs sont visibles dans l’interface Render → onglet Logs (très utile pour debugger Mongo ou JWT).
