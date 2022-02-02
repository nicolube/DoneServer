const dev= {
    "apiURL": "http://localhost:3002/api"
}

const production = {
    "apiURL": "/api"
}

const config = process.env.NODE_ENV === "development" ? dev : production;

export default config;