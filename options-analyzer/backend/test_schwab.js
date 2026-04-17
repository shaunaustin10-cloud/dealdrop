require('dotenv').config();
const axios = require('axios');

async function test() {
    const clientId = process.env.SCHWAB_CLIENT_ID;
    const clientSecret = process.env.SCHWAB_CLIENT_SECRET;
    const redirectUri = process.env.SCHWAB_REDIRECT_URI;
    
    console.log("clientId:", clientId);
    console.log("clientSecret:", clientSecret);
    console.log("redirectUri:", redirectUri);
    
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', 'fake_code_12345');
    params.append('redirect_uri', redirectUri);

    try {
        const response = await axios.post('https://api.schwabapi.com/v1/oauth/token', params.toString(), {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}
test();
