#!/usr/bin/env node

'use strict'

const program = require('commander')
const bw = require('./index')

program
	.version('1.0.0')
	.usage('<commands> [options]')
	.command('create')
	.option('-ref, --reference', 'Project reference')
	.option('-src, --source-language', 'Project source language')
	.option('-tgt, --target-language', 'Project target languages')
	.option('-srv, --service', 'Service ID, .e.g, 1 for translation')
	.option('-n, --note', 'A descriptive note')
	.option('-dd, --develivery-date', 'Desired delivery date')
	.option('-d, --destination', 'Destination folder')
	.option('-dd, --delivery-date', 'Desired delivery date')
	.option('-f, --file', 'Input file')
	.option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
	.action(function (dir, cmd) {
		console.log('remove ' + dir + (cmd.recursive ? ' recursively' : ''))
	})
program.parse(process.argv)

//bw.projectItems(17528) 

//bw.downloadFile(17528, 23205, 'pt_br/ohplaces_en_us_pt_br_T_C.txt', '../')

bw.downloadFileByJobId(17528, 53708)

//bw.createProject('reference', 'en_us', ['pt_br','es'], [1], 'some notes', 1535750419000)

//bw.uploadFile(17528, 23205, './ohplaces.txt')

//if (program.peppers) console.log('  - peppers')
//if (program.pineapple) console.log('  - pineapple')
//if (program.bbqSauce) console.log('  - bbq')
//console.log('  - %s cheese', program.cheese)