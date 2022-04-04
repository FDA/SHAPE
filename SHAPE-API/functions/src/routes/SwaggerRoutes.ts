import express = require('express');
import {Application, Router} from "express";
import * as path from "path";

const router = Router();

export class SwaggerRoutes {

    public createRoutes(app: Application) {
      const distPath = path.resolve(__dirname, '../../swagger');

        router.use(express.static(distPath));

        router.get('/', function (req, res) {
          res.sendFile(distPath + '/index.html');
        });

        app.use(router);
    }
}
