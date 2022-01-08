module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/essential",
        "plugin:@typescript-eslint/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 13,
        "parser": "@typescript-eslint/parser",
        "sourceType": "module"
    },
    "plugins": [
        "vue",
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/no-this-alias": [
            "error",
            {
            "allowDestructuring": true, // Allow `const { props, state } = this`; false by default
            "allowedNames": ["device", "user"] // Allow `const vm= this`; `[]` by default
            }
        ]
    }
};
