const User  = Parse.Object.extend('User')
const Scene = Parse.Object.extend('Scene')



Parse.Cloud.define('getSceneFromId', 
async (request) => 
{
  let jsonSceneId = request.params.jsonSceneId
  let sceneId     = jsonSceneId.id;

  try 
  {
      const s = await new Parse.Query(Scene).equalTo("objectId",sceneId).find()

      return s;
  }
  catch (e) 
  {
    console.log("Could not get scene with id: " +  sceneId );

    return null;
  }
});

Parse.Cloud.define('deleteSceneFromId', 
async (request) => 
{
  let jsonSceneId = request.params.deletedScene
  let sceneId     = jsonSceneId.id;

  try 
  {
    const _scene = await new Parse.Query(Scene).equalTo("objectId",sceneId).find()
    const scene  = _scene[0]

    await scene
    .destroy()
    .then((scene) => 
    {
      // the object was deleted successfully
    }, 
    (error) => 
    {
      // delete operation failed
      return null;
    });
  }
  catch (e) 
  {
    console.log("Could not delete scene with id: " +  sceneId );

    return null;
  }

  return jsonSceneId;
});

Parse.Cloud.define('getScenesOfUser', 
async (request) => 
{
  let jsonUserId = request.params.jsonUserId
  let userId     = jsonUserId.id;

  let _user = await new Parse.Query(User).equalTo("objectId",userId).find()
  let user  = _user[0]

  try 
  {
      const s = await new Parse.Query(Scene).equalTo("user",user).find()
      //console.log("getScenesOfUser");
      //console.log(s);
      return s;
  }
  catch (e) 
  {
      console.log("Could not get the scenes of user id: " +  userId );
      
      return null;
  }
});

Parse.Cloud.define('saveScene', 
async (request) => 
{
  let jsonSavedScene = request.params.savedScene

  console.log("saveScene");
  console.log(jsonSavedScene);

  let userId = jsonSavedScene.user;
  let _user  = await new Parse.Query(User).equalTo("objectId",userId).find()
  let user   = _user[0]

  if(!user)
    return null;

  let sceneId = jsonSavedScene.scene[0].Id

  console.log(sceneId);

  let _scene = await new Parse.Query(Scene).equalTo("user",user).equalTo("objectId",sceneId).find()
  let scene  = _scene[0]

  if (!scene)
  { //New scene
    scene = new Scene()

    let jsonScene  = jsonSavedScene.scene[0];
    let stringJson = JSON.stringify(jsonScene);

    scene.set('json', stringJson)
    scene.set('user', user)
  }
  else
  { 
    // Update existing scene
    let stringJson = JSON.stringify(jsonSavedScene.scene[0]);

    scene.set('json', stringJson)
  }

  try 
  {
    await scene
    .save()
    .then((scene) => 
    {}, 
    (error) => 
    {
        alert('Failed to create new scene, with error code: ' + error.message);
        return null;
    });
  }
  catch (e) 
  {
    console.log("Could not save");
    
    return null;
  }

  return scene.id;
});

Parse.Cloud.afterSave(Scene, 
async (req, res) => 
{
  const obj = req.object

  if (obj.existed() === false) 
  {
    // It's a new object
    console.log('[afterSave] object: ', obj)

    let _id      = obj.id;
    let jsonScene= JSON.parse(obj.get("json"));

    jsonScene.Id = _id;

    let stringJson = JSON.stringify(jsonScene);

    obj.set('json', stringJson)

    try 
    {
      await obj
      .save()
      .then((scene) => 
      {
        console.log("updated new scene successfuly");
      }, 
      (error) => 
      {
          alert('Failed to after save the new scene, with error code: ' + error.message);

          return null;
      });
    }
    catch (e) 
    {
      console.log("Could not save");

      return null;
    }
  } 
  else 
  {
      // It's an existing object
      console.log("object already existed")
  }
})
