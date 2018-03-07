# array-async-tools
array extension for asynchronous calls

This package gives you shortcut for redux.

#### Assumption

  - Action has property **_type_**
  - Action has property **_payload_**
  - other than those two will be ignored

you have action object that looks like:
```sh
await ["Tom","Dick","Harry"].awaitAll(async (person)=>{
      await getPaymentFrom(person);
      countCheck++;
    });
```
