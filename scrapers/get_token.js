import fs from 'fs';
import { google } from 'googleapis';
async function getToken() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/datastore']
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  console.log(token.token);
}
getToken().catch(console.error);
