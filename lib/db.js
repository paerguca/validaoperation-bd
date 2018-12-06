'use strict'

const r = require('rethinkdb')
const co = require('co')
const uuid = require('uuid-base62')
const Promise = require('bluebird')
const config = require('../config')
const moment = require('moment')

const defaults = config.db

class Db {
  constructor (options) {
    options = options || {}
    this.host = options.host || defaults.host
    this.port = options.port || defaults.port
    this.db = options.db || defaults.db
    this.connected = false
    this.setup = options.setup || false
  }

  connect (callback) {
    this.connection = r.connect({
      host: this.host,
      port: this.port
    })

    this.connected = true

    let db = this.db
    let connection = this.connection

    if (!this.setup) {
      return Promise.resolve(connection).asCallback(callback)
    }
    //let setup = co.wrap(function * () {
    //  let conn = yield connection
    let setup = co.wrap(function* () {
      let conn = yield connection

      let dbList = yield r.dbList().run(conn)
      if (dbList.indexOf(db) === -1) {
        yield r.dbCreate(db).run(conn)
      }

      let dbTables = yield r.db(db).tableList().run(conn)
      if (dbTables.indexOf('operaciones') === -1) {
        yield r.db(db).tableCreate('operaciones').run(conn)
      }

      return conn

    })
    return Promise.resolve(setup()).asCallback(callback)
  }

  disconnect (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected')).asCallback(callback)
    }

    this.connected = false
    return Promise.resolve(this.connection).then((conn) => conn.close())
  }

  saveOperacion (operacion, callback) {
    if (!this.connected) {
      Promise.reject(new Error('not connected')).catch((err) => {
        return err.message
      })
    }

    let connection = this.connection
    let db = this.db

    //let tasks = co.wrap(function * () {
    let tasks = co.wrap(function* () {
      let conn = yield connection

      moment.locale('es-us')
      operacion.createdAt = moment().format('dddd, D MMMM YYYY, h:mm:ss a')

      //yield r.db(db).table('operaciones').indexWait().run(conn)

      //console.log(operacion)

      //Cursor
      //let dup = yield r.db(db).table('operaciones').filter(r.row('nro_operacion').eq(operacion.nro_operacion)).run(conn)
      
      //Store cursor in var dup_nop
      //let dup_nop = yield dup.toArray().then(function(results) {
        //return results
      //}).error();

      //console.log(dup_nop)

     
      let result = yield r.db(db).table('operaciones').insert(operacion).run(conn)
      if (result.errors > 0) {
        Promise.reject(new Error('Insert error')).catch((err) => {
          return err.message
        })
      }
  
      operacion.id = result.generated_keys[0]
  
      yield r.db(db).table('operaciones').get(operacion.id).update({
        uuid: uuid.encode(operacion.id)
      }).run(conn)
  
      let created = yield r.db(db).table('operaciones').get(operacion.id).run(conn)
      
      console.log(created)
      return Promise.resolve(created)
      
      Promise.reject(new Error(dup_nop)).then(function() {
      }, function(error) {
        return error
      })
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }
  getOperaciones (callback) {
    if (!this.connected) {
      return Promise.reject(new Error('not connected'))
    }

    let connection = this.connection
    let db = this.db

//    let tasks = co.wrap(function * () {
    let tasks = co.wrap(function* () {

      let conn = yield connection

      //yield r.db(db).table('operaciones').indexWait().run(conn)
      let operaciones = yield r.db(db).table('operaciones').run(conn)
      let result = yield operaciones.toArray()

      return Promise.resolve(result)
    })

    return Promise.resolve(tasks()).asCallback(callback)
  }

}

module.exports = Db
