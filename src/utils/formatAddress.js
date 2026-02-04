/**
 * Obfuscates an address string if the user is not a Pro member.
 * Example: "1234 Main Street, Austin, TX" -> "12** Main Street, Austin, TX"
 * 
 * @param {string} address - The full address string.
 * @param {boolean} isPro - Whether the current user has a Pro subscription.
 * @returns {string} - The formatted address.
 */
export const formatAddress = (address, isPro) => {
  if (!address) return "Unknown Address";
  if (isPro) return address;

  // Simple obfuscation: Mask the last 2 digits of the street number if present
  // Split by first space to separate street number from street name
  const parts = address.split(' ');
  
  if (parts.length > 0) {
    const streetNum = parts[0];
    // Check if it looks like a number
    if (/^\d+$/.test(streetNum)) {
       const maskedNum = streetNum.length > 2 
         ? streetNum.substring(0, streetNum.length - 2) + '**' 
         : '**';
       
       return [maskedNum, ...parts.slice(1)].join(' ');
    }
  }
  
  return address; // Return original if we can't parse it easily (fallback)
};

/**
 * Extracts "City, State" from a standard address string.
 * @param {string} address 
 * @returns {string} City, State (or "Location Details" if parse fails)
 */
export const getShortAddress = (address) => {
    if (!address) return "Location Details";
    const parts = address.split(',').map(p => p.trim());
    
    // Handle "123 Main St, Portsmouth, VA 23704"
    if (parts.length >= 3) {
        const city = parts[1];
        const statePart = parts[2].split(' ')[0];
        return `${city}, ${statePart}`;
    }
    
    // Handle "123 Main St, Portsmouth, VA"
    if (parts.length === 2) {
         // Assuming "Street, City State" ? Unlikely. 
         // If it's "City, State" only, just return it.
         return address; 
    }

    return "Location Details";
};
