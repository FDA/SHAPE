# FDA SHAPE Application System

**Background**

The FDA Survey of Health and Patient Experience (SHAPE) application was developed as part of the FDA CBER&#39;s Biologics Effectiveness and Safety ([BEST](https://www.bestinitiative.org/)) [Innovative Methods](https://www.bestinitiative.org/best/data-and-surveillance-activities/artificial-intelligence-and-natural-language-processing) (IM) initiative. SHAPE is a flexible and scalable application designed to support the collection of patient experience data. Although it was developed by the FDA and their private sector partners, SHAPE&#39;s source code and documentation have been released to the public as open-source software to allow developers to reconfigure and rebrand the application for their own clinical research efforts.

The SHAPE application has a number of important features that have ensured that the development is innovatively changing patient experience data capture methods. SHAPE is hosted in a secure and scalable cloud environment that was evaluated and certified with a NIST 800-171 Controlled Unclassified Information System Security Plan. An IT administrator deploying SHAPE would need to establish and document their own cloud security policies and procedures. The app is configurable to support multitenancy – which would enable multiple organizations to utilize SHAPE for their own purposes. The data storage is scalable and flexible to support the onboarding of additional users and participants.

These resources provide detailed background information about the FDA SHAPE application:

- FDA&#39;s SHAPE Application Technical Background
- SHAPE Manuscript _(Coming Soon)_

**This Repository**

This repository contains the codebase for the FDA SHAPE mobile application (deployable on the web, iOS, and Android), the SHAPE Administrator application, and SHAPE Application Programming Interface (API). The SHAPE applications were developed by International Business Machines Corporation.

The Administrator application is the portion of SHAPE that allows the study coordinators and/or researchers to setup and deploy their studies to the SHAPE mobile application when the application stack is configured properly. Authentication and storage are handled using an implementation of Google Firebase. SHAPE was developed in using an Agile methodology, where FDA provided the domain input and expertise to ensure the application is patient centric. The user interface and intuitiveness of SHAPE was determined through continuous discussions with study coordinators and researchers.

This consolidated repository provides access to the latest code for variations of the FDA SHAPE system.

**Setup**

Setup requires the deployment and configuration of the following components:

- **SHAPE Application:** A React progressive web application that can be deployed on the web, Apple App Store, or Google Play Store. Users can register and login to participate in studies through surveys, reporting ad-hoc health events, receive communication from study administrators, and sharing their Electronic Health Record information.
- **SHAPE Admin Portal:** A React web application. Study administrators can configure users, set up surveys, send communication to users, and download user responses to surveys, health events, and EHR information.
- **SHAPE API:** An API through which study data analysts can interface directly with the database to query for participant information.

Standing up the SHAPE Mobile Application alone will not result in a fully functioning SHAPE mobile application, as it is only one component of the full environment (SHAPE Admin and API). Additionally, a developer would need to create and configure a separate Firebase project. Internal FDA stakeholders can leverage the already fully functioning and established SHAPE environment. External stakeholders will be able to use the open-source code of SHAPE to establish their own working environment.

Note: Protected Health Information (PHI) may be transmitted and stored within a SHAPE instance. If PHI is being collected, additional work will be required related to HIPAA, security best practices, Institutional Review Boards, etc. Also, review all code libraries referenced in the codebase and ensure any required library updates are completed.

Technical setup instructions can be found here:

- FDA SHAPE App Technical Setup Document

**Learn More**

User guides and training documentation on how to use the SHAPE Application, SHAPE Admin App, and SHAPE API can be found here:

- FDA SHAPE Mobile App Quick Overview Document
- FDA SHAPE Administrator App Quick Overview Document
- FDA SHAPE API Quick Overview Document