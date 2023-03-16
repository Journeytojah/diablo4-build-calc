// Define your JSON schema as an object
const schema = require('./schema.json')
var fs = require('fs')
const hexData = "./Druid_Cataclysm.pow"
// Define a function to parse hex data using the schema
function parseHexData(hexData, schema) {
    const rawBytes = Buffer.from(hexData, 'ascii');
    const json = JSON.parse(JSON.stringify(rawBytes)); // Convert byte array to JSON
    const { valid, errors } = validate(json, schema); // Validate the JSON against the schema

    if (!valid) {
        throw new Error(`Invalid data: ${errors}`);
    }

    return json;
}

// Define a function to validate JSON against a schema
function validate(json, schema) {
    const errors = [];
    const validateProperty = (prop, value) => {
        const { valid, errors } = validate(value, prop);
        if (!valid) {
            errors.push(errors);
        }
    };

    if (schema.type === 'object') {
        if (!json || typeof json !== 'object') {
            return { valid: false, errors: 'Expected object' };
        }

        for (const prop in schema.properties) {
            if (json.hasOwnProperty(prop)) {
                const value = json[prop];
                const propSchema = schema.properties[prop];

                if (Array.isArray(value)) {
                    const itemsSchema = propSchema.items;

                    for (const item of value) {
                        validateProperty(itemsSchema, item);
                    }
                } else {
                    validateProperty(propSchema, value);
                }
            } else if (schema.required && schema.required.includes(prop)) {
                return { valid: false, errors: `Missing required property: ${prop}` };
            }
        }
    } else if (schema.type === 'string') {
        if (typeof json !== 'string') {
            return { valid: false, errors: 'Expected string' };
        }
    } else if (schema.type === 'integer') {
        if (typeof json !== 'number' || !Number.isInteger(json)) {
            return { valid: false, errors: 'Expected integer' };
        }
    }

    return { valid: errors.length === 0, errors };
}

// Example usage
// const hexData = hex("./Druid_Cataclysm.pow")
const structuredData = parseHexData(hexData, schema);

console.log(structuredData);
