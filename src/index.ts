import app from './app'
import db from './models'
const ForestAdmin = require('forest-express-sequelize');
import * as Secret from './config/secret'

app.use(
    ForestAdmin.init({
      modelsDir: __dirname + '/models',
      envSecret: process.env.FOREST_ENV_SECRET || Secret.default.FOREST_ENV_SECRET,
      authSecret: process.env.FOREST_AUTH_SECRET || Secret.default.FOREST_AUTH_SECRET,
      sequelize: db.sequelize
    })
  );
const Sync = async () => {
    await db.sequelize.sync()
    app.listen(process.env.PORT || 5000, () => {
        console.log('🚀 Listening on port 5000')     
    })
}
Sync()


//db.sequelize.sync()
    //.then( () => {
       // app.listen(process.env.PORT || 5000, () => {
     //       console.log('🚀 Listening on port 5000')     
   //     })
 //   })
