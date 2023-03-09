const fs = require('fs');
const path = require('path');
const util = require('util');
const knex = require('./knex');

const writeFileAsync = util.promisify(fs.writeFile);


async function verifyUserUploadRights(userId){	
	try {
		const userData = await knex.select('noUploadedFiles','membership_type').from('users').where('id',userId).first();
		if(!userData) throw new Error(`User ${userId} not found in database.`)

		const userMembership = await knex.select('maximumUploadedFiles').from('user_membership').where('type',data.membership_type).first();
		if(!userMembership) throw new Error(`Membership ${userData.membership_type} not found in database.`)

		return data.noUploadedFiles < userMembership.maximumUploadedFiles;
	}catch(err){
		console.error(`Error verifying user ${userId}`);
		return false;
	}
}

async function saveImageToFolder(imageData){
	try {
		const folderPath = './images'; // or 'get it from a config file or db'
		
		const fileExtension = imageData.substring("data:image/".length, imageData.indexOf(";base64"));
		const unixTime = new Date().getDate();
		const guid = broofa_guid();
		const fileName =  `${guid}-${unixTime}.${fileExtension}`;
		
		const filePath = path.join(folderPath, fileName);
		
		await writeFileAsync(filePath, imageData, 'base64');
		console.log(`Image saved to ${filePath}.`);
		return filePath;
	}
	catch(err){
		return null;
	}
}

async function saveImagePath(userId,path){
	try {
		const imageData = await knex('images').insert({
			userId,
			path,
		})
		if(!imageData) throw new Error(`ImageData could not be saved in database with the path of ${path} and userId of ${userId}`);

		// update noUploadedFiles with + 1
		await knex('users')
			.where('id', userId)
			.update({
				noUploadedFiles: knex.raw('?? + 1', ['noUploadedFiles'])
			});
			
		return imageData;
	}catch(err){
		console.error(`Error saving data ${userId}`);
		return false;
	}
}

async function createReferencedLink (imageId,path){
	try {
		const imageLinkReference = await knex('image_link_references')
		.insert({
			imageId,
			path,
			expirationTime : (new Date()). getTime() + 30*60*1000
		});
		return imageLinkReference;
	} catch(err){
		console.error(`Error saving referenced Link for imageId : ${imageId}`);
		return false
	}
}

// user is an object
// imageData is a base64 data

// returns an array of two elements :  [successObj, errorObj]
// where successObj is null if there is an error,
// errorObj is null when the api service finished successfuly.
async function uploadFile(user,imageData){
	// verify user is allowed to upload the file.
	try {
		const userVerified = await verifyUserUploadRights(user.id);
		if(!userVerified) throw new Error('Error verifying user ${userId}')

		// upload File
		const fileUploadedPath = await saveImageToFolder(imageData);
		if(!fileUploadedPath) throw new Error('File was unable to be saved to server folder.');
		
		// file was saved to server and noUploadedFiles incremented.
		const imageDataSaved = await saveImagePath(user.id,fileUploadedPath);
		if(!imageUpdated) throw new Error('File was unable to be saved to database.');

		// create a referenced link.
		const imageReference = await createReferencedLink(imageDataSaved.id,fileUploadedPath);
		return [
			imageReference,
			null
		]
	}
	catch(err){
		return [
			null,
			err.message
		]
	}
}

async function checkImageExpiration(path) {
	try {
		const imageLinkReference = await knex.select('expirationTime').from('image_link_references').where('path',path).first()
		
		const currentTime = new Date().getTime();
		if(expirationTime < currentTime) {
			throw new Error('Image was removed or expiration link is no longer available.')
		}
		return imageLinkReference;
	} catch(err){
		console.error(`Error retrieving referenced Link for path : ${imageId}`);
		return false
	}
}

//  router.js

app.get('/images/:filepath', async (req,res) => {
	try {
		const imagePath = path.join(__dirname, 'images', req.params.filepath); 
		const fileExists = fs.existsSync(imagePath);
		if(!fileExists){
			throw new Error('Image not found');
		}
		const imageReferenceLinkAvailable = await checkImageExpiration(imagePath); 
		if(!imageReferenceLinkAvailable) throw new Error('Image link expired.');


		const extension = path.extname(imagePath).toLowerCase();
		let contentType = 'image/jpeg';
		if (extension === '.png') {
		  contentType = 'image/png';
		} else if (extension === '.gif') {
		  contentType = 'image/gif';
		}
	
		res.set('Content-Type', contentType);
		res.sendFile(imagePath);
	}catch(err){
		return res.status(404).send(err.message);
	}
	
})
