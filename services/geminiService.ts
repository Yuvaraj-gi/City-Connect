import { routes } from '../data';

// Dictionary for regional slang and abbreviations in English, Hindi, and Tamil
const regionalDictionary: { [key: string]: string } = {
  // English
  't nagar': 'T. Nagar',
  'marina': 'Marina Beach',
  'guindy park': 'Guindy',
  'central station': 'Chennai Central',
  'airport': 'Airport (MAA)',
  'cmbt': 'Koyambedu',
  'adyar': 'Adyar',
  'next bus': 'next bus',
  'how much': 'fare',
  'cost': 'fare',
  'price': 'fare',
  'how to go': 'route to',

  // Hindi
  'अगली बस': 'next bus',
  'बस कब है': 'next bus',
  'किराया कितना है': 'fare',
  'कितने का टिकट है': 'fare',
  'कैसे जाऊं': 'route to',

  // Tamil
  'அடுத்த பஸ்': 'next bus',
  'பஸ் எப்போ': 'next bus',
  'டிக்கெட் விலை': 'fare',
  'கட்டணம்': 'fare',
  'செலவு': 'fare',
  'எப்படி போவது': 'route to',
};

const normalizePrompt = (prompt: string): string => {
  let normalized = prompt.toLowerCase();
  for (const key in regionalDictionary) {
    // Use a regex to match whole words or phrases
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    normalized = normalized.replace(regex, regionalDictionary[key]);
  }
  return normalized;
};


export const getAiTravelResponse = async (prompt: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerCasePrompt = normalizePrompt(prompt);

  if (lowerCasePrompt.includes("next bus") || lowerCasePrompt.includes("when")) {
    if (lowerCasePrompt.includes("guindy") && lowerCasePrompt.includes("anna nagar")) {
      return "The next Bus #47D from Guindy to Anna Nagar is expected in about 15 minutes. Uska kiraya ₹20 hai.";
    }
    return "To give you the next bus timing, please tell me your starting point and destination. Aapko kahan se kahan jaana hai?";
  }

  if (lowerCasePrompt.includes("cheapest") || lowerCasePrompt.includes("cheap")) {
    const cheapestRoute = [...routes].sort((a, b) => a.fare - b.fare)[0];
    return `The cheapest route is ${cheapestRoute.name} from ${cheapestRoute.from} to ${cheapestRoute.to}, costing only ₹${cheapestRoute.fare}. The trip takes about ${cheapestRoute.averageEta} minutes.`;
  }

  if (lowerCasePrompt.includes("route to")) {
    const beachRoute = routes.find(r => r.to.toLowerCase().includes('beach'));
    if (beachRoute && (lowerCasePrompt.includes('beach') || lowerCasePrompt.includes('marina'))) {
      return `For Marina Beach, you can take ${beachRoute.name}. It starts from ${beachRoute.from} and the ticket price is ₹${beachRoute.fare}.`;
    }
    return "I can help with routes. Please tell me your destination. Unga destination sollunga?";
  }
  
  if (lowerCasePrompt.includes("fare")) {
     if (lowerCasePrompt.includes("21g")) {
        const route21g = routes.find(r => r.name === 'Bus #21G');
        if(route21g) {
            return `The fare for ${route21g.name} from ${route21g.from} to ${route21g.to} is ₹${route21g.fare}. Ticket velai ₹${route21g.fare} mattum thaan.`;
        }
     }
     return "Please specify which bus route you're asking about to get the fare. Bus number sollunga."
  }

  return "I'm sorry, I can't answer that. You can ask me about bus routes, fares, and timings in English, Hindi, or Tamil.";
};