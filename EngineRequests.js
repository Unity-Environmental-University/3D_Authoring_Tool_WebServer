// Delete Scene

async function Process_DeleteScene(_requestBody, _reponse)
{
	try
	{
		let deletedScene = JSON.parse(_requestBody)

		Parse.Cloud.run('deleteSceneFromId', { deletedScene })

		.then((deletedSceneId) => 
		{
			console.log("Delete " + deletedSceneId);

			res.send(deletedSceneId.id);
		})

		.catch((error) =>
		{
			console.log("Error: " + error.code + " " + error.message);

			res.send("error");
		});
	} 
	catch (e) 
	{ 
	  res.send(false) 
	}
}

function Handle_DeleteScene(_request, _response)
{
	console.log("[200] " + _request.method + " to " + _request.url);

	_response.statusCode = 200
  
	var requestBody = "";
  
	_request.on('data', (chunk) => { requestBody += chunk; });
	_request.on('end', Process_DeleteScene(reqeustBody, _reponse));
}


// Feedback 

async function ProcessFeedback(_requestBody, _response)
{
	let parsedRequest = JSON.parse(_requestBody)

	var description  = parsedRequest.user  +" sent the following feedback:\n";
		description += parsedRequest.feedback;

	var mailOptions = 
	{
		from:     process.env.EMAIL_NAME,
		to:       process.env.EMAIL_NAME,
		subject: 'Feedback from: ' + parsedRequest.user,
		text:     description
	};

	try
	{
		transporter.sendMail
		(mailOptions, (error, info) =>
		{
			if (error) 
			{
				console.log(error);
			
				_response.send(null);
			} 
			else 
			{
				_response.send('Email sent: ' + info.response);
				console  .log ('Email sent: ' + info.response);
			}
		});
	}
	catch(e)
	{
		_response.send(null);
	}	
}

function Handle_Feedback(_request, _response)
{
	console.log("[200] " + _request.method + " to " + _request.url);

	_response.statusCode = 200

	var requestBody = "";

	// Add every chunk to the request body.
	_request.on('data', (chunck) => { requestBody += chunk;});

	// Process the feedback of the request.
	_request.on('end', ProcessFeedback(requestBody, _response));
}


// Load Scene

async function Process_LoadScene(_requestBody, _reponse)
{
	try
	{
		let jsonSceneId = JSON.parse(requestBody)

		console.log(jsonSceneId.id);

		Parse.Cloud.run('getSceneFromId', { jsonSceneId })

		// Provide retrived scene.
		.then((scenes) => 
		{
			let scene = scenes[0];

			console  .log (scene.get("json"));
			_response.send(scene.get("json"));

		})

		.catch(console.log)
	} 
	catch (e) 
	{ 
		_response.send(false) 
	}	
}

function Handle_LoadScene(_request, _response)
{
	console.log("[200] " + _request.method + " to " + _request.url);

	_response.statusCode = 200

	var requestBody = "";

	_request.on('data', (chunk) => { requestBody += chunk; });
	_request.on('end', Process_LoadScene(requestBody, _reponse));
}


// Load Scenes

async function Process_LoadScenes(_reqeustBody, _response)
{
	try
	{
		let jsonUserId = JSON.parse(requestBody)

		Parse.Cloud.run('getScenesOfUser', { jsonUserId })

		.then((scenes) => 
		{
			let jsonscenes = []

			for (var a in scenes)
			{
				let scene = scenes[a]

				jsonscenes.push(JSON.parse(scene.get("json")));
			}

			_response.send(jsonscenes);
		})

		.catch(console.log)
	} 
	catch (e) 
	{ 
		_response.send(false) 
	}
}

function Handle_LoadScenes(_request, _response)
{
	console.log("[200] " + _request.method + " to " + _request.url);

	_response.statusCode = 200
  
	var requestBody = "";
  
	_request.on('data', (chunk) => { requestBody += chunk; });
	_request.on('end', Process_LoadScenes(requestBody, _response));
}


// Login

async function Process_Login(_requestBody, _response)
{
	try
	{
		let jsonUSer = JSON.parse(requestBody)
		let username = jsonUSer.user
		let pwd      = jsonUSer.pwd

		//console.log(username);
		//console.log(pwd);

		var user = Parse.User.logIn(username, pwd)

		// For User
		.then((user) =>
		{
			console.log
			(
				'User created successful with name: ' + 
				user.get("username") + 
				' and email: ' + 
				user.get("email")
			);

			let userInfo = user.id+"|"+user.get("email");

			_response.send(userInfo);
		})

		// On Error.
		.catch((error) =>
		{
			console.log("Error: " + error.code + " " + error.message);

			_response.send("invalid");
		});
	} 
	catch (e) 
	{ 
		_response.send("timeout"); 
	}	
}

function Handle_Login(_request, _response)
{
	console.log("[200] " + _request.method + " to " + _request.url);

	_response.statusCode = 200

	var requestBody = "";

	_request.on('data', (chunk) => { requestBody += chunk });
	_request.on('end', Process_Login(requestBody, _response));
}


// Model Request

async function Process_ModelRequest(_requestBody, _response)
{
	let parsedRequest = JSON.parse(_requestBody)
  
	var model       = parsedRequest.model;
	var description = parsedRequest.user  +" requested a : " + model +"\n\n";

	description += "Description: \n";
	description += parsedRequest.description

	var mailOptions = 
	{
		from:    process.env.EMAIL_NAME,
		to:      process.env.EMAIL_NAME,
		subject: 'Model Request: ' + model,
		text:    description
	};

	try
	{
		transporter.sendMail(mailOptions, (error, info) =>
		{
			if (error) 
			{
				console.log(error);

				_response.send(null);
			} 
			else 
			{
				_response.send('Email sent: ' + info.response);
				console  .log ('Email sent: ' + info.response);
			}
		});
	}
	catch(e)
	{
		_response.send(null);
	}
}

function Handle_ModelRequest(_request, _response)
{
	console.log("[200] " + _request.method + " to " + _request.url);

	_response.statusCode = 200
  
	var requestBody = "";
  
	_request.on('data', (chunk) => { requestBody += chunk; });

	_request.on('end', Process_ModelRequest(requestBody, _response));
}


// Save Scene

async function Process_SaveScene(_requestBody, _response)
{
	try
	{
		let savedScene = JSON.parse(_requestBody)

		Parse.Cloud.run('saveScene', { savedScene })

		.then((savedSceneId) => 
		{
			console  .log (savedSceneId);
			_response.send(savedSceneId);
		})

		.catch((error) =>
		{
			console.log("Error: " + error.code + " " + error.message);

			_response.send("error");
		});
	} 
	catch (e) 
	{ 
		_response.send(false) 
	}
}

function Handle_SaveScene(_request, _response)
{
	console.log("[200] " + _request.method + " to " + _request.url);

	_response.statusCode = 200

	var requestBody = "";

	_request.on('data', (chunk) => { requestBody += chunk; });
	_request.on('end', Process_SaveScene(reqeustBody, _response));
}