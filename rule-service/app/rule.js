'use strict';
let moment = require("moment");
let db = require("../db/connection");

// any new rule variable that we define need to go in here
const valueOf = (rule_variable, checkpoint_seq_map, current_checkpoint_id, activities)=>{
  let earlier_activities_at_checkpoint = activities.filter((activity)=>activity.checkpoint_id === current_checkpoint_id)
  // console.log(rule_variable, earlier_activities_at_checkpoint)
  switch(rule_variable){
    case "$HAS_FIRST_ACTIVITY":
      return !!activities.length
    case "$CURRENT_CHECKPOINT_SEQ":
      return checkpoint_seq_map[current_checkpoint_id]; break;
    case "$LAST_CHECKPOINT_SEQ":
      return checkpoint_seq_map[activities.slice(-1)[0].checkpoint_id]; break;
    case "$IS_NEW":
      return earlier_activities_at_checkpoint.length === 0; break;
    case "$DAYS_SINCE_AT_CURRENT_CHECKPOINT":
      if(earlier_activities_at_checkpoint.length > 0){
        let last_activity_at_checkpoint = moment(earlier_activities_at_checkpoint.slice(-1)[0].updated_on, "YYYY-MM-SS hh:mm:ss")  
        return moment().diff(last_activity_at_checkpoint, "days"); break;
      }else{
        return null; break;
      }
  }
}

const allCheckpointSequences = ()=>{
  return new Promise((resolve, reject) => {
    let queryString = `SELECT id, sequence FROM checkpoint WHERE active = 1`;
    db.query(queryString)
    .then((checkpoints)=>{
      let checkppoint_seq_map = {};
      (checkpoints || []).forEach((checkpoint)=> {
        checkppoint_seq_map[checkpoint.id] = checkpoint.sequence
      })
      resolve(checkppoint_seq_map)
    })
  });
}
  
const getCheckpointRules = (checkpoint_id)=>{
  return new Promise((resolve, reject) => {
    // let queryString = `SELECT sequence as checkpoint_sequence, r.expression AS rule_expression FROM checkpoint c INNER JOIN checkpoint_has_rule cr ON c.id = cr.checkpoint_id INNER JOIN rule r ON r.id = cr.rule_id WHERE checkpoint_id = ${checkpoint_id})`
    let queryString = `SELECT expression FROM checkpoint_has_rule cr INNER JOIN rule r ON r.id = cr.rule_id WHERE checkpoint_id = ${checkpoint_id}`;
    db.query(queryString)
    .then((rules)=>{
      resolve((rules || []).map((rule)=> rule.expression));
    })
  });
}

const getActivities = (entity_id)=>{
  return new Promise((resolve, reject) => {
    let queryString = `SELECT checkpoint_id, updated_on FROM activity WHERE entity_id = ${entity_id}`
    db.query(queryString)
    .then((results)=>{
      resolve((results || []).map((acitivity)=> {
        return {
          checkpoint_id: acitivity.checkpoint_id,
          updated_on: acitivity.updated_on  
        }
      }))
    })  
  })
}

const evaluateRules = (checkpoint_seq_map, current_checkpoint, activities)=>{
  let result = {"evaluation": true};
  current_checkpoint.rules.forEach((rule)=>{
    let cleaned_rule = rule.replace(/(\$\w+)/g, (rule_variable)=> valueOf(rule_variable, checkpoint_seq_map, current_checkpoint.id, activities));
    console.log("cleaned_rule", cleaned_rule)
    if(eval(cleaned_rule) === false){
      result.evaluation = false
      result.failed_rule = rule
      result.failed_reason = cleaned_rule
    }
  })
  return result;
}

module.exports.decision = (body)=>{
  return new Promise((resolve, reject) => {
    let decision;
    let checkpoint_seq_map;
    let current_checkpoint = {
      id: body.checkpoint_id
    };
    allCheckpointSequences() // this can be cached
    .then((results)=>{
      if(!results[current_checkpoint.id]){
        decision = {
          "statusCode": 404,
          "reason": "invalid checkpoint_id",
          "message": `Checkpoint-${body.checkpoint_id} is missing`
        }
        reject(decision)
      }else{
        checkpoint_seq_map = results  
        getCheckpointRules(body.checkpoint_id) // this can be cached
        .then((rules)=>{
          if(rules.length === 0){
            decision = {
              "is_eligible": true,
              "message": `No rules applicable for checkpoint-${body.checkpoint_id}`
            }
            resolve(decision)
          }else{
            current_checkpoint.rules = rules;
            getActivities(body.entity_id)
            .then((activities)=>{
              decision = evaluateRules(checkpoint_seq_map, current_checkpoint, activities)
              let can = "can"
              if(decision.evaluation === false){
                can = "cannot"
              }
              decision.message = `Entity-${body.entity_id} ${can} pass through Checkpoint-${body.checkpoint_id}`
              resolve(decision)
            }) 
          }     
        })
      }
    })
  })
}