import * as assert from 'assert';
import {Api} from '../src/Api';
import {InstaceAccessTag} from '../src/Data';

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

	test('basic world info', () => {
		return api.getWorldById('wrld_8ef393c0-a985-4d7e-90f0-33ab10d41ee3').then(world => {
			assert.equal(world.name, 'Avatar Testing!');
			assert.equal(world.authorId, 'usr_087a641b-da47-4999-b9b5-cd70ee9b904d');
		});
	});

	test('basic instance info', () => {
		return api.getWorldById('wrld_8ef393c0-a985-4d7e-90f0-33ab10d41ee3')
			.then(world => {
				for (const instanceId of world.instances.keys()) {
					if (instanceId.instance.length < 16) { // public
						return instanceId;
					}
				}
				throw new Error('No public instance found');
			})
			.then(api.getInstanceById.bind(api))
			.then(instance => {
				assert.equal(instance.access, InstaceAccessTag.Public);
			});
	});

	test('friends+ instance info', () => {
		return api.getWorldById('wrld_8ef393c0-a985-4d7e-90f0-33ab10d41ee3')
			.then(world => {
				for (const instanceId of world.instances.keys()) {
					if (instanceId.instance.indexOf('hidden') !== -1) { // friends+
						return instanceId;
					}
				}
				throw new Error('No public instance found');
			})
			.then(api.getInstanceById.bind(api))
			.then(instance => {
				assert.equal(instance.access, InstaceAccessTag.FriendsPlus);
			});
	});
});
