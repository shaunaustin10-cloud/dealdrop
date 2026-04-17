require('dotenv').config();
const axios = require('axios');

async function test() {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', 'fake_code_12345');
    params.append('redirect_uri', process.env.SCHWAB_REDIRECT_URI);

    try {
        const response = await axios.post('https://api.schwabapi.com/v1/oauth/token', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Status:", error.response ? error.response.status : "No response");
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}
test();
