//import libraries
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import {
   InboxRoutes,
   MessageRoutes,
   ParticipantDiaryRoutes,
   ParticipantResponseRoutes,
   ParticipantRoutes,
   QuestionnaireRoutes,
   QuestionRoutes,
   SurveyRoutes,
   UserRoutes,
   ExportRoutes,
   ImageRoutes,
   EHRRoutes,
   AuthRoutes,
   SwaggerRoutes
} from "./routes";
import { InformedConsentRoutes } from "./routes/InformedConsentRoutes";

const cors = require("cors");
const cookieParser = require("cookie-parser")();

//initialize firebase inorder to access its services
admin.initializeApp(functions.config().firebase);

// middleware to check for firebase token in header or cookie
// @ts-ignore
const validateFirebaseIdToken = async (req: any, res: any, next: any) => {
   if (
      (!req.headers.authorization ||
         !req.headers.authorization.startsWith("Bearer ")) &&
      !(req.cookies && req.cookies.__session)
   ) {
      console.error(
         "No Firebase ID token was passed as a Bearer token in the Authorization header.",
         "Make sure you authorize your request by providing the following HTTP header:",
         "Authorization: Bearer <Firebase ID Token>",
         'or by passing a "__session" cookie.'
      );
      res.status(403).send("Unauthorized");
      return;
   }

   let idToken;
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
   ) {
      // Read the ID Token from the Authorization header.
      idToken = req.headers.authorization.split("Bearer ")[1];
   } else if (req.cookies) {
      console.log("in cookie else if");
      // Read the ID Token from cookie.
      idToken = req.cookies.__session;
   } else {
      // No cookie
      res.status(403).send("Unauthorized");
      return;
   }

   try {
      if (idToken === "requestToken" && req.url === "/api/v1/auth") {
         next();
         return;
      }

      // @ts-ignore
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      // @ts-ignore
      const adminClaim = decodedIdToken.admin;
      const uid = decodedIdToken.uid;
      const org = decodedIdToken.org;
      req.org = org;
      // @ts-ignore
      if (!adminClaim) {
         console.error(`Unable to verify user with id ${uid} is admin`);
         throw new Error("Unable to verify user is admin");
      }
      req.user = decodedIdToken;
      next();
      return;
   } catch (error) {
      console.error("Error while verifying Firebase ID token:", error);
      res.status(403).send("Unauthorized");
      return;
   }
};
//

//initialize express server
const app = express();
const main = express();
const swaggerApp = express();

const options = {
   origin: true,
   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
   preflightContinue: false,
   optionsSuccessStatus: 204,
   credentials: true,
   allowedHeaders: ["Authorization", "Content-Type"],
   //exposedHeaders: ['Authorization', 'Content-Type', 'Access-Control-Allow-Origin']
};
main.use(cors(options));
main.use(cookieParser);

// Create Informed Consent Routes
const informedConsent = new InformedConsentRoutes();
informedConsent.createRoutes(app);
// Create Survey Routes
const surveyRoutes = new SurveyRoutes();
surveyRoutes.createRoutes(app);
// Create Participant Response Routes
const participantResponseRoutes = new ParticipantResponseRoutes();
participantResponseRoutes.createRoutes(app);
//Create Questionnaire Routes
const questionnaireRoutes = new QuestionnaireRoutes();
questionnaireRoutes.createRoutes(app);
//Create Question Routes
const questionRoutes = new QuestionRoutes();
questionRoutes.createRoutes(app);
// Participant Diary
const participantDiaryRoutes = new ParticipantDiaryRoutes();
participantDiaryRoutes.createRoutes(app);
// Message
const messageRoutes = new MessageRoutes();
messageRoutes.createRoutes(app);
// Inbox
const inboxRoutes = new InboxRoutes();
inboxRoutes.createRoutes(app);
// User
const userRoutes = new UserRoutes();
userRoutes.createRoutes(app);
// Participant
const participantRoutes = new ParticipantRoutes();
participantRoutes.createRoutes(app);
// exports
const exportRoutes = new ExportRoutes();
exportRoutes.createRoutes(app);
// images
const imageRoutes = new ImageRoutes();
imageRoutes.createRoutes(app);
// ehr
const ehrRoutes = new EHRRoutes();
ehrRoutes.createRoutes(app);
// auth
const authRoutes = new AuthRoutes();
authRoutes.createRoutes(app);
 
// Swagger
const swaggerRoutes = new SwaggerRoutes();
swaggerRoutes.createRoutes(swaggerApp);
// Swagger before validator allows no auth to visit
main.use("/swagger", swaggerApp);

// Use the validator or not (if commented out)
main.use(validateFirebaseIdToken);

//add the path to receive request and set json as bodyParser to process the body
main.use("/api/v1", app);
main.use(express.json());
main.use(express.urlencoded({ extended: false }));

//define google cloud function name
export const webApi = functions.https.onRequest(main);
