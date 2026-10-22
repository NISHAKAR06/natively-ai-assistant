import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
const { resolveGreetingProbe } = await import(pathToFileURL(
  path.resolve(root, 'dist-electron/electron/llm/manualIdentityRouting.js')).href);

describe('resolveGreetingProbe', () => {
  const greetings = [
    'hi', 'hi!', 'hello', 'hello!', 'hey', 'hey there', 'hi there',
    'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy', 'hola'
  ];

  for (const g of greetings) {
    test(`"${g}" returns immediate polite greeting`, () => {
      assert.equal(resolveGreetingProbe(g), 'Hey! How can I help you today?');
    });
  }

  const nonGreetings = [
    'solve two sum', 'write code for token bucket', 'what model are you?',
    'who made you?', 'tell me about your ML experience', 'how do you handle rate limiting?'
  ];

  for (const ng of nonGreetings) {
    test(`"${ng}" is not a bare greeting`, () => {
      assert.equal(resolveGreetingProbe(ng), null);
    });
  }
});

