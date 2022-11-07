# FDA SHAPE Application API

**Background**

The FDA Survey of Health and Patient Experience (SHAPE) Platform was developed as part of the FDA CBER's Biologics Effectiveness and Safety ([BEST](https://www.bestinitiative.org/)) [Innovative Methods](https://www.bestinitiative.org/best/data-and-surveillance-activities/artificial-intelligence-and-natural-language-processing) (IM) initiative. SHAPE is a flexible and scalable application designed to support the collection of patient experience data. Although it was developed by the FDA and their private sector partners, SHAPE's source code and documentation have been released to the public as open-source software to allow developers to reconfigure and rebrand the application for their own clinical research efforts.

The SHAPE Platform has a number of important features that have ensured that the development is innovatively changing patient experience data capture methods. SHAPE is hosted in a secure and scalable cloud environment that was evaluated and certified with a NIST 800-171 Controlled Unclassified Information System Security Plan. An IT administrator deploying SHAPE would need to establish and document their own cloud security policies and procedures. The app is configurable to support multitenancy -- which would enable multiple organizations to utilize SHAPE for their own purposes. The data storage is scalable and flexible to support the onboarding of additional users and participants.

These resources provide detailed background information about the FDA SHAPE Platform:

-   Manuscript Link (In Development)
-   FDA's SHAPE Platform Technical Background

**This Repository**

This repository contains the codebase for the FDA SHAPE API (Application Programming Interface) Application. The SHAPE API App is one component of the overall FDA SHAPE Application System. The SHAPE applications were developed by International Business Machines (IBM) Corporation.

The SHAPE API App is the portion of SHAPE that interfaces with the SHAPE Admin application to give the SHAPE Admin application access to the Firebase database. The API layer also allows authorized third parties to read, write, and update records in the SHAPE database without using the SHAPE Admin user interface.

This component specific repository provides access to the latest code for the SHAPE API Application. The other components of the FDA SHAPE Platform can be found in the parent-level folder of this GitHub repository.

**Setup**

Setup requires the deployment and configuration of the following components:

-   SHAPE Application: A React progressive web application that can be deployed on the web, Apple App Store, or Google Play Store. Users can register and login to participate in studies through surveys, reporting ad-hoc health events, receive communication from study administrators, and sharing their Electronic Health Record information.
-   SHAPE Admin Application: A React web application. Study administrators can configure users, set up surveys, send communication to users, and download user responses to surveys, health events, and EHR information.
-   SHAPE API: An API through which study data analysts can interface directly with the database to query for participant information.

Standing up the SHAPE Admin App alone will not result in a fully functioning FDA SHAPE Application System, as it is only one component of the full environment (SHAPE App and SHAPE Admin App). Additionally, a developer would need to create and configure a separate Firebase project. Internal FDA stakeholders can leverage the already fully functioning and established SHAPE environment. External stakeholders will be able to use the open-source code of SHAPE to establish their own working environment.

**Technical setup instructions can be found here:**

-   FDA SHAPE Platform: Technical Setup Document (SHAPE API App section)

**Learn More**

User guides and training documentation on how to use the SHAPE Application and SHAPE Admin Portal can be found here:

-   FDA SHAPE Mobile App Overview Document
-   FDA SHAPE Administrator App Overview Document
-   FDA SHAPE API App Overview Document
