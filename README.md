# MERN setup checklist

This simply creates a stepwise checklist to create a full stack MERN app and deploys it to production. We deploy the production app on Heroku and a sample app is available here, https://github.com/lekansogunle/mern-starter .

* create new directory , I called mine mern-starter
* in your new directory, create another directory, call it client
* in the client directory, run `npx create-react-app .` and wait for the installation to be complete. Now you have your React app. 
* Go into this directory and run `yarn start` to start your react app. you see your shiny app on `http://localhost:3000/`
* Open your MERN project directory in a code editor . In `client/src/App.js`, replace the code in there with the following;
```
import React from 'react';

function App() {
  return (
    <div className="App">
      <p>Hello MERN</p>
    </div>
  );
}

export default App;
```
What this does is just to replace the boiler plate mark-up from react with text “Hello MERN”
* In your MERN project directory(mine is mean-starter), do `npm init`. Accept the defaults for now and after you will be asked to review the new package.json file created. When all is well tap enter to continue.
* At the root of your MERN project install the following packages, `npm install express mongoose dotenv`. You will use Express to create your backend server. Mongoose will help you create a connection to your MongoDB database from your Express server and Dotenv will help to us securely export private credentials. 
* At the root of your MERN project do `npm i  nodemon --save-dev` this installs “nodemon” only for your development environment. Also run `npm i -g nodemon `, this installs Nodemon globally on your machine. Nodemon is useful to start your application because it can watch your file changes and automatically restart your server app. But only useful for development purposes.
* At the root of your MERN project create an index.js file. This is where you will write your server setup.
* The next thing we will do is to create a simple Express server in our index.js. Add this to your index.js;
```
const express = require("express");
const app = express();
app.get('/api/‘, (req, res) => {
  res.json({hello: 'world'})
});

app.listen(process.env.PORT || 4000, () => console.log('APP listening on 4000'));
```
  * 
    * `const express = require("express");` creates an instance of the Express module
    * `const app = express();` creates our server app by initialising express
    * `app.get…` create a GET endpoint `/api/` on our server that returns json `{hello: “world”}`
    * `app.listen…` specifies on which port we want to start our server. This is mostly the last line in your server file. We use a default of port 4000 if no PORT environment variable is specified. 
* Start your server with `nodemon index.js`. Visit “http://localhost:4000/api” and you should see {"hello":"world”}. You should also note that your frontend is also running but on a separate port 3000.
  
* Now is good time to create a commit.
    * Create a .gitignore file at the root of your project and add `/node_modules`. This will prevent you  from checking in your node_modules. 
    * In the client directory, run `rm -rf .git` this will uninitialise this directory as a separate git repo.
    *  At this point you can do a git init at the root of the app, commit your work and push to your remote repository. And maybe take a drink.

* Next, we want to connect our server to MongoDB. If you have not done so, create a free starter account with mongodb at https://www.mongodb.com/cloud/atlas .  In the mongodb atlas web interface, do the following;
    * Create a new cluster 
    * Create a database, give it a database name and you will be requested to create a collection at the same time. You can state a name and make it an empty collection. Note this is a development database. You will have to create another database for production.
    * As part of our DB setup we will allow all ips connect to our database since your apps ip can change from time to time. To do this go to ‘Network Access’ on the side bar. In the IP whitelist tab, click on “Add Ip Adress” and allow all ips.
    * On the sidebar click on clusters and locate the connect button. Click connect and then “connect your appllication”. 
    * You will see a mongo url string starting with “mongodb+srv:…”. Note that you will have to replace <password> with the correct user password you have created.
    * Repeat the above steps and create a production database. You can namespace both databases like so, helloword_development for dev and helloworld_production for production.
* In your server index.js file just below the first line, bring in mongoose with , `const mongoose = require('mongoose');` 
* Next setup Dotenv with `require('dotenv').config();`
* Create a .env file at the root of your project. In the file add in DB_URL=<mongo url> . Replace this with the correct mondo db url you got earlier. Add .env to your .gitignore file.
* Add to your server file ;
```
mongoose.connect(process.env.DB_URL, {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
   useFindAndModify: false
  });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("MongoDB database connection established!");
});
```
First line initiates a mongo connection between your app and your atlas mongodb database using the DB_URL environment variable you created in .env. The parameters passed to the connect enables a suitable configuration for our setup.
Next we take the initialised connection as db and on error  we want to return into the console the connection error. And once we have a successful connection we want to also log a success message. Make sure to do this after `const app = express();` because we want to quickly know if a database connection is possible or not.

* Start your server and you should get an additional console message “MongoDB database connection established!” if you have done everything correctly. And you can now start creating models and schemas on your database with this mongoose connection. You can also make a commit here.
* Next we make the app production ready. But first lets add a proxy to direct our front end app to the backend. In your react package.json add `"proxy": "http://localhost:4000”,`. This is so you can make api requests from your frontend  in your dev environment to endpoints like `/api/backend_routes` . When this kind of route is not present on frontend http://localhost:3000, then your app checks for it on http://localhost:4000. You can read more about it here https://create-react-app.dev/docs/proxying-api-requests-in-development/
* For production, we only need to add certain configurations to make our express app serve our frontend build in production. There, in production we will be running only the backend server.  Before we can do this however, we must create a production build of our React app. This will create static html, css, and javascript files for our frontend app in a /build  folder. This can be done by going into the client folder and running `yarn build`.
* In your backend index.js , first bring in Path module with `const path = require('path’);`. Next, below all route declarations and just above  `app.listen …` command, add the following;
```
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
}); 
```
We want to declare all backend routes before we start to locate frontend by the static files. The first line locates the fresh front end build in `client/build` as static files. The next line catches every other routes not declared on our backend and renders the index.html from our client build which contains our React setup. 
* Start your backend app, `nodemon index.js` visit `http://localhost:4000/`, there you will see the “Hello MERN” which is the text we added on the React app. Now visit `http://localhost:4000/api` you will see ‘{"hello":"world”}’ which is our backend app. Then we have successfully combined both frontend and backend apps on one express server. I will make a commit now.
* Next open a free account with heroku.com if you do not have one. Also install the heroku cli from here https://devcenter.heroku.com/articles/heroku-cli
* In your backend package.json replace scripts with;
```
"scripts": {
  "start": “node index.js",
  "heroku-postbuild": "cd client && npm install && npm run build"
}
```
The first script helps start the app. But more importantly, the next “heroku-postbuild” will be run by Heroku every time we make a new deploy. What is simply to go into the client/React app, install dependencies, and create a fresh production build in /build with we have configured to be served by express. 
* From your terminal login to heroku, run `heroku login`. Add in your heroku credentials
* Create a new heroku app `heroku create`.  When you do this heroku create a new node app for you. You can check it out on your heroku web interface.
* Run `git push heroku master` this is to push your app to heroku . On your app settings page in heroku add a config var which is an environment variable. You only have the DB_URL, add DB_URL as key and add the mongodb url string as value.
* View your new production app with `heroku open`. Heroku will open a url and you can see your MERN app live.


I have built a sample app that makes use of this structure, https://github.com/lekansogunle/resto. It is a restaurant app, you should take a look and note how I seperated backend directories into `controllers`, `models`, and `routes` connected them back to the main index.js server file.
