const chai = require("chai");
const assert = chai.assert;
const script = require("../index.js");


function raiseFundFrom(person){
  var deferred = Promise.defer();
  var delay = {
    Tom:10,
    Dick:20,
    Harry:50
  }
  var amount = {
    Tom:10000,
    Dick:6000,
    Harry:5000
  }
  setTimeout(()=>{
    console.log(person, "contributed $", amount[person]);
    deferred.resolve(amount[person]);
  },delay[person]);
  return deferred.promise;
}

describe("Test AwaitTill", () => {
  it("can raise fund and everyone contributes (no deadline)", async () => {
    var testTillEnd = Promise.resolveAfter({},60);
    console.log("\r");

    try{
      var lastState = await ["Tom","Dick","Harry"].awaitTill(
        async (person, scope) => {
          var amount = await raiseFundFrom(person);
          scope.raisedFund+=amount;
        },
        {
          raisedFund:0
        },
        state => state.raisedFund > 20000);
      console.log("fund raised successfully at $", lastState.raisedFund, "(no deadline)");

    }catch(e){
      console.log("fund is not sufficient",e);
    }
    assert.isAbove(lastState.raisedFund, 20000, "finally fund has been raised successfully");
    await testTillEnd;

  });

  it("can not raise sufficient fund eventhough everyone contributes", async () => {
    var testTillEnd = Promise.resolveAfter({},60);
    console.log("\r");
    var fundRef = null;
    try{
      var lastState = await ["Tom","Dick","Harry"].awaitTill(
        async (person, scope) => {
          var amount = await raiseFundFrom(person);
          scope.raisedFund+=amount;
        },
        {
          raisedFund:0
        },
        state => state.raisedFund > 30000);
      fundRef = lastState;
      console.log("fund raised successfully at $", lastState.raisedFund, "(no deadline)");
      assert.isNotOk("this", "should not reach this line of code");
    }catch(e){
      fundRef = e;
      console.log("fund is not sufficient, only $", e.raisedFund, "(target was $ 30000)");
      assert.isOk("this", "should reach this line of code");
    }
    assert.isBelow(fundRef.raisedFund, 30000, "finally fund has not been raised successfully");
    await testTillEnd;
  });

  it("can raise sufficient fund from only two persons before deadline", async () => {
    var testTillEnd = Promise.resolveAfter({},60);
    console.log("\r");
    var countCheck = 0;
    try{
      var lastState = await ["Tom","Dick","Harry"].awaitTill(
        async (person, scope) => {
          var amount = await raiseFundFrom(person);
          scope.raisedFund+=amount;
          countCheck++;
        },
        {
          raisedFund:0
        },
        state => state.raisedFund > 15000,
        30);
      console.log("fund raised successfully at", lastState.raisedFund, "before deadline");
    }catch(e){
      console.log("fund is not sufficient, only $", e.raisedFund, "(target is $ 15000)");
    }
    assert.isAbove(lastState.raisedFund, 15000, "finally fund has not been raised successfully");
    assert.equal(countCheck,2, "there are 2 contributors at the moment fund raised successfully");
    await testTillEnd;

  });

  it("can raise sufficient from all people but only after deadline", async () => {
    var testTillEnd = Promise.resolveAfter({},60);
    console.log("\r");
    var countCheck = 0;
    var fundRef = null;
    try{
      var lastState = await ["Tom","Dick","Harry"].awaitTill(
        async (person, scope) => {
          var amount = await raiseFundFrom(person);
          scope.raisedFund+=amount;
          countCheck++;
        },
        {
          raisedFund:0
        },
        state => state.raisedFund > 20000,
        30);
      console.log("fund raised successfully at $", lastState.raisedFund, "before deadline");
      fundRef = lastState;
      assert.isNotOk("this", "should not reach this line of code");
    }catch(e){
      fundRef = e;
      console.log("fund is not sufficient, only $", e.raisedFund, "(target is $ 20000)");
      assert.isOk("this", "should reach this line of code");
    }
    assert.isBelow(fundRef.raisedFund, 20000, "at this moment fund has not been raised successfully");
    assert.equal(countCheck,2, "there are only 2 contributors at the moment");
    await testTillEnd;
    assert.equal(countCheck,3, "there are 3 contributors at the moment fund raised successfully");
    assert.isAbove(fundRef.raisedFund, 20000, "finally fund has been raised successfully after deadline");
    console.log("After deadline, fund raised successfully at $", fundRef.raisedFund);

  }).timeout(5000);


});
