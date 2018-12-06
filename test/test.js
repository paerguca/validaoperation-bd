'use strict'

const Db = require('../index')
const db = new Db()

async function postOperacion (req, res) {
  //let operacion = await json(req)

  //try {
    //let token = await utils.extractToken(req)
    //let encoded = await utils.verifyToken(token, config.secret, {})
    //if (encoded && encoded.userId !== image.userId) {
      //return send(res, 401, { error: 'invalid token' })
    //}
  //} catch (e) {
    //return send(res, 401, { error: 'invalid token' })
  //}

  db.connect()
  //console.log(req)
  let created = await db.saveOperacion(req)
  db.disconnect()

  //send(res, 201, created)
  //console.log(created)
  //if (created.name == 'ReqlDriverError') console.log(created.msg)
}

postOperacion({
  "banco": "Interbank",
  "moneda": "soles",
  "titular": "Benjamin",
  "nro_operacion": "5443320996"
})
