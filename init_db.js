// Test PG Locatl
const { Client } = require('pg');
const got = require('got');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = require('agentkeepalive').HttpsAgent;
const {CookieJar} = require('tough-cookie');

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
const SHTBASE = process.env.SHTLINK || "https://www.sehuatang.org/";
const gotInstance = got.extend({
    agent:{
        http: keepAliveHttpAgent,
        https: keepAliveHttpsAgent,
    },
    prefixUrl: SHTBASE,
    cookieJar : cookieJar,
});

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function main(){
    // Init db, 
    try{
        client.connect();
    }catch(err){
        console.error(err);
    }
    console.log("Initializing Database");
    await client.query(`CREATE TABLE IF NOT EXISTS posts(
        id SERIAL PRIMARY KEY,
        url VARCHAR(1000) UNIQUE NOT NULL,
        title VARCHAR(1000) NOT NULL,
        magnet VARCHAR(1000),
        postdate DATE NOT NULL,
        downloaded BOOLEAN
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS downloading(
        id SERIAL PRIMARY KEY,
        url VARCHAR(1000) REFERENCES posts(url)
    );`);

    console.log('Database Initialization finsihed');
    await client.end();
}

main();
