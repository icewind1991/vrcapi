import * as assert from 'assert';
import {Api} from '../src/Api';

if (typeof fetch === 'undefined') {
	global['fetch'] = require('node-fetch');
	global['btoa'] = require('btoa');
}

const api = new Api({
	username: process.env.USERNAME || '',
	password: process.env.PASSWORD || ''
});

suite('Api', () => {
	test('basic user info', () => {
		return api.getUserByName('vrpill').then(user => {
			assert.equal(user.id, 'X3zL7U7wLt');
		});
	});
});
