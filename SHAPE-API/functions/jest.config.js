module.exports =  {
   verbose: true,
   collectCoverage: false,
   collectCoverageFrom: [
     "**/src/**/*.ts",
     "!**/node_modules/**",
     "!**/lib/**"
   ],
   testPathIgnorePatterns: [
     "/__tests__/config/*"
   ],
   transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
   globals: {
     "__BASE_URL__": "http://localhost:5001/shape-dev-72fbb/us-central1/webApi/api/v1",
     "__STORAGE_URL__": "https://us-central1-shape-dev-72fbb.cloudfunctions.net/webApi/api/v1",
     "__AUTH_URL__": "https://shape-dev-72fbb.firebaseio.com",
     "__USERNAME__": "admin@admin.com",
     "__PASSWORD__": "password",
     "__DEV_USERNAME__": "huangha@us.ibm.com",
     "__DEV_PASSWORD__": "P@ssw0rd!",
     "__SERVICE_ACCOUNT__": "./config/shape-dev-service-acct.json",
     "__FIREBASE_CONFIG__": "../../src/firebase-connect.json"
   }
};