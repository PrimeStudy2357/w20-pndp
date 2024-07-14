const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc').Strategy;

require('dotenv').config();

const app = express();

//EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');

//세션 설정
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    }),
);

//Passport.js 설정
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/google/callback',
            scope: ['profile'],
        },
        function (issuer, profile, callback) {
            //로그인 성공 시 사용자 정보 처리 로직 부분

            //보통 여기서 Google 계정으로 최초 로그인 시 회원가입을 진행

            //로직 처리 후 세션에 계정 정보를 담아 보내는 로직 실행
            return callback(null, { issuer, ...profile });
        },
    ),
);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

//라우팅
app.get('/', (req, res) => {
    if (!!req.user) console.log(req.user); //실습 데이터 확인용 로깅

    //Google 로그인이 성공할 경우 요청 객체(req)의 user에 사용자 정보가 담긴다.
    res.render('index', {
        isSigned: !!req.user,
        username: req.user?.displayName,
    });
});

//구글로 로그인 기능 요청 URL
app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile'] }),
);

//구글로 로그인 요청이 성공했을 때 어디로 리다이렉트 하면 되는지 알려주는 라우팅
app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        //로그인 성공 시 홈페이지로 리다이렉트
        res.redirect('/');
    },
);

app.post('/logout', (req, res) => {
    req.logout(() => {
        //로그아웃 후 홈페이지로 리다이렉트
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});