#!/usr/bin/env node

'use strict'

const program = require('commander')
const bw = require('./index')
const readline = require('readline')

function list(val) {
	return val.split(',')
}

program
	.version('1.0.0', '-v, --version')
	.usage('<command> [options]')

program
	.command('config')
	.description('Reads configuration parameters from the command line and saves in ~/.bw/config.json')
	.action(function() { config() })

program
	.command('languages')
	.description('Lists the ISO codes of the available languages')
	.action(function() { bw.languages() })

program
	.command('timezones')
	.description('Lists timezones available in Bureau Works')
	.action(function() { bw.timezones() })

program
	.command('services')
	.description('All the Services and IDs available to request projects in Bureau Works')
	.action(function() { bw.services() })

program
	.command('create')
	.description('Creates a new Project in Bureau Works, returns a JSON string  with IDs and relevant information.')
	.option('-r, --reference <reference>', 'Project reference, a string value that you can use to identify this project')
	.option('-l, --language <lang>', 'Project source language')
	.option('-t, --target <langs>', 'Project target languages, ISO codes separated by commas', list)
	.option('-s, --services <services>', 'Long[] with the Service IDs, .e.g, 1 for translation, 3 for transcription; separate with commas', list)
	.option('-n, --note <note>', 'A descriptive note')
	.option('-d, --delivery <longValue>', 'Desired delivery date', parseInt)
	.action(function(cmd, options) { handleCreate(cmd, options) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx create -r \'A reference code\' -l en_us -t pt_br,es,ru_ru,de_de,fr_fr,it_it -s 1 -n \'Project notes, special instructions, etc.\' -d 1535661374000')
		console.log()
})

program
	.command('upload')
	.description('Uploads a file to a project being prepared for production and quoting in Bureau Works, returns a JSON with the Project and Job ID information.')
	.option('-p, --project <projectId>', 'The Project ID')
	.option('-s, --service_item <sid>', 'Service Item ID')
	.option('-f, --file <file>', 'The file in the current filesystem')
	.action(function(cmd, options) { handleUpload(cmd, options) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx upload -p 17530 -s 23207 -f ./files/filename.docx')
		console.log()
})

program
	.command('ready')
	.description('Flags a project as READY, which means you have finished upload files and the system will now quote the project. Returns a JSON with the costs breakdown.')
	.option('-p, --project <projectId>', 'The Project ID')
	.action(function(cmd) { handleReady(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx ready -p 17532')
		console.log()
})

program
	.command('approve')
	.description('Approves a Project in Bureau Works')
	.option('-p, --project <projectId>', 'The Project ID')
	.action(function(cmd) { handleApprove(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx approve -p 17532')
		console.log()
})

program
	.command('cancel')
	.description('Cancels a Project in Bureau Works')
	.option('-p, --project <projectId>', 'The Project ID')
	.action(function(cmd) { handleCancel(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx cancel -p 17532')
		console.log()
})

program
	.command('project')
	.description('Loads Project metadata from Bureau Works')
	.option('-p, --project <projectId>', 'The Project ID')
	.action(function(cmd) { handleProject(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx project -p 17532')
		console.log()
})

program
	.command('list')
	.description('Loads a list of Projects from Bureau Works using status as a parameter')
	.option('-s, --status <status>', 'The Project Status - PREPARING, PENDING, APPROVED, CANCELLED or INVOICED')
	.action(function(cmd) { handleList(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx list -s PENDING')
		console.log()
})


program
	.command('costs')
	.description('Loads the cost structure associated to a given Project')
	.option('-p, --project <projectId>', 'The Project ID')
	.action(function(cmd) { handleCosts(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx costs -p 17532')
		console.log()
})

program
	.command('items')
	.description('Loads the items associated to a given Project')
	.option('-p, --project <projectId>', 'The Project ID')
	.action(function(cmd) { handleItems(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx items -p 17532')
		console.log()
})

program
	.command('approve-job')
	.description('Approves a given Job')
	.option('-p, --project <projectId>', 'The Project ID')
	.option('-j, --job <jobId>', 'The Job ID')
	.action(function(cmd) { handleApproveJob(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx approve-job -p 17532 -j 87432')
		console.log()
})

program
	.command('reject-job')
	.description('Rejects a given Job')
	.option('-p, --project <projectId>', 'The Project ID')
	.option('-j, --job <jobId>', 'The Job ID')
	.action(function(cmd) { handleRejectJob(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx reject-job -p 17532 -j 87432')
		console.log()
})

program
	.command('download')
	.description('Downloads a file given a Job ID')
	.option('-p, --project <projectId>', 'The Project ID')
	.option('-j, --job <jobId>', 'The Job ID')
	.option('-d, --destination <directory>', 'Optional, if passed to the function will save the file in the given directory')
	.action(function(cmd) { handleDownload(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx download -p 17532 -j 87432 -d /files/repo/')
		console.log()
})

program
	.command('download-by-filename')
	.description('Alternate download method, uses Project ID, Service Item ID and a filename. This method is useful for odd deliveries, for example, if a delivery file is split in multiple files or if the delivered file has a different format than that of the input')
	.option('-p, --project <projectId>', 'The Project ID')
	.option('-s, --service_item <sid>', 'The Service Item ID')
	.option('-f, --filename <filename>', 'The filename, including any preceding path components, e.g., /pt_br/filename.docx')
	.option('-d, --destination <directory>', 'Optional, if passed to the function will save the file in the given directory')
	.action(function(cmd) { handleDownloadByFilename(cmd) }).on('--help', function() {
		console.log('  Example:')
		console.log()
		console.log('    $ bwx download-by-filename -p 17532 -s 87432 -f pt_br/file.json -d /files/repo/')
		console.log()
})

program.parse(process.argv)

function config() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})

	let config = {}
	config.url = 'https://bureau.works' 
	config.api_id = ''
	config.api_secret = ''
	config.api_token = ''

	rl.question('Enter API URL (default: https://bureau.works): ', (url) => {
		rl.question('Enter API ID: ', (id) => {
			rl.question('Enter API Secret: ', (secret) => {
				
				if (url && isURL(url)) {
					config.url = url
				}

				if (id) {
					config.api_id = id
				}

				if (secret) {
					config.api_secret = secret
				}

				rl.close()

				bw.login(config)
			})
		})
	})
}

function isURL(str) {
	var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$'
	var url = new RegExp(urlRegex, 'i')
	return str.length < 2083 && url.test(str)
}

function handleCreate(cmd) {
	bw.createProject(cmd.reference, cmd.language, cmd.target, cmd.services, cmd.notes, cmd.delivery)
}

function handleUpload(cmd) {
	bw.uploadFile(cmd.project, cmd.service_item, cmd.file)
}

function handleReady(cmd) {
	bw.readyProject(cmd.project)
}

function handleApprove(cmd) {
	bw.approveProject(cmd.project)
}

function handleCancel(cmd) {
	bw.cancelProject(cmd.project)
}

function handleProject(cmd) {
	bw.getProject(cmd.project)
}

function handleList(cmd) {
	bw.projectsByStatus(cmd.status)
}

function handleCosts(cmd) {
	bw.projectCosts(cmd.project)
}

function handleItems(cmd) {
	bw.projectItems(cmd.project)
}

function handleApproveJob(cmd) {
	bw.approveJob(cmd.project, cmd.job)
}

function handleRejectJob(cmd) {
	bw.rejectJob(cmd.project, cmd.job)
}

function handleDownload(cmd) {
	bw.downloadFileByJobId(cmd.project, cmd.job, cmd.destination)
}

function handleDownloadByFilename(cmd) {
	bw.downloadFile(cmd.project, cmd.service_item, cmd.filename, cmd.destination)
}
