const chai = require("chai");
const assert = chai.assert;
const script = require("../index.js");

function onlyServe(person){
  var deferred = Promise.defer();
  var delay = {
    Tom:10,
    Dick:30,
    Harry:20
  }
  setTimeout(()=>{
    console.log(person, "has been served within", delay[person], "ms");
    deferred.resolve();
  },delay[person]);
  return deferred.promise;
}


describe("Test forEachAsync", () => {
  it("serves everybody in series", async () => {
    console.log("\r");
    var stateMarker = {
      Tom:"waiting",
      Dick:"waiting",
      Harry:"waiting",
    };
    function isAnyoneBeingServedNow(){
      return stateMarker.Tom == "being served"
      || stateMarker.Dick == "being served"
      || stateMarker.Harry == "being served";
    }
    await ["Tom","Dick","Harry"].forEachAsync(
      async (person)=>{
        console.log("trying to serve", person);
        stateMarker[person]="being served";
        await onlyServe(person);
        stateMarker[person]="has been served";
        assert.isFalse(isAnyoneBeingServedNow(), "nobody is being served now");
      });
    assert.equal(stateMarker.Tom,"has been served", "Tom has been served");
    assert.equal(stateMarker.Dick,"has been served", "Dick has been served");
    assert.equal(stateMarker.Harry,"has been served", "Harry has been served");
    console.log("everybody is served");
  }).timeout(5000);
});
