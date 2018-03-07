const chai = require("chai");
const assert = chai.assert;
const script = require("../index.js");



describe("Test Promise", () => {
  it("Promise.defer 1", async () => {
      var obj = {};
      var anotherObj = null;
      var deferred = Promise.defer();
      setTimeout(()=>{
        deferred.resolve(obj);
      },100);

      assert.equal(deferred.status,0, "initial status = 0");
      deferred.promise.then((x)=>{
        assert.isOk("this", "should reach this line of code");
        anotherObj = x;
      }, ()=>{
        assert.isNotOk("this", "should not reach this line of code");
      });

      await deferred.promise;
      assert.equal(deferred.status,1, "final status = 1");
      assert.equal(obj, anotherObj, "obj is assigned");
  });
  it("Promise.defer -1", async () => {
      var obj = {};
      var anotherObj = null;
      var deferred = Promise.defer();
      setTimeout(()=>{
        deferred.reject(obj);
      },100);

      assert.equal(deferred.status,0, "initial status = 0");
      deferred.promise.then(()=>{
        assert.isNotOk("this", "should not reach this line of code");
      },(x)=>{
        assert.isOk("this", "should reach this line of code");
        anotherObj = x;
      });
      try{
        await deferred.promise;
      }catch(e){

      }
      assert.equal(deferred.status, -1, "final status = -1");
      assert.equal(obj, anotherObj, "obj is assigned");
  });

  it("Promise.resolveAfter",async () => {
    var obj = {};
    var anotherObj = null;
    var hasTimeout1=false;
    setTimeout(()=>{
      hasTimeout1=true;
    },10);
    var hasTimeout2=false;
    setTimeout(()=>{
      hasTimeout2=true;
    },30);
    try{
      anotherObj = await Promise.resolveAfter(obj,20);
      assert.isOk("this", "should reach this line of code");
    }catch(e){
      assert.isNotOk("this", "should not reach this line of code");
    }
    assert.isTrue(hasTimeout1, "has been timeout after 500ms");
    assert.isFalse(hasTimeout2, "has not been timeout after 1500ms");
    assert.equal(obj,anotherObj, "object should be returned by the promise");
  });
  it("Promise.rejectAfter",async () => {
    var obj = {};
    var anotherObj = null;
    var hasTimeout1=false;
    var err = null;
    setTimeout(()=>{
      hasTimeout1=true;
    },10);
    var hasTimeout2=false;
    setTimeout(()=>{
      hasTimeout2=true;
    },30);
    try{
      anotherObj = await Promise.rejectAfter(obj,20);
      assert.isNotOk("this", "should not reach this line of code");
    }catch(e){
      err = e;
      assert.isOk("this", "should reach this line of code");
    }
    assert.isTrue(hasTimeout1, "has been timeout after 500ms");
    assert.isFalse(hasTimeout2, "has not been timeout after 1500ms");
    assert.isTrue(anotherObj == null, "another object is null");
    assert.equal(obj, err, "err is equal to obj");
  });
  it("Promise.withDeadline before deadline",async () => {
    var obj = {};
    var anotherObj = null;
    try{
      anotherObj = await Promise.withDeadline((resolve, reject)=>{
        setTimeout(()=>{
          resolve(obj);
        },10);
      },20);
      assert.isOk("this", "should reach this line of code");
    }catch(e){
      assert.isNotOk("this", "should not reach this line of code");
    }
    assert.equal(obj,anotherObj, "object should be returned by the promise");
  });
  it("Promise.withDeadline after deadline",async () => {
    var obj = {};
    var anotherObj = null;
    var err = null;
    try{
      anotherObj = await Promise.withDeadline((resolve, reject)=>{
        setTimeout(()=>{
          resolve(obj);
        },30);
      },20);
      assert.isNotOk("this", "should not reach this line of code");
    }catch(e){
      err = e;
      assert.isOk("this", "should reach this line of code");
    }
    assert.isTrue(anotherObj == null, "another object is null");
    assert.equal(err, null, "err is just a null");
  });
  it("Promise.prototype.thenWithDeadline before deadline",async () => {
    var obj = {};
    var anotherObj = null;
    var p = new Promise((resolve,reject)=>{
      setTimeout(()=>resolve(obj),20);
    });
    p.thenWithDeadline(
      (x)=>{
        anotherObj=x;
        assert.isOk("this", "should reach this line of code");
      },
      ()=>{
        assert.isNotOk("this", "should not reach this line of code");
      }, 30);
    await p;
    assert.equal(obj,anotherObj, "object should be returned by the promise");
  });
  it("Promise.prototype.thenWithDeadline after deadline",async () => {
    var obj = {};
    var anotherObj = null;
    var p = new Promise((resolve,reject)=>{
      setTimeout(()=>resolve(obj),40);
    });
    p.thenWithDeadline(
      (x)=>{
        assert.isNotOk("this", "should not reach this line of code");
      },
      ()=>{
        assert.isOk("this", "should reach this line of code");
      }, 30)
      .catch(e => {
        assert.isOk("this", "should reach this line of code");
      });
    try{
      await p;
      assert.isNotOk("this", "should not reach this line of code");
    }catch(e){
      assert.isOk("this", "should reach this line of code");
    }
  });

});
