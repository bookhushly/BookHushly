/**
 * Nigerian airports with IATA code, name, city, and state.
 * Used for per-airport pickup pricing configuration.
 */
export const NIGERIAN_AIRPORTS = [
  { code: "LOS", name: "Murtala Muhammed International Airport", city: "Lagos", state: "Lagos" },
  { code: "ABV", name: "Nnamdi Azikiwe International Airport", city: "Abuja", state: "FCT" },
  { code: "PHC", name: "Port Harcourt International Airport", city: "Port Harcourt", state: "Rivers" },
  { code: "KAN", name: "Mallam Aminu Kano International Airport", city: "Kano", state: "Kano" },
  { code: "ENU", name: "Akanu Ibiam International Airport", city: "Enugu", state: "Enugu" },
  { code: "BNI", name: "Benin Airport", city: "Benin City", state: "Edo" },
  { code: "IBA", name: "Ibadan Airport", city: "Ibadan", state: "Oyo" },
  { code: "ILR", name: "Ilorin International Airport", city: "Ilorin", state: "Kwara" },
  { code: "CBQ", name: "Margaret Ekpo International Airport", city: "Calabar", state: "Cross River" },
  { code: "QUO", name: "Victor Attah International Airport", city: "Uyo", state: "Akwa Ibom" },
  { code: "QOW", name: "Sam Mbakwe International Airport", city: "Owerri", state: "Imo" },
  { code: "ABB", name: "Asaba International Airport", city: "Asaba", state: "Delta" },
  { code: "JOS", name: "Yakubu Gowon Airport", city: "Jos", state: "Plateau" },
  { code: "KAD", name: "Kaduna Airport", city: "Kaduna", state: "Kaduna" },
  { code: "MIU", name: "Maiduguri International Airport", city: "Maiduguri", state: "Borno" },
  { code: "YOL", name: "Yola Airport", city: "Yola", state: "Adamawa" },
  { code: "SKO", name: "Sadiq Abubakar III International Airport", city: "Sokoto", state: "Sokoto" },
  { code: "BCU", name: "Sir Abubakar Tafawa Balewa Airport", city: "Bauchi", state: "Bauchi" },
  { code: "AKR", name: "Akure Airport", city: "Akure", state: "Ondo" },
  { code: "GMO", name: "Gombe Lawanti International Airport", city: "Gombe", state: "Gombe" },
  { code: "MXJ", name: "Minna Airport", city: "Minna", state: "Niger" },
  { code: "ZAR", name: "Zaria Airport", city: "Zaria", state: "Kaduna" },
  { code: "BKO", name: "Kebbi Airport", city: "Birnin Kebbi", state: "Kebbi" },
  { code: "QRW", name: "Warri Airport", city: "Warri", state: "Delta" },
  { code: "MDI", name: "Makurdi Airport", city: "Makurdi", state: "Benue" },
  { code: "GSU", name: "Gusau Airport", city: "Gusau", state: "Zamfara" },
  { code: "DUT", name: "Dutse Airport", city: "Dutse", state: "Jigawa" },
  { code: "OMO", name: "Murtala Muhammed Airport Terminal 2 (MMA2)", city: "Lagos", state: "Lagos" },
];

/** Returns airport object by IATA code, or undefined */
export function getAirportByCode(code) {
  return NIGERIAN_AIRPORTS.find((a) => a.code === code);
}
