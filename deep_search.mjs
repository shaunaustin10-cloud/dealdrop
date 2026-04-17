import fetch from 'node-fetch';

async function searchEverywhere(searchTerm) {
    const project = 'web-app-30504';
    const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery`;
    
    const collections = ['deals', 'publicDeals', 'foreclosureLeads'];
    
    for (const colId of collections) {
        console.log(`Searching in all '${colId}' collections...`);
        const query = {
            structuredQuery: {
                from: [{ collectionId: colId, allDescendants: true }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: 'address' },
                        op: 'GREATER_THAN_OR_EQUAL',
                        value: { stringValue: searchTerm }
                    }
                },
                limit: 50
            }
        };

        const resp = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(query)
        });

        const data = await resp.json();
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.document && item.document.name) {
                    const addr = item.document.fields?.address?.stringValue || 'No Address';
                    if (addr.toLowerCase().includes(searchTerm.toLowerCase())) {
                        console.log(`  FOUND: ${addr}`);
                        console.log(`  Path: ${item.document.name}`);
                    }
                }
            });
        }
    }
}

searchEverywhere('Jewell').catch(console.error);
