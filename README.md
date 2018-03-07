# array-async-tools
array extension for asynchronous calls

#### Array.prototype.asyncForEach

it will process one person at a time
```js
    await ["Tom","Dick","Harry"].forEachAsync(
      async (person)=>{
        console.log("trying to serve", person);
        await onlyServe(person);
        console.log(person, "has been served");
      });

```


#### Array.prototype.awaitAll

```js
var countCheck = 0;
await ["Tom","Dick","Harry"].awaitAll(async (person)=>{
      await getPaymentFrom(person);
      countCheck++;
    });
// This will be called only after Tom, Dick, and Harry have completed the payment
console.log(countCheck); // 3
```

#### Array.prototype.awaitAny

will resolve if first promise is resolved;

```js
var countCheck = 0;

function askToBeInitiator(person){
  return new Promise((resolve,reject)=>{
    var delay = Math.floor(Math.random()*10000);
    console.log(person, "is still considering");
    setTimeout(()=> {
      console.log(person, "has decided to be a volunteer");      
      resolve();
      }, delay);  
  });
}

var first = await ["Tom","Dick","Harry"].awaitAny(async (person)=>{
      await askToBeInitiator(person); // resolve if he is willing to be initiator
      countCheck++;
      return "Aye!";
    });
    
// This will be called if any of Tom, Dick, or Harry is willing to be initiator
console.log(countCheck); // 1
console.log(first.item); // either "Tom", "Dick" or "Harry"
console.log(first.result); // "Aye!"

```

#### Array.prototype.awaitTill

will resolve if the result accomplished certain criteria;

```js
var targetDonation = 20000;

var state = {
  totalAmount = 0, // initial amount
  donators = []
}

await ["Tom","Dick","Harry"].awaitTill(async (person, s)=>{
      // let say, 
      // Harry donates 10000 
      // Later, Tom donates 15000, 
      // Dick does not donate
      
      var amount = await getDonationFrom(person); 
      s.totalAmount+=amount;
      s.donators.push(person);
    },
    state,
    // accomplishment criteria
    (s) => s.totalAmount >= targetDonation
    );
    
console.log(state.totalDonation); // 25000
console.log(state.donators); // "Harry", "Tom"

```


# For complete detail, see /test

