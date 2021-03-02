# parse-dashboard-example

Example project using the [parse-dashboard](https://github.com/ParsePlatform/parse-dashboard) module on Express.

### For Local Development

* Make sure you have at least Node 4.3. `node --version`
* Clone this repo and change directory to it.
* `npm install`
* Prerequisite: Ensure you have the parse-server installed and working
  * Check the parse-server-example project for a quick start: https://github.com/ParsePlatform/parse-server-example
* Run the server with: npm start

### Using it

After starting the dashboard, you can visit http://localhost:4040 in your browser

### Usage
Parse Dashboard can be mounted on an Express app. Express is a web framework for Node.js. The fastest way to get started is to clone the [Parse Dashboard repo](https://github.com/ParsePlatform/parse-dashboard), which at its root contains a sample Express app with the Parse Dashboard API mounted.

The constructor returns an API object that conforms to an [Express Middleware](http://expressjs.com/en/api.html#app.use). This object provides the REST endpoints for a Parse Dashboard app. Create an instance like so:
