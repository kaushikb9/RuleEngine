'use strict';
let db = require('../db/connection');
let rule_query_map = require('../config/rule-mapping');
  
const getRulesForCheckpoint = (checkpoint_id)=>{
  return new Promise((resolve, reject) => {
    let queryString = `SELECT expression FROM rule where id in (SELECT rule_id FROM checkpoint_has_rule WHERE checkpoint_id = ${checkpoint_id})`
    db.query(queryString)
    .then((results)=>{
      resolve((results || []).map((rule)=> rule.expression));
    })
  });
}

const evaluateExpression = (rule, entity_id, checkpoint_id)=>{
  return new Promise((resolve, reject) => {
    let rule_variables = rule.match(/\$(\w+)/g)
    let promises = []
    rule_variables.forEach((rule_variable)=>{
      let rule_variable_query = rule_query_map[rule_variable].replace("$entity_id",entity_id).replace("$checkpoint_id",checkpoint_id);
      promises.push(db.query(rule_variable_query));
    })
    Promise.all(promises)
    .then((all_results)=>{
      let clean_results = all_results.map((all_result)=> all_result[0]).map((result)=> result.output)
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

module.exports.decision = (body)=>{
  return new Promise((resolve, reject) => {
    getRulesForCheckpoint(body.checkpoint_id)
    .then((rules)=>{
      let promises = []
      rules.forEach((rule)=>{
        promises.push(evaluateExpression(rule, body.entity_id, body.checkpoint_id))
      })
      Promise.all(promises)
      .then((all_evaluations)=>{
        let false_evals = all_evaluations.filter((evaluation)=> !evaluation)
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