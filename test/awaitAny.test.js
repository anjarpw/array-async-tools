const chai = require("chai");
const assert = chai.assert;
const script = require("../index.js");



function askForVolunteeringFrom(person){
  var deferred = Promise.defer();
  var delay = {
    Tom:15,
    Dick:20,
    Harry:25
  }
  setTimeout(()=>{
    console.log(person, "is willing to be a volunteer after ", delay[person], "ms");
    deferred.resolve("OK, I am in");
  },delay[person]);
  return deferred.promise;
}


describe("Test AwaitAny", () => {
  it("Tom becomes the first volunteer", async () => {
    var testTillEnd = Promise.resolveAfter({},30);
    console.log("\r");
    var countCheck = 0;

    var first = await ["Tom","Dick","Harry"].awaitAny(
      async (person)=>{
        var agreed = await askForVolunteeringFrom(person);
        countCheck++;
        return agreed;
      });
    assert.equal(first.item,"Tom","Tom is first volunter");
    assert.equal(first.result,"OK, I am in","he said so");
    console.log("finally", first.item, "becomes the first volunteer");
    assert.equal(countCheck,1,"only 1 has volunteer at this moment");
    await testTillEnd;
  });

  it("nobody wants to be a volunteer before deadline", async () => {
    var testTillEnd = Promise.resolveAfter({},30);
    console.log("\r");
    var countCheck = 0;

    try{
      await ["Tom","Dick","Harry"].awaitAny(
        async (person)=>{
          var agreed = await askForVolunteeringFrom(person);
          countCheck++;
        },
        10
      );
      assert.isNotOk("this", "should not reach this line of code");

    }catch(e){
      console.log("nobody wants to be a volunteer at this moment");
      assert.isOk("this", "should reach this line of code");
    }
    assert.equal(countCheck,0,"nobody becomes volunteer at this moment");
    await testTillEnd;
  });
});
