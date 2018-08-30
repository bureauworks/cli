'use strict'

const request = require('request')
const fs = require('fs')
const download = require('download')
const path = require('path')
const url = require('url')
const config = require('./config-local.json')

function req(method, endpoint, callback, body, formData, contentType) {

	if (!contentType) {
		contentType = 'application/json'
	}

	let options = {
		uri: config.url + endpoint,
		method: method,
		body: body,
		formData: formData,
		headers: {
			'Content-Type': contentType,
			'User-Agent': 'BWX',
			'x-auth-token': config.api_token
		}
	}

	if (!callback) {
		request(options, default_callback)
	} else {
		request(options, callback)
	}
}

function default_callback (error, response, body) {
	if (error) {
		console.log(error)
		return
	}
	console.log(body)
}

function login () {

	let data = {
		'accesskey': config.api_id,
		'secretAccesskey': config.api_secret
	}

	let options = {
		uri: config.url + '/api/pub/v1/login',
		body: JSON.stringify(data),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	}

	request(options, function (error, response) {
		
		if (error) {
			console.error('Something went wrong: ' + error)
			return
		}
		
		config.api_token = response.headers['x-auth-token']

		fs.writeFileSync('./config.json', JSON.stringify(config, null, 2))
	})
}

exports.login = function () {
	login()
}

exports.languages = function () {
	req('GET', '/api/pub/v1/language')
}

exports.timezones = function () {
	req('GET', '/api/pub/v1/timezone')
}

exports.services = function () {
	req('GET', '/api/pub/v1/service')
}

/**
 * Create a project in Bureau Works
 * @param {string} ref - a reference for the project
 * @param {string} src - source language
 * @param {string[]} tgt - an array with the target languages
 * @param {long[]} services - array with service IDs
 * @param {string} notes - some notes to go with the project information
 * @param {long} dd - desired delivery date
 */
exports.createProject = function (ref, src, tgt, services, notes, dd) {
	let body = {
		'reference' : ref,
		'sourceLanguage' : src,
		'targetLanguages' : tgt,
		'services' : services,
		'notes' : notes,
		'desiredDeliveryDate' : dd
	}

	req('POST', '/api/pub/v1/project', null, JSON.stringify(body))
}

/**
 * Upload file to a project
 * @param {long} projectId - the project ID returned in the project creation call
 * @param {long} serviceItemId - the service item ID, which comes inside the items array
 * @param {string} file - the file path
 */
exports.uploadFile = function (projectId, serviceItemId, file) {

	let formData = {
		file: fs.createReadStream(file)
	}

	req('POST', `/api/pub/v1/project/${projectId}/file/${serviceItemId}`, null, null, formData, null)
}

exports.readyProject = function (projectId) {
	req('POST', `/api/pub/v1/project/${projectId}/ready`)
}

exports.approveProject = function (projectId) {
	req('POST', `/api/pub/v1/project/${projectId}/approve`)
}

exports.completeProject = function (projectId) {
	req('POST', `/api/pub/v1/project/${projectId}/complete`)
}

exports.cancelProject = function (projectId) {
	req('POST', `/api/pub/v1/project/${projectId}/cancel`)
}

exports.projectsByStatus = function (status) {
	req('GET', `/api/pub/v1/project/?status=${status}`)
}

exports.getProject = function (projectId) {
	req('GET', `/api/pub/v1/project/${projectId}`)
}

exports.newDueDate = function (projectId, dueDate) {
	req('POST', `/api/pub/v1/project/${projectId}/due_date/${dueDate}`)
}

exports.projectItems = function (projectId) {
	req('GET', `/api/pub/v1/project/${projectId}/items`)
}

exports.approveJob = function (projectId, jobId) {
	req('POST', `/api/pub/v1/project/${projectId}/approve-job/${jobId}`)
}

exports.rejectJob = function (projectId, jobId, message) {
	req('POST', `/api/pub/v1/project/${projectId}/reject-job/${jobId}`, null, message)
}

exports.downloadFile = function (projectId, serviceItemId, filename, destinationPath, outputUrl) {

	function callback (error, response, body) {
		if (error) {
			console.log(error)
			return
		}

		if (outputUrl) {
			console.log(body)
		}

		if (!destinationPath) {
			destinationPath = './'
		}

		let json = JSON.parse(body)

		// get just the filename component, it may be path/filename
		let f = path.posix.basename(filename)

		download(json.signed_request).pipe(fs.createWriteStream(`${destinationPath}/${f}`))
	}

	req('GET', `/api/pub/v1/project/${projectId}/${serviceItemId}/${filename}/`, callback)
}

exports.downloadFileByJobId = function (projectId, jobId, destinationPath, outputUrl) {

	function callback (error, response, body) {
		if (error) {
			console.log(error)
			return
		}

		if (outputUrl) {
			console.log(body)
		}

		let json = JSON.parse(body)

		// get path component of url, last part is filename
		let urlPath = url.parse(json.signed_request).pathname
		let filename = path.posix.basename(urlPath)

		if (!destinationPath) {
			destinationPath = './'
		}

		download(json.signed_request).pipe(fs.createWriteStream(`${destinationPath}/${filename}`))
	}

	req('GET', `/api/pub/v1/project/${projectId}/delivered/${jobId}`, callback)
}
