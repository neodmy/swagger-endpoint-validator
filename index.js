const debug = require('debug')('swagger-endpoint-validator');

const { SUPPORTED_FORMATS } = require('./lib/constants');
const customErrorHandler = require('./lib/customErrorHandler');
const normalizeOptions = require('./lib/normalizeOptions');
const openAPISpecification = require('./lib/openAPISpecification');
const validationEndpoint = require('./lib/validationEndpoint');
const validator = require('./lib/validator');
const errorFactory = require('./lib/errors');

const SwaggerValidatorError = errorFactory('swagger_validator');

/**
 * Initializes the Swagger endpoint validator.
 * @param {Object} app - Express application object.
 * @param {Object} options - Configuration object.
 * @param {boolean} [options.validateRequests=true] - true to validate the requests.
 * @param {boolean} [options.validateResponses=true] - true to validate the responses.
 * @param {string} [options.validationEndpoint=null] - endpoint to do schemas validation agains the OpenAPI schema.
 * @param {string} options.format - format of the OpenAPI specification documentation.
 * @param {Object} [options.yaml={}] - Extra configuration when format = 'yaml'.
 * @param {string} [options.yaml.file=null] - path of the yaml file containing the OpenAPI specification.
 * @param {Object} [options.yaml_jsdoc={}] - Extra configuration when format = 'yaml_jsdoc'.
 * @param {Object} [options.jsdoc={}] - Extra configuration when format = 'jsdoc'.
 */
const init = async (app, options) => {
	debug('Initializing middleware for this express app...');

	if (!options.format || !Object.values(SUPPORTED_FORMATS).includes(options.format)) {
		throw SwaggerValidatorError(`You need to specify the format used in the options. Supported values are ${Object.values(SUPPORTED_FORMATS).join(',')}`);
	}

	const normalizedOptions = normalizeOptions(options);
	const spec = await openAPISpecification.generate(app, normalizedOptions);
	await validator.init(app, normalizedOptions, spec);
	validationEndpoint.add(app, normalizedOptions);
	customErrorHandler.add(app);

	debug('Middleware initialized!');
};

module.exports = {
	init,
};
