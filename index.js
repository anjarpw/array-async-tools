class DelayExecutor{
  constructor(func,delay){
    if(delay>0){
      this.timeoutObject = setTimeout(func, delay);
    }
  }
  cancel(){
    if(this.timeoutObject){
      clearTimeout(this.timeoutObject);
    }
  }
}


Promise.defer = function(){
  var ref ={
    status:0
  };

  ref.promise = new Promise((resolve,reject) => {
    ref.resolve = (obj)=>{
      if(ref.status==0){
        ref.status = 1;
        resolve(obj);
      }
    };
    ref.reject = (obj)=>{
      if(ref.status==0){
        ref.status = -1;
        reject(obj);
      }
    };
  });
  return ref;
}

Promise.resolveAfter = function(obj, delay){
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      resolve(obj);
    }, delay);
  });
}

Promise.rejectAfter = function(obj, delay){
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      reject(obj);
    }, delay);
  });
}


Promise.withDeadline = function(resolveRejectFunc, delay){
  var deferred = Promise.defer();
  resolveRejectFunc(deferred.resolve,deferred.reject);
  setTimeout(()=>{
    deferred.reject();
  }, delay);
  return deferred.promise;
}
Promise.prototype.thenWithDeadline = function(resolveFunc, rejectFunc, delay){
  var deferred = Promise.defer();
  var delayExecutor = new DelayExecutor(()=>{
    var p = rejectFunc();
    deferred.reject();
  }, delay);

  this.then(async (obj) => {
    if(deferred.status==0){
      delayExecutor.cancel();
      var p = resolveFunc(obj);
      deferred.resolve(p);
    }
  }, (obj) =>{
    if(deferred.status==0){
      delayExecutor.cancel();
      var p = rejectFunc(obj);
      deferred.reject(p);
    }
  });
  return deferred.promise;
}


Array.prototype.awaitAll  = function(func, delay){
  "use strict";
  var promises = [];
  var deferred = Promise.defer();

  var delayExecutor = new DelayExecutor(()=>{
    deferred.reject();
  }, delay);

  this.forEach(u=>{
    promises.push(func(u));
  });
  Promise.all(promises).then(()=>{
    delayExecutor.cancel();
    deferred.resolve();
  });
  return deferred.promise;
}



Array.prototype.awaitTill = function(func, state, checkFunc, delay){
  "use strict";
  var promises = [];
  var deferred = Promise.defer();

  var delayExecutor = new DelayExecutor(()=>{
    var isTrue = checkFunc(state);
    if(isTrue){
      deferred.resolve(state);
    }else{
      deferred.reject(state);
    }
  }, delay);


  this.forEach(u=>{
    promises.push(func(u, state).then(()=>{
      var isTrue = checkFunc(state);
      if(isTrue){
        delayExecutor.cancel();
        deferred.resolve(state);
      }
    }));
  });
  Promise.all(promises).then(()=>{
    delayExecutor.cancel();
    var isTrue = checkFunc(state);
    if(isTrue){
      deferred.resolve(state);
    }else{
      deferred.reject(state);
    }
  });
  return deferred.promise;
}

Array.prototype.awaitAny = function (func, delay){
  "use strict";
  var deferred = Promise.defer();
  var delayExecutor = new DelayExecutor(()=>{
    deferred.reject();
  }, delay);

  this.forEach(u=>{
    func(u).then((res)=>{
      console.log(res);
      delayExecutor.cancel();
      deferred.resolve({
        item:u,
        result:res
      });
    });
  });
  return deferred.promise;
}

Array.prototype.forEachAsync = async function (func){
  for(var i=0; i< this.length; i++){
    await func(this[i]);
  }
}
