const { Client } = require('pg');
const express = require('express');
const app = express();
const humanInterval = require('human-interval');
const got = require('got');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = require('agentkeepalive').HttpsAgent;
const {CookieJar} = require('tough-cookie');
const http = require('http');
const httpProxy = require('http-proxy');
const request = require('request');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const proxy = httpProxy.createProxyServer({
	target: 'ws://localhost:6800',
	ws: true
});
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const ARIA_SECRET = process.env.ARIA2C_SECRET || 'test';
const SHTBASE = process.env.SHTLINK || "https://www.sehuatang.org/";
const APPNAME = process.env.HEROKU_APP_NAME || null;
const CFLINK = process.env.CFLINK || null;
const keepAliveHttpAgent = new HttpAgent({
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000, // active socket keepalive for 60 seconds
    freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});
const keepAliveHttpsAgent = new HttpsAgent({
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000, // active socket keepalive for 60 seconds
    freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

const cookieJar = new CookieJar();

// const axiosInstance = axios.create({httpsAgent: keepAliveHttpsAgent});
const gotInstance = got.extend({
    agent:{
        http: keepAliveHttpAgent,
        https: keepAliveHttpsAgent,
    },
    prefixUrl: SHTBASE,
    cookieJar : cookieJar,
});


// Proxy websocket
server.on('upgrade', (req, socket, head) => {
	proxy.ws(req, socket, head)
});

//Handle normal http traffic
app.use('/jsonrpc', (req, res) => {
	req.pipe(request('http://localhost:6800/jsonrpc')).pipe(res)
});

app.get('/',function(req,res){
    res.send('Hello world!');
})

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));



async function cleanOldPost(latestDate){
    const query = `select * FROM posts
    where postdate <  TO_DATE($1,'YYYY-MM-DD') - INTERVAL '15 days'
    AND downloaded = true;`;
    const result = await client.query(query,[latestDate]);
    for (const doc of result.rows){
        const title = doc['title'];
        const delete_query = `DELETE FROM downloading
        WHERE title = $1;`;
        await client.query(delete_query,[title]);
    }
}
