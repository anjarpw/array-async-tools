const chai = require("chai");
const assert = chai.assert;
const script = require("../index.js");

function getPaymentFrom(person){
  var deferred = Promise.defer();
  var delay = {
    Tom:20,
    Dick:40,
    Harry:30
  }
  setTimeout(()=>{
    console.log(person, "paid his due after", delay[person], "ms");
    deferred.resolve();
  },delay[person]);
  return deferred.promise;
}

describe("Test AwaitAll", () => {
  it("will make everybody pay", async () => {
    var testTillEnd = Promise.resolveAfter({},50);
    console.log("\r");
    var countCheck = 0;

    await ["Tom","Dick","Harry"].awaitAll(async (person)=>{
      await getPaymentFrom(person);
      countCheck++;
    });
    console.log("Now, all have paid the money");
    assert.equal(countCheck, 3, "all have paid their due");
    await testTillEnd;
  });

  it("won't make Dick pay his due before deadline", async () => {
    var testTillEnd = Promise.resolveAfter({},50);
    console.log("\r");
    var countCheck = 0;

    try{
      await ["Tom","Dick","Harry"].awaitAll(async (person)=>{
        await getPaymentFrom(person);
        countCheck++;
      },35);
      assert.isNotOk("this", "should not reach this line of code");
    }catch(e){
      console.log("deadline has been reached");
      assert.isOk("this", "should reach this line of code");
    };
    assert.equal(countCheck, 2, "only 2 have paid the due");
    await testTillEnd;

  });
});
