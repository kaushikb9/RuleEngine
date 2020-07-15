//  RuleEngine.js
//
//  Exposes a single function - 'connect', which returns
//  a connected RuleEngine. Call 'disconnect' on this object when you're done.
'use strict';
var mysql = require('mysql');
var config = require('./config');

//  Class which holds an open connection to a RuleEngine
//  and exposes some simple functions for accessing data.
class RuleEngine {
  constructor(connection) {
    this.connection = connection;
  }

  executeQuery(queryString){
    return new Promise((resolve, reject) => {
      // console.log(queryString)
      this.connection.query(queryString, (err, results) => {
        if(err) {
          return reject(new Error(`An error occured getting data: ` + err));
        }
        // console.log("executeQuery", results)
        resolve(results || []);
      });
    });
  }

  getQuery(ruleVariable, entity_id, checkpoint_id){
    switch(ruleVariable){
      case "$EXISTS": 
        return `SELECT COUNT(id) AS output FROM entity where id = ${entity_id}`;
      case "$LAST_CHECKPOINT_SEQ":
        return `SELECT sequence as output FROM activity a inner join checkpoint c on c.id = a.checkpoint_id where a.entity_id = ${entity_id} order by a.updated_on desc limit 1;`;
      case "$DAYS_SINCE_AT_CURRENT_CHECKPOINT":
        return `SELECT TIMESTAMPDIFF(DAY,updated_on,NOW()) AS output FROM activity WHERE entity_id = ${entity_id} AND checkpoint_id = ${checkpoint_id} ORDER BY id desc LIMIT 1`;
      case "$CURRENT_CHECKPOINT_SEQ":
        return `SELECT sequence AS output FROM checkpoint WHERE id = ${checkpoint_id}`

      // [TODO] - Yet to be implemented
      // case "$LAST_CHECK_IN_CHECKPOINT":
      // case "$LAST_CHECK_OUT_CHECKPOINT":
      // case "$LAST_CHECK_IN_TIMESTAMP":
      // case "$LAST_CHECK_OUT_TIMESTAMP":
      // case "$LAST_ACTIVITY":
    }
  }

  getRulesForCheckpoint(checkpoint_id){
    return new Promise((resolve, reject) => {
      let queryString = `SELECT expression FROM rule where id in (SELECT rule_id FROM checkpoint_has_rule WHERE checkpoint_id = ${checkpoint_id})`
      this.executeQuery(queryString)
      .then((results)=>{
        resolve((results || []).map((rule)=> rule.expression));
      })
    });
  }

  evaluateExpression(rule, entity_id, checkpoint_id){
    return new Promise((resolve, reject) => {
      let rule_variables = rule.match(/\$(\w+)/g)
      // console.log(rule_variables)
      let promises = []
      rule_variables.forEach((rule_variable)=>{
        let rule_variable_query = this.getQuery(rule_variable, entity_id, checkpoint_id);
        // console.log("rule_variable_query", rule_variable_query);
        promises.push(this.executeQuery(rule_variable_query));
      })
      Promise.all(promises)
      .then((all_results)=>{
        // console.log("rule", rule)
        // console.log("rule_variables", rule_variables)
        // console.log("allResults", all_results)
        let clean_results = all_results.map((all_result)=> all_result[0]).map((result)=> result.output)
        // console.log("clean_results", clean_results)
        console.log("original rule", rule)
        rule_variables.forEach((rule_variable, index)=>{
          rule = rule.replace(rule_variable, clean_results[index])
        })
        let evaluation = eval(rule)
        console.log("cleaned rule", rule, ":: evaluation", evaluation)
        resolve(evaluation);
      })
    })
  }

  checkDecision(body){
    return new Promise((resolve, reject) => {
      this.getRulesForCheckpoint(body.checkpoint_id)
      .then((rules)=>{
        let promises = []
        rules.forEach((rule)=>{
          promises.push(this.evaluateExpression(rule, body.entity_id, body.checkpoint_id))
        })
        Promise.all(promises)
        .then((all_evaluations)=>{
          console.log("all_evaluations", all_evaluations)
          let false_evals = all_evaluations.filter((evaluation)=> !evaluation)
          console.log("false_evals", false_evals)
          let can = "cannot"
          if(!false_evals.length){
            can = "can"
          }
          let evaluation_result = {
            eligibility: !false_evals.length,
            message: `Entity ${body.entity_id} ${can} proceed with checkpoint ${body.checkpoint_id}`
          }
          resolve(evaluation_result)
        })
      })
    })
  }

  disconnect() {
    this.connection.end();
  }
}

//  One and only exported function, returns a connected repo.
module.exports.connect = (connectionSettings) => {
  return new Promise((resolve, reject) => {
    if(!connectionSettings.host) throw new Error("A host must be specified.");
    if(!connectionSettings.user) throw new Error("A user must be specified.");
    if(!connectionSettings.password) throw new Error("A password must be specified.");
    if(!connectionSettings.port) throw new Error("A port must be specified.");

    resolve(new RuleEngine(mysql.createConnection(connectionSettings)));
  });
};