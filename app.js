
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

// Instantiating the express app
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

// INstantiating the express-jwt middleware
const jwtMW = exjwt({
    secret: 'this is a complicated secret'
});

function virifyToken(req, res, next) {
    const token = req.headers['Authorization'];
    if (!token) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }
    const decoded = jwt.verify(token, jwtMW);
    req.username = decoded.username;
    next();
}

// Setting up bodyParser to use json and set it to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// MOCKING DB 
let users = [
    {
        id: 1,
        username: 'test',
        password: 'asdf123'
    },
    {
        id: 2,
        username: 'test2',
        password: 'asdf12345'
    }
];

// LOGIN ROUTE
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Use your DB ORM logic here to find user and compare password

    // Finds first username and password match in users array (assumes usernames are unique)
    var user = users.find(u => username == u.username && password == u.password);
    if (user) { // User credentials matched (are valid)
        let token = jwt.sign({ id: user.id, username: user.username }, 'keyboard cat 4 ever', { expiresIn: 129600 }); // Sigining the token
        res.json({
            sucess: true,
            err: null,
            token
        });

    } else { // User credentials did not match (are not valid) or no user with this username/password exists
        res.status(401).json({
            sucess: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

app.get('/', jwtMW /* Using the express jwt MW here */, (req, res) => {
    res.send('You are authenticated'); //Sending some response when authenticated
});

app.post('/login/verify', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }
    const decoded = jwt.verify(token, jwtMW);
    res.status(200).send(decoded.username);

})

// Error handling 
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') { // Send the error rather than to show it on the console
        res.status(401).send(err);
    }
    else {
        next(err);
    }
});

// Starting the app on PORT 3001
const PORT = 3001;
app.listen(PORT, () => {
    // eslint-disable-next-line
    console.log(`Magic happens on port ${PORT}`);
});
