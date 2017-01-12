# Inventory-tracker
##### **401 *group project***
[Caleb](https://github.com/maschigokae), [Evan](https://github.com/EWPS07), [Hawa](https://github.com/abdih17), and [Steven](https://github.com/BatemanVO)

[![Build Status](https://travis-ci.org/abdih17/inventory-tracker.svg?branch=staging)](https://travis-ci.org/abdih17/inventory-tracker)
[![Coverage Status](https://coveralls.io/repos/github/abdih17/inventory-tracker/badge.svg?branch=staging)](https://coveralls.io/github/abdih17/inventory-tracker?branch=3-coveralls)

## Overview

- Full CRUD RESTful API, created built with [Express](http://expressjs.com/), [MongoDB](https://www.mongodb.com/cloud/atlas/lp/developers?jmp=search&utm_source=google&utm_campaign=Americas-US-MongoDB-to-Atlas-Brand-Alpha&utm_keyword=mongodb&utm_device=c&utm_network=g&utm_medium=cpc&utm_creative=165394248697&utm_matchtype=e&_bt=165394248697&_bk=mongodb&_bm=e&_bn=g&gclid=Cj0KEQiAzNfDBRD2xKrO4pSnnOkBEiQAbzzeQcni1gz1U6AbEnwmMUR6jnph6ZD5NaWyRb1nxuhMDN0aAnEC8P8HAQ).

- Authorization and Authentication with [Bcrypt](https://www.npmjs.com/package/bcrypt) and [Crypto](https://nodejs.org/api/crypto.html)

## About
### The why
  Many businesses today are using a plethora of different programs to keep track of their shipping, receiving, and inventory. For the most part, these systems manage to get the job done, with no major problems. Some companies however, have daily issues that really should've never been issues in the first place. This API is meant to alleviate, if not solve many of the issues that businesses encounter when dealing with inventory quantities on a daily basis. This API will keep track of what a businesses has to sell, is selling, and what it has on order all in real time. In addition to product information, the API will also keep track of all employee and customer information. This is a one stop shop to handle all of a business' needs.


### The how
  This is a full CRUD RESTful API, built with [Express](http://expressjs.com/) and [MongoDB](https://www.mongodb.com/cloud/atlas/lp/developers?jmp=search&utm_source=google&utm_campaign=Americas-US-MongoDB-to-Atlas-Brand-Alpha&utm_keyword=mongodb&utm_device=c&utm_network=g&utm_medium=cpc&utm_creative=165394248697&utm_matchtype=e&_bt=165394248697&_bk=mongodb&_bm=e&_bn=g&gclid=Cj0KEQiAzNfDBRD2xKrO4pSnnOkBEiQAbzzeQcni1gz1U6AbEnwmMUR6jnph6ZD5NaWyRb1nxuhMDN0aAnEC8P8HAQ). Authorization and Authentication is accomplished with [Bcrypt](https://www.npmjs.com/package/bcrypt) and the native node module, [Crypto](https://nodejs.org/api/crypto.html).


Information will be stored and organized with the following models/mongoose schemas

### Cart Order:
  - For individual orders, that will need to be shipped to customers. This will contain all the Information necessary for a shipping team to get their orders out on time.
  ``` javascript
  const cartOrderSchema = Schema({
    shippingAddress: {type: String, required: true},
    shippingName: {type: String, required: true},
    customerID: {type: Schema.Types.ObjectId, required: true},
    storeID: {type: Schema.Types.ObjectId, required: true},
    products: [{type: Schema.Types.ObjectId, ref: 'cartProduct'}]
  });
  ```

### Cart Product:
  - For holding the product and the quantity of the product in a specific cart.
  ``` javascript
  const cartProductSchema = Schema({
    name: {type: String, required: true},
    desc: {type: String, required: true},
    quantity: {type: Number, required: true},
    cartOrderID: {type: Schema.Types.ObjectId, required: true}
  });
  ```

### Customer:
  - For customer accounts, containing customer info.
  ``` javascript
  const customerSchema = Schema({
    name: {type: String, required: true},
    username: {type: String, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    address: {type: String, required: true},
    currentOrders: [{type: Schema.Types.ObjectId, ref: 'cartOrder'}],
    pastOrders: [{type: String}]
  });
  ```

### Employee:
  - For employee accounts, containing employee info, including privileges for actions through the system.
  ``` javascript
  const employeeSchema = Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    storeID: {type: Schema.Types.ObjectId, required: true},
    admin: { type: Boolean, required: true },
    shipping: { type: Boolean, default: false },
    receiving: { type: Boolean, default: false }
  });
  ```

### Inventory Order:
  - For incoming orders(Orders that will replenish a depleted inventory).
  ``` javascript
  const inventoryOrderSchema = Schema({
    inventories: [{type: Schema.Types.ObjectId, ref: 'inventoryProduct'}],
    storeID: {type: Schema.Types.ObjectId, required: true},
    test: {type: String }
  });
  ```

### Inventory product:
  - For holding current inventory. References the product and the quantity of the individual product.
  ``` javascript
  const inventoryProductSchema = Schema({
    name: { type: String, required: true },
    desc: { type: String, required:  true },
    quantity: { type: Number, required: true },
    inventoryOrderID: { type: Schema.Types.ObjectId },
    storeID: { type: Schema.Types.ObjectId, ref: 'store' }
  });
  ```

### Store model:
  - Everything else connects to the store.  
  ``` javascript
  const storeSchema = Schema({
    name: {type: String, required: true},
    storeNumber: {type: String, required: true, unique: true},
    address: {type: String, required: true},
    timestamp: {type: Date, default: Date.now()},
    employees: [{type: Schema.Types.ObjectId, ref: 'employee'}],
    incoming: [{type: Schema.Types.ObjectId, ref:'inventoryOrder'}],
    outgoing: [{type: Schema.Types.ObjectId, ref: 'cartOrder'}],
    current: [{type: Schema.Types.ObjectId, ref: 'inventory'}]
  });
  ```

*Models*

## Getting started
Start by cloning this repository:
`git clone <this repo>`

Install the dependencies:
`npm i`

## How can this API help you or your business?
- All needs are handled within one system.
- No miscommunication between one program to another.
- Up-to-date info, all the time.
- Operations are employee/privilege specific.

## Examples for reference

Base URL: [http://inventory-tracker-staging.herokuapp.com](http://inventory-tracker-staging.herokuapp.com)


`POST`


`GET`

`PUT`

`DELETE`
