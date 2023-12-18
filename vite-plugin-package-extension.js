/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { cp, readFile, rm, writeFile } from 'fs/promises';
import path from 'path';
import { version } from './package.json';
import { videoPlatformOrigins } from './src/lib/services/video-platforms';

const mode = process.env.MODE || 'development';
const distPath = path.resolve('./dist');
const distPathTemp = path.resolve(`./dist/${mode}`);
const distPathChrome = `${distPathTemp}-chrome`;
const distPathFirefox = `${distPathTemp}-firefox`;

/**
 * Load an existing JSON file, modify the content, and save the file.
 * @param {string} filePath Absolute path to the JSON file.
 * @param {(object) => void} update Function to update the JSON object.
 */
const updateJSON = async (filePath, update) => {
  const obj = JSON.parse(await readFile(filePath));

  update(obj);
  await writeFile(filePath, JSON.stringify(obj, null, 2));
};

/**
 * Create a ZIP archive.
 * @param {string} directory Absolute path to the directory to be archived.
 * @param {string} archivePath Absolute path to the ZIP file.
 */
const makeArchive = async (directory, archivePath) => {
  const archive = archiver('zip');

  archive.pipe(createWriteStream(archivePath));
  archive.directory(directory, false);
  await archive.finalize();
};

/**
 * Package the extension for Chrome.
 */
const packageChromeExtension = async () => {
  console.log('Packaging Chrome extension...');

  await rm(distPathChrome, { recursive: true, force: true });
  await cp(distPathTemp, distPathChrome, { recursive: true });
  await rm(`${distPathChrome}/background.html`);
  await makeArchive(distPathChrome, `${distPath}/vm-${mode}-chrome.zip`);
};

/**
 * Package the extension for Firefox.
 */
const packageFirefoxExtension = async () => {
  console.log('Packaging Firefox extension...');

  await rm(distPathFirefox, { recursive: true, force: true });
  await cp(distPathTemp, distPathFirefox, { recursive: true });
  await updateJSON(`${distPathFirefox}/manifest.json`, (obj) => {
    Object.assign(obj, {
      // Add Firefox-specific settings
      browser_specific_settings: {
        gecko: { id: 'videomark@webdino.org', strict_min_version: '109.0' },
        gecko_android: { id: 'videomark@webdino.org', strict_min_version: '109.0' },
      },
      // Downgrade to MV2
      manifest_version: 2,
      permissions: ((permissions) => {
        permissions.splice(permissions.indexOf('declarativeNetRequestWithHostAccess'), 1);
        permissions.push('webRequestBlocking', '<all_urls>');

        return permissions;
      })([...obj.permissions]),
      background: { page: 'background.html' },
      browser_action: obj.action,
      web_accessible_resources: obj.web_accessible_resources[0].resources,
      action: undefined,
      host_permissions: undefined,
      declarative_net_request: undefined,
    });
  });
  await rm(`${distPathFirefox}/request_rules.json`);
  await makeArchive(distPathFirefox, `${distPath}/vm-${mode}-firefox.xpi`);
};

/**
 * Package an extension for different browsers by modifying the manifest file.
 * @returns {import('vite').Plugin} Vite plugin.
 * @see https://vitejs.dev/guide/api-plugin
 * @see https://rollupjs.org/plugin-development/
 */
export default function packageExtension() {
  return {
    name: 'package-extension',
    closeBundle: {
      async: true,
      sequential: true,
      handler: async () => {
        console.log('Packaging started.');

        await updateJSON(`${distPathTemp}/manifest.json`, (obj) => {
          obj.version = version;
          obj.content_scripts[0].matches = videoPlatformOrigins
            .map((origin) => `${origin}/*`)
            .sort();
        });
        await updateJSON(`${distPathTemp}/request_rules.json`, (obj) => {
          obj[0].condition.initiatorDomains = videoPlatformOrigins
            .map((origin) => origin.replace(/^https:\/\/(?:\*\.)?/, ''))
            .sort();
        });
        await Promise.all([packageChromeExtension(), packageFirefoxExtension()]);
        await rm(distPathTemp, { recursive: true });

        console.log('Packaging complete.');
      },
    },
  };
}
