const countryNameTable = {
  CL: "Chile",
  CY: "Cyprus",
  IM: "Isle of Man",
  CZ: "Czechia",
  BW: "Botswana",
  CD: "Congo, the Democratic Republic of the",
  SO: "Somalia",
  AZ: "Azerbaijan",
  ME: "Montenegro",
  AG: "Antigua and Barbuda",
  HT: "Haiti",
  AX: "Åland Islands",
  SS: "South Sudan",
  ML: "Mali",
  CW: "Curaçao",
  GM: "Gambia",
  MS: "Montserrat",
  IT: "Italy",
  PE: "Peru",
  LT: "Lithuania",
  PM: "Saint Pierre and Miquelon",
  TH: "Thailand",
  CO: "Colombia",
  NG: "Nigeria",
  BV: "Bouvet Island",
  SZ: "Swaziland",
  PH: "Philippines",
  BJ: "Benin",
  EG: "Egypt",
  GG: "Guernsey",
  RW: "Rwanda",
  KP: "Korea, Democratic People's Republic of",
  TR: "Turkey",
  NA: "Namibia",
  MA: "Morocco",
  KY: "Cayman Islands",
  RS: "Serbia",
  FJ: "Fiji",
  PA: "Panama",
  TT: "Trinidad and Tobago",
  CU: "Cuba",
  VN: "Viet Nam",
  TL: "Timor-Leste",
  MP: "Northern Mariana Islands",
  BB: "Barbados",
  GT: "Guatemala",
  JP: "Japan",
  BR: "Brazil",
  LK: "Sri Lanka",
  BG: "Bulgaria",
  ES: "Spain",
  TC: "Turks and Caicos Islands",
  NL: "Netherlands",
  KM: "Comoros",
  FM: "Micronesia, Federated States of",
  BM: "Bermuda",
  GW: "Guinea-Bissau",
  GY: "Guyana",
  IE: "Ireland",
  JO: "Jordan",
  GU: "Guam",
  UM: "United States Minor Outlying Islands",
  UA: "Ukraine",
  BT: "Bhutan",
  SE: "Sweden",
  BS: "Bahamas",
  EE: "Estonia",
  SB: "Solomon Islands",
  HN: "Honduras",
  QA: "Qatar",
  DE: "Germany",
  ID: "Indonesia",
  IO: "British Indian Ocean Territory",
  UZ: "Uzbekistan",
  NF: "Norfolk Island",
  GH: "Ghana",
  DZ: "Algeria",
  FR: "France",
  DJ: "Djibouti",
  CN: "China",
  UY: "Uruguay",
  PY: "Paraguay",
  LS: "Lesotho",
  CF: "Central African Republic",
  TM: "Turkmenistan",
  MR: "Mauritania",
  VE: "Venezuela, Bolivarian Republic of",
  MK: "Macedonia, the former Yugoslav Republic of",
  MN: "Mongolia",
  MM: "Myanmar",
  HM: "Heard Island and McDonald Islands",
  ZA: "South Africa",
  WF: "Wallis and Futuna",
  SD: "Sudan",
  ET: "Ethiopia",
  IL: "Israel",
  SN: "Senegal",
  BL: "Saint Barthélemy",
  EC: "Ecuador",
  PS: "Palestinian Territory, Occupied",
  NO: "Norway",
  FO: "Faroe Islands",
  BE: "Belgium",
  GE: "Georgia",
  PT: "Portugal",
  MG: "Madagascar",
  PG: "Papua New Guinea",
  DO: "Dominican Republic",
  AF: "Afghanistan",
  SX: "Sint Maarten (Dutch part)",
  PF: "French Polynesia",
  JM: "Jamaica",
  NC: "New Caledonia",
  TK: "Tokelau",
  GN: "Guinea",
  GA: "Gabon",
  MO: "Macau",
  MV: "Maldives",
  AR: "Argentina",
  US: "United States",
  BD: "Bangladesh",
  CV: "Cape Verde",
  IR: "Iran, Islamic Republic of",
  GI: "Gibraltar",
  TD: "Chad",
  NZ: "New Zealand",
  YE: "Yemen",
  CM: "Cameroon",
  TZ: "Tanzania, United Republic of",
  GS: "South Georgia and the South Sandwich Islands",
  CG: "Congo",
  LA: "Lao People's Democratic Republic",
  MF: "Saint Martin (French part)",
  KE: "Kenya",
  CH: "Switzerland",
  PN: "Pitcairn",
  CA: "Canada",
  CX: "Christmas Island",
  BO: "Bolivia, Plurinational State of",
  RE: "Réunion",
  NE: "Niger",
  RO: "Romania",
  MH: "Marshall Islands",
  LV: "Latvia",
  MU: "Mauritius",
  MZ: "Mozambique",
  RU: "Russian Federation",
  YT: "Mayotte",
  MQ: "Martinique",
  GL: "Greenland",
  KN: "Saint Kitts and Nevis",
  SL: "Sierra Leone",
  SR: "Suriname",
  FK: "Falkland Islands (Malvinas)",
  BF: "Burkina Faso",
  TJ: "Tajikistan",
  CC: "Cocos (Keeling) Islands",
  IQ: "Iraq",
  PR: "Puerto Rico",
  AL: "Albania",
  TO: "Tonga",
  VI: "Virgin Islands, U.S.",
  TV: "Tuvalu",
  WS: "Samoa",
  OM: "Oman",
  DK: "Denmark",
  SM: "San Marino",
  SY: "Syrian Arab Republic",
  MD: "Moldova, Republic of",
  BN: "Brunei Darussalam",
  SI: "Slovenia",
  LY: "Libya",
  NP: "Nepal",
  CK: "Cook Islands",
  VU: "Vanuatu",
  CR: "Costa Rica",
  AI: "Anguilla",
  MW: "Malawi",
  DM: "Dominica",
  FI: "Finland",
  SA: "Saudi Arabia",
  BZ: "Belize",
  BY: "Belarus",
  LI: "Liechtenstein",
  KZ: "Kazakhstan",
  BH: "Bahrain",
  AO: "Angola",
  HR: "Croatia",
  KG: "Kyrgyzstan",
  PL: "Poland",
  BI: "Burundi",
  GP: "Guadeloupe",
  NR: "Nauru",
  BA: "Bosnia and Herzegovina",
  AD: "Andorra",
  ST: "Sao Tome and returnPrincipe",
  GB: "United Kingdom",
  NI: "Nicaragua",
  PW: "Palau",
  MT: "Malta",
  LR: "Liberia",
  VC: "Saint Vincent and the Grenadines",
  JE: "Jersey",
  TF: "French Southern Territories",
  KR: "Korea, Republic of",
  KW: "Kuwait",
  HU: "Hungary",
  ZW: "Zimbabwe",
  TW: "Taiwan, Province of China",
  AW: "Aruba",
  SG: "Singapore",
  AT: "Austria",
  MX: "Mexico",
  SH: "Saint Helena, Ascension and Tristan da Cunha",
  MC: "Monaco",
  IN: "India",
  MY: "Malaysia",
  KI: "Kiribati",
  AS: "American Samoa",
  SV: "El Salvador",
  HK: "Hong Kong",
  GR: "Greece",
  IS: "Iceland",
  UG: "Uganda",
  CI: "Côte d'Ivoire",
  GD: "Grenada",
  ZM: "Zambia",
  BQ: "Bonaire, Saint Eustatius and Saba",
  AM: "Armenia",
  VG: "Virgin Islands, British",
  TG: "Togo",
  ER: "Eritrea",
  SK: "Slovakia",
  LB: "Lebanon",
  NU: "Niue",
  SC: "Seychelles",
  VA: "Holy See (Vatican City State)",
  GF: "French Guiana",
  KH: "Cambodia",
  AQ: "Antarctica",
  LU: "Luxembourg",
  SJ: "Svalbard and Jan Mayen",
  PK: "Pakistan",
  TN: "Tunisia",
  GQ: "Equatorial Guinea",
  AE: "United Arab Emirates",
  EH: "Western Sahara",
  AU: "Australia",
  LC: "Saint Lucia"
};

export default class Country {
  static isJapan(country) {
    return country === "JP";
  }

  static codeToName(country) {
    if (!(country in countryNameTable)) {
      return undefined;
    }

    return countryNameTable[country];
  }
}
