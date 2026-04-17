import fetch from 'node-fetch';

async function findPublicDeals() {
    const project = 'web-app-30504';
    const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery`;
    
    const query = {
        structuredQuery: {
            from: [{ collectionId: 'publicDeals', allDescendants: true }],
            limit: 100
        }
    };

    const resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(query)
    });

    const data = await resp.json();
    if (!Array.isArray(data)) {
        console.error('Error:', data);
        return;
    }

    const locations = new Set();
    data.forEach(item => {
        if (item.document && item.document.name) {
            const parts = item.document.name.split('/');
            // projects/web-app-30504/databases/(default)/documents/artifacts/APPID/publicDeals/ID
            if (parts[6] === 'artifacts') {
                locations.add(parts[7]);
            } else {
                locations.add('ROOT');
            }
        }
    });

    console.log('Public deals found in these App IDs:');
    locations.forEach(loc => console.log(`- ${loc}`));
}

findPublicDeals().catch(console.error);
